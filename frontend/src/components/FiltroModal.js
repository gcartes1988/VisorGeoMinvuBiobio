import "../css/filtroModal.css";

function FiltroModal({ visible, categoria, comuna, onRemoveCategoria, onRemoveComuna, onClearAll, onClose }) {
  if (!visible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <span>{(categoria || comuna) ? 'Filtros activos' : 'Sin filtros'}</span>
          <button onClick={onClearAll} className="link-clear">BORRAR TODO</button>
        </div>

        <div className="modal-body">
          {categoria && (
            <div className="filtro-item">
              <span>{categoria.label}</span>
              <button onClick={onRemoveCategoria}>&times;</button>
            </div>
          )}
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
