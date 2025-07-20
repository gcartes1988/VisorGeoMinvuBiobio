// ✅ FiltroModal.js
import "../css/filtroModal.css";

function FiltroModal({ visible, categorias = [], comuna, onRemoveCategoria, onRemoveComuna, onClearAll, onClose }) {
  if (!visible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <span>{(categorias.length > 0 || comuna) ? 'Filtros activos' : 'Sin filtros'}</span>
          <button onClick={onClearAll} className="link-clear">BORRAR TODO</button>
        </div>

        <div className="modal-body">
          {categorias.length > 0 && categorias.map((cat, i) => (
            <div key={i} className="filtro-item">
              <span>{cat.label}</span>
              <button onClick={() => onRemoveCategoria(cat)}>&times;</button>
            </div>
          ))}

          {comuna && (
            <div className="filtro-item">
              <span>{comuna.label}</span>
              <button onClick={onRemoveComuna}>&times;</button>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-cancelar" onClick={onClose}>CANCELAR</button>
          <button className="btn-aceptar" onClick={onClose}>ACEPTAR</button>
        </div>
      </div>
    </div>
  );
}

export default FiltroModal;
