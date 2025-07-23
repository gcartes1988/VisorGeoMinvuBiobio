import { useEffect, useState } from "react";
import Select from "react-select";
import api from "../services/api";
import VistaPreviaGeojson from "./VistaPreviaGeojson";
import { useNavigate } from "react-router-dom";
import proj4 from "proj4";
import "../css/formularios.css";

proj4.defs("EPSG:32718", "+proj=utm +zone=18 +south +datum=WGS84 +units=m +no_defs");

const convertirArcGISToPolygonGeoJSON = (arcgisJson) => {
  const coordsUTM = arcgisJson.rings?.[0];
  if (!coordsUTM || !Array.isArray(coordsUTM)) return null;

  const coordsLatLon = coordsUTM.map(([x, y]) =>
    proj4("EPSG:32718", "EPSG:4326", [x, y])
  );

  const closed = [...coordsLatLon];
  if (
    closed.length > 0 &&
    (closed[0][0] !== closed[closed.length - 1][0] ||
      closed[0][1] !== closed[closed.length - 1][1])
  ) {
    closed.push(closed[0]);
  }

  return {
    type: "Polygon",
    coordinates: [closed],
  };
};

const FormularioParque = ({ modoEdicion = false, parqueId = null, proyectoIdSeleccionado = null }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    direccion: "",
    superficie_ha: "",
    comuna_id: null,
    fuente_financiamiento_id: null,
    proyecto_id: null,
    geometria: JSON.stringify({
      type: "Polygon",
      coordinates: [
        [
          [-73.051, -36.828],
          [-73.05, -36.829],
          [-73.049, -36.8285],
          [-73.051, -36.828]
        ]
      ]
    }, null, 2),
  });

  const [geoValido, setGeoValido] = useState(true);
  const [comunas, setComunas] = useState([]);
  const [fuentes, setFuentes] = useState([]);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  // Cargar proyecto_id si se pasa como prop
  useEffect(() => {
    if (proyectoIdSeleccionado) {
      setFormData((prev) => ({ ...prev, proyecto_id: proyectoIdSeleccionado }));
    }
  }, [proyectoIdSeleccionado]);

  useEffect(() => {
    const fetchData = async () => {
      const [resComunas, resFuentes] = await Promise.all([
        api.get("/comunas"),
        api.get("/fuente-financiamiento"),
      ]);
      setComunas(resComunas.data);
      setFuentes(resFuentes.data);

      if (modoEdicion && parqueId) {
        const res = await api.get(`/parques`);
        const parque = res.data.find((p) => p.id === Number(parqueId));
        if (parque) {
          setFormData({
            nombre: parque.nombre,
            direccion: parque.direccion || "",
            superficie_ha: parque.superficie_ha || "",
            comuna_id: parque.comuna_id,
            fuente_financiamiento_id: parque.fuente_financiamiento_id,
            proyecto_id: parque.proyecto_id,
            geometria: JSON.stringify(parque.geometria, null, 2),
          });
        }
      }
    };

    fetchData();
  }, [modoEdicion, parqueId]);

  const handleChange = (field, value) => {
    if (field === "geometria") {
      try {
        const parsed = JSON.parse(value);
        if (parsed.rings && parsed.spatialReference?.wkid === 32718) {
          const polygon = convertirArcGISToPolygonGeoJSON(parsed);
          if (polygon) {
            setFormData((prev) => ({ ...prev, geometria: JSON.stringify(polygon, null, 2) }));
            setGeoValido(true);
          } else {
            setFormData((prev) => ({ ...prev, geometria: value }));
            setGeoValido(false);
          }
        } else if (parsed.type === "Polygon" && parsed.coordinates) {
          setFormData((prev) => ({ ...prev, geometria: value }));
          setGeoValido(true);
        } else {
          setFormData((prev) => ({ ...prev, geometria: value }));
          setGeoValido(false);
        }
      } catch {
        setFormData((prev) => ({ ...prev, geometria: value }));
        setGeoValido(false);
      }
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");

    let geoObjeto;
    try {
      geoObjeto = JSON.parse(formData.geometria);
    } catch (e) {
      setError("❌ Geometría inválida");
      return;
    }

    console.log("🧾 Proyecto ID actual:", formData.proyecto_id);  // <- console log agregado

    if (!formData.proyecto_id) {
      setError("❌ No se ha asociado un proyecto válido.");
      return;
    }

    const payload = {
      ...formData,
      superficie_ha: parseFloat(formData.superficie_ha) || null,
      geometria: geoObjeto,
    };

    try {
      if (modoEdicion) {
        const res = await api.put(`/parques/${parqueId}`, payload);
        setMensaje(res.data.mensaje || "✅ Actualizado correctamente");
      } else {
        await api.post("/parques", payload);
        setMensaje("✅ Parque creado correctamente");
      }

      setTimeout(() => navigate("/admin/parques"), 1000);
    } catch (err) {
      const msg = err.response?.data?.detail || "❌ Error al guardar el parque";
      setError(msg);
    }
  };

  return (
    <form className="formulario" onSubmit={handleSubmit}>
      <h2>{modoEdicion ? "Editar Parque" : "Crear Parque"}</h2>

      <label>Nombre</label>
      <input type="text" value={formData.nombre} onChange={(e) => handleChange("nombre", e.target.value)} required />

      <label>Dirección</label>
      <input type="text" value={formData.direccion} onChange={(e) => handleChange("direccion", e.target.value)} />

      <label>Superficie (ha)</label>
      <input type="number" step="0.01" value={formData.superficie_ha} onChange={(e) => handleChange("superficie_ha", e.target.value)} />

      <label>Comuna</label>
      <Select
        options={comunas.map((c) => ({ value: c.id, label: c.nombre }))}
        value={comunas.find((c) => c.id === formData.comuna_id) && {
          value: formData.comuna_id,
          label: comunas.find((c) => c.id === formData.comuna_id)?.nombre,
        }}
        onChange={(opt) => handleChange("comuna_id", opt.value)}
      />

      <label>Fuente de Financiamiento</label>
      <Select
        options={fuentes.map((f) => ({ value: f.id, label: f.nombre }))}
        value={fuentes.find((f) => f.id === formData.fuente_financiamiento_id) && {
          value: formData.fuente_financiamiento_id,
          label: fuentes.find((f) => f.id === formData.fuente_financiamiento_id)?.nombre,
        }}
        onChange={(opt) => handleChange("fuente_financiamiento_id", opt?.value || null)}
        isClearable
      />

      <label>Geometría (GeoJSON o ArcGIS JSON)</label>
      <textarea
        rows={6}
        value={formData.geometria}
        onChange={(e) => handleChange("geometria", e.target.value)}
        required
        style={{ border: `2px solid ${geoValido ? "green" : "red"}`, width: "100%", fontFamily: "monospace", padding: "8px" }}
      />
      <small style={{ color: geoValido ? "#666" : "red" }}>
        {geoValido ? "✅ Geometría válida (GeoJSON o ArcGIS JSON transformado)" : "❌ Formato no reconocido o inválido."}
      </small>

      <VistaPreviaGeojson geojsonString={formData.geometria} tipoEsperado="Polygon" />

      {error && <p className="error">{Array.isArray(error) ? error.join(" / ") : error}</p>}
      {mensaje && <p className="success">{mensaje}</p>}

      <button type="submit">{modoEdicion ? "Actualizar" : "Crear"}</button>
    </form>
  );
};

export default FormularioParque;
