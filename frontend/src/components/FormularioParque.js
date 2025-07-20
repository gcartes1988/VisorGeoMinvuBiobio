// ✅ src/components/FormularioParque.jsx
import { useEffect, useState } from "react";
import Select from "react-select";
import api from "../services/api";
import VistaPreviaGeojson from "./VistaPreviaGeojson";
import { useUser } from "../context/UserContext";
import proj4 from "proj4";
import "../css/formularios.css";

proj4.defs("EPSG:32718", "+proj=utm +zone=18 +south +datum=WGS84 +units=m +no_defs");

const convertirArcGISToGeoJSON = (arcgisJson) => {
  const coordsUTM = arcgisJson.rings?.[0];
  if (!coordsUTM) return null;

  const coordsLatLon = coordsUTM.map(([x, y]) =>
    proj4("EPSG:32718", "EPSG:4326", [x, y])
  );

  return {
    type: "Polygon",
    coordinates: [
      coordsLatLon.map(([lon, lat]) => [
        parseFloat(lon.toFixed(6)),
        parseFloat(lat.toFixed(6))
      ])
    ]
  };
};

const FormularioParque = ({ modoEdicion = false, parqueId = null, onSuccess }) => {
  const { perfil } = useUser();

  const [nombre, setNombre] = useState("");
  const [comunaId, setComunaId] = useState(null);
  const [direccion, setDireccion] = useState("");
  const [superficie, setSuperficie] = useState("");
  const [fuenteId, setFuenteId] = useState(null);
  const [estadoProyecto, setEstadoProyecto] = useState("pendiente");
  const [geometriaTexto, setGeometriaTexto] = useState("");
  const [geoValido, setGeoValido] = useState(true);
  const [geoObjeto, setGeoObjeto] = useState(null);

  const [comunas, setComunas] = useState([]);
  const [fuentes, setFuentes] = useState([]);
  const [mensaje, setMensaje] = useState("");

  const opcionesEstado = [
    { value: "pendiente", label: "Pendiente" },
    { value: "aprobado", label: "Aprobado" },
    { value: "rechazado", label: "Rechazado" }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resComunas, resFuentes] = await Promise.all([
          api.get("/comunas"),
          api.get("/fuentes-financiamiento")
        ]);
        setComunas(resComunas.data);
        setFuentes(resFuentes.data);

        if (modoEdicion && parqueId) {
          const res = await api.get(`/parques/${parqueId}`);
          const data = res.data;

          setNombre(data.nombre);
          setComunaId(data.comuna_id);
          setDireccion(data.direccion || "");
          setSuperficie(data.superficie_ha || "");
          setFuenteId(data.fuente_financiamiento_id || null);
          setGeometriaTexto(JSON.stringify(data.geometria, null, 2));
          setGeoValido(true);
          setGeoObjeto(data.geometria);

          if (data.proyecto?.estado_proyecto) {
            setEstadoProyecto(data.proyecto.estado_proyecto);
          }
        } else {
          setGeometriaTexto(`{
  "type": "Polygon",
  "coordinates": [
    [
      [-73.0508, -36.828],
      [-73.0495, -36.8285],
      [-73.0483, -36.8288],
      [-73.0508, -36.828]
    ]
  ]
}`);
        }
      } catch (err) {
        console.error("❌ Error al cargar datos del formulario:", err);
      }
    };
    fetchData();
  }, [modoEdicion, parqueId]);

  const handleGeoChange = (e) => {
    const valor = e.target.value;
    setGeometriaTexto(valor);

    try {
      const parsed = JSON.parse(valor);

      if (parsed.rings && parsed.spatialReference?.wkid === 32718) {
        const geojson = convertirArcGISToGeoJSON(parsed);
        setGeoObjeto(geojson);
        setGeoValido(true);
      } else if (parsed.type === "Polygon" && parsed.coordinates) {
        setGeoObjeto(parsed);
        setGeoValido(true);
      } else {
        setGeoValido(false);
        setGeoObjeto(null);
      }
    } catch (err) {
      setGeoValido(false);
      setGeoObjeto(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");

    if (!perfil?.id) {
      setMensaje("❌ No se pudo identificar al usuario.");
      return;
    }

    if (!geoValido || !geoObjeto) {
      setMensaje("❌ Geometría inválida o vacía.");
      return;
    }

    const body = {
      nombre,
      comuna_id: comunaId,
      direccion,
      superficie_ha: parseFloat(superficie) || null,
      fuente_financiamiento_id: fuenteId || null,
      geometria: geoObjeto
    };

    if (modoEdicion) {
      body.estado_proyecto = estadoProyecto;
      try {
        const res = await api.put(`/parques/${parqueId}`, body);
        setMensaje(res.data?.mensaje || "✅ Parque actualizado.");
        if (onSuccess) setTimeout(() => onSuccess(), 1000);
      } catch (err) {
        console.error("❌ Error al actualizar parque:", err);
        setMensaje("❌ Error al actualizar parque.");
      }
    } else {
      body.descripcion = "Proyecto tipo Parque";
      body.creado_por_id = perfil.id;
      try {
        const res = await api.post("/parques/crear-completo", body);
        setMensaje(res.data?.mensaje || "✅ Parque creado.");
        if (onSuccess) setTimeout(() => onSuccess(), 1000);
      } catch (err) {
        console.error("❌ Error al crear parque:", err);
        setMensaje("❌ Error al crear parque.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="formulario-container">
      <h4>{modoEdicion ? "Editar Parque" : "Crear Parque"}</h4>

      <label>Nombre*</label>
      <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />

      <label>Comuna*</label>
      <Select
        options={comunas.map((c) => ({ value: c.id, label: c.nombre }))}
        value={comunas.find((c) => c.id === comunaId) && { value: comunaId, label: comunas.find((c) => c.id === comunaId)?.nombre }}
        onChange={(op) => setComunaId(op?.value || null)}
        placeholder="Seleccionar comuna"
        isClearable
      />

      <label>Dirección</label>
      <input value={direccion} onChange={(e) => setDireccion(e.target.value)} />

      <label>Superficie (ha)</label>
      <input
        type="number"
        step="0.01"
        value={superficie}
        onChange={(e) => setSuperficie(e.target.value)}
      />

      <label>Fuente de Financiamiento</label>
      <Select
        options={fuentes.map((f) => ({ value: f.id, label: f.nombre }))}
        value={fuentes.find((f) => f.id === fuenteId) && { value: fuenteId, label: fuentes.find((f) => f.id === fuenteId)?.nombre }}
        onChange={(op) => setFuenteId(op?.value || null)}
        placeholder="Seleccionar fuente"
        isClearable
      />

      {modoEdicion && (
        <>
          <label>Estado del Proyecto</label>
          <Select
            options={opcionesEstado}
            value={opcionesEstado.find(op => op.value === estadoProyecto)}
            onChange={(op) => setEstadoProyecto(op?.value || "pendiente")}
          />
        </>
      )}

      <label>Geometría (GeoJSON o ArcGIS JSON):</label>
      <textarea
        value={geometriaTexto}
        onChange={handleGeoChange}
        rows={8}
        className={geoValido ? "textarea-valid" : "textarea-invalid"}
      />

      <small style={{ color: geoValido ? "green" : "red" }}>
        {geoValido
          ? "✅ Geometría válida (GeoJSON o ArcGIS JSON transformado)"
          : "❌ Geometría inválida o vacía"}
      </small>

      <VistaPreviaGeojson geojsonStr={geometriaTexto} />

      <button type="submit" className="btn btn-primary">
        {modoEdicion ? "Actualizar" : "Crear"}
      </button>

      {mensaje && (
        <p className="mensaje-error" style={{ marginTop: "1rem" }}>
          {mensaje}
        </p>
      )}
    </form>
  );
};

export default FormularioParque;
