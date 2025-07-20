// src/components/LoadingScreen.js
import "../css/loading.css";

export default function LoadingScreen() {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p className="loading-text">Cargando sistema...</p>
    </div>
  );
}
