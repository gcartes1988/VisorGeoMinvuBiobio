function Icono({ nombre, size = 24, color = "#333", peso = "regular" }) {
  return (
    <span
      className="material-symbols-outlined"
      style={{
        fontSize: `${size}px`,
        color: color,
        fontVariationSettings: `'wght' ${peso === "bold" ? 700 : 400}`,
        verticalAlign: "middle",
      }}
      aria-hidden="true"
    >
      {nombre}
    </span>
  );
}

export default Icono;
