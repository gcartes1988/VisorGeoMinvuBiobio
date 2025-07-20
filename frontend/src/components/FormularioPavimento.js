import { useEffect, useState } from "react";
import Select from "react-select";
import api from "../services/api";
import VistaPreviaGeojson from "./VistaPreviaGeojson";
import proj4 from "proj4";

proj4.defs("EPSG:32718", "+proj=utm +zone=18 +south +datum=WGS84 +units=m +no_defs");

const convertirArcGISToGeoJSON = (arcgisJson) => {
  const coordsUTM = arcgisJson.paths?.[0];
  if (!coordsUTM) return null;

  const coordsLatLon = coordsUTM.map(([x, y]) =>
    proj4("EPSG:32718", "EPSG:4326", [x, y])
  );

  return {
    type: "LineString",
    coordinates: coordsLatLon.map(([lon, lat]) => [
      parseFloat(lon.toFixed(6)),
      parseFloat(lat.toFixed(6))
    ])
  };
};

const FormularioPavimento = ({ proyectoId, modoEdicion = false, pavimentoId = null, onSuccess }) => {
  const [formData, setFormData] = useState({
    comuna: null,
    sector: "",
    longitud_metros: "",
    tipo_calzada: null,
    tipos_pavimento: [],
    estado_avance: null,
    geometria: JSON.stringify({
      type: "LineString",
      coordinates: [
        [-73.0508, -36.828],
        [-73.0495, -36.8285],
        [-73.0483, -36.8288]
      ]
    }, null, 2),
    proyecto_id: null
  });

  const [geoValido, setGeoValido] = useState(true);
  const [tiposCalzada, setTiposCalzada] = useState([]);
  const [tiposPavimento, setTiposPavimento] = useState([]);
  const [estadosAvance, setEstadosAvance] = useState([]);
  const [comunas, setComunas] = useState([]);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    api.get("/tipo-calzada").then(res => setTiposCalzada(res.data));
    api.get("/tipo-pavimento").then(res => setTiposPavimento(res.data));
    api.get("/estado-avance").then(res => setEstadosAvance(res.data));
    api.get("/comunas").then(res => setComunas(res.data));
  }, []);

  useEffect(() => {
    if (!modoEdicion || !pavimentoId) return;

    const datosListos = tiposCalzada.length && tiposPavimento.length && estadosAvance.length && comunas.length;
    if (!datosListos) return;

    const cargarPavimento = async () => {
      try {
        const res = await api.get(`/pavimentos/${pavimentoId}`);
        const pav = res.data;

        setFormData({
          comuna: pav.comuna ? { value: pav.comuna.id, label: pav.comuna.nombre } : null,
          sector: pav.sector || "",
          longitud_metros: pav.longitud_metros?.toString() || "",
          tipo_calzada: pav.tipo_calzada_id
            ? {
                value: pav.tipo_calzada_id,
                label: tiposCalzada.find((tc) => tc.id === pav.tipo_calzada_id)?.nombre || ""
              }
            : null,
          tipos_pavimento: pav.tipos_pavimento?.map((tp) => ({
            value: tp.id,
            label: tp.nombre
          })) || [],
          estado_avance: pav.estado_avance
            ? { value: pav.estado_avance.id, label: pav.estado_avance.nombre }
            : null,
          geometria: JSON.stringify(pav.geometria, null, 2),
          proyecto_id: pav.proyecto_id || null
        });

        setGeoValido(true);
      } catch (err) {
        console.error("Error al cargar pavimento:", err);
        setMensaje("❌ Error al cargar los datos del pavimento.");
      }
    };

    cargarPavimento();
  }, [modoEdicion, pavimentoId, tiposCalzada, tiposPavimento, estadosAvance, comunas]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "geometria") {
      try {
        const parsed = JSON.parse(value);

        if (parsed.paths && parsed.spatialReference?.wkid === 32718) {
          const geojson = convertirArcGISToGeoJSON(parsed);
          setGeoValido(true);
          setFormData(prev => ({ ...prev, geometria: JSON.stringify(geojson, null, 2) }));
        } else if (parsed.type === "LineString" && parsed.coordinates) {
          setGeoValido(true);
          setFormData(prev => ({ ...prev, geometria: value }));
        } else {
          setGeoValido(false);
          setFormData(prev => ({ ...prev, geometria: value }));
        }
      } catch {
        setGeoValido(false);
        setFormData(prev => ({ ...prev, geometria: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!geoValido) {
      setMensaje("❌ Geometría inválida: debe ser un GeoJSON válido de tipo LineString.");
      return;
    }

    let geoObjeto;
    try {
      geoObjeto = JSON.parse(formData.geometria);
    } catch {
      setMensaje("❌ Error al interpretar el GeoJSON.");
      return;
    }

    const proyectoFinal = proyectoId || formData.proyecto_id;
    if (!proyectoFinal) {
      setMensaje("❌ No se pudo determinar el proyecto asociado.");
      return;
    }

    const payload = {
      comuna_id: formData.comuna?.value,
      sector: formData.sector,
      longitud_metros: parseFloat(formData.longitud_metros),
      tipo_calzada_id: formData.tipo_calzada?.value,
      tipos_pavimento: formData.tipos_pavimento.map(p => p.value),
      estado_avance_id: formData.estado_avance?.value,
      geometria: geoObjeto,
      proyecto_id: proyectoFinal
    };

    try {
      if (modoEdicion && pavimentoId) {
        const res = await api.put(`/pavimentos/${pavimentoId}`, payload);
        const mensajeBackend = res.data?.mensaje || "✏️ Pavimento actualizado.";
        setMensaje(mensajeBackend);
        if (mensajeBackend.includes("✅") && onSuccess) setTimeout(() => onSuccess(), 5000);
      } else {
        const res = await api.post("/pavimentos", payload);
        const mensajeBackend = res.data?.mensaje || "✅ Pavimento creado con éxito.";
        setMensaje(mensajeBackend);
        if (onSuccess) setTimeout(() => onSuccess(), 5000);
      }
    } catch (err) {
      console.error(err);
      setMensaje("❌ Error al guardar pavimento.");
    }
  };

  return (
    <div className="formulario-container">
      <h3>{modoEdicion ? "Editar Pavimento" : "Agregar Pavimento"}</h3>

      <form onSubmit={handleSubmit}>
        <label>Comuna:</label>
        <Select
          options={comunas.map((c) => ({ value: c.id, label: c.nombre }))}
          value={formData.comuna}
          onChange={(selected) => setFormData((prev) => ({ ...prev, comuna: selected }))}
          placeholder="Seleccionar comuna"
          isClearable
        />

        <label>Sector:</label>
        <input type="text" name="sector" value={formData.sector} onChange={handleChange} required />

        <label>Longitud (m):</label>
        <input type="number" name="longitud_metros" value={formData.longitud_metros} onChange={handleChange} required />

        <label>Tipo de Calzada:</label>
        <Select
          options={tiposCalzada.map((tc) => ({ value: tc.id, label: tc.nombre }))}
          value={formData.tipo_calzada}
          onChange={(selected) => setFormData((prev) => ({ ...prev, tipo_calzada: selected }))}
          placeholder="Seleccionar tipo"
          isClearable
        />

        <label>Tipos de Pavimento:</label>
        <Select
          options={tiposPavimento.map((tp) => ({ value: tp.id, label: tp.nombre }))}
          value={formData.tipos_pavimento}
          onChange={(selected) => setFormData((prev) => ({ ...prev, tipos_pavimento: selected }))}
          placeholder="Seleccionar tipos"
          isMulti
        />

        <label>Estado de Avance:</label>
        <Select
          options={estadosAvance.map((ea) => ({ value: ea.id, label: ea.nombre }))}
          value={formData.estado_avance}
          onChange={(selected) => setFormData((prev) => ({ ...prev, estado_avance: selected }))}
          placeholder="Seleccionar estado"
          isClearable
        />

        <label htmlFor="geometria">Geometría (GeoJSON o ArcGIS JSON):</label>
        <textarea
          id="geometria"
          name="geometria"
          rows={6}
          value={formData.geometria}
          onChange={handleChange}
          style={{
            border: `2px solid ${geoValido ? "green" : "red"}`,
            width: "100%",
            fontFamily: "monospace",
            padding: "8px"
          }}
        />
        <small style={{ color: geoValido ? "#666" : "red" }}>
          {geoValido
            ? "✅ Geometría válida (GeoJSON o ArcGIS JSON transformado)"
            : "❌ Formato no reconocido o inválido."}
        </small>

        <VistaPreviaGeojson geojsonStr={formData.geometria} />

        <button type="submit" className="btn btn-primary btn-default-size">
          {modoEdicion ? "Actualizar" : "Guardar"} Pavimento
        </button>
      </form>

      {mensaje && (
        <p style={{
          marginTop: "16px",
          padding: "8px",
          border: "1px solid",
          borderColor: mensaje.startsWith("✅") ? "green" : "red",
          backgroundColor: mensaje.startsWith("✅") ? "#e6ffea" : "#ffe6e6",
          color: mensaje.startsWith("✅") ? "#006600" : "#990000"
        }}>
          {mensaje}
        </p>
      )}
    </div>
  );
};

export default FormularioPavimento;