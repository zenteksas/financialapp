import React, { useState } from 'react';
import { X, Check, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

const DebtModal = ({ isOpen, onClose, onSave, onDelete, initialData }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    monto: '',
    ea: '',
    cuotas: '0',
    cuotaMinima: '',
    cuotaManejo: '0',
    seguros: '0',
    abonoAdicional: '0',
    ...initialData,
    ea: initialData?.ea ? (initialData.ea * 100).toString() : '',
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.monto || !formData.ea || !formData.cuotaMinima) return;

    onSave({
      ...formData,
      monto: parseFloat(formData.monto),
      ea: parseFloat(formData.ea) / 100,
      cuotas: parseInt(formData.cuotas),
      cuotaMinima: parseFloat(formData.cuotaMinima),
      cuotaManejo: parseFloat(formData.cuotaManejo) || 0,
      seguros: parseFloat(formData.seguros) || 0,
      abonoAdicional: parseFloat(formData.abonoAdicional) || 0,
    });
    onClose();
  };

  return (
    <div style={styles.overlay} className="animate-fade">
      <div className="glass" style={styles.modal}>
        <div style={styles.header}>
          <h3>{formData.id ? 'Editar Deuda' : 'Agregar Deuda'}</h3>
          <button onClick={onClose} style={styles.closeBtn}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={styles.scrollArea}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nombre de la Deuda</label>
            <input
              name="nombre"
              type="text"
              placeholder="Ej: Tarjeta de Crédito"
              value={formData.nombre}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Monto Adeudado ({currency})</label>
            <input
              name="monto"
              type="number"
              placeholder="0.00"
              value={formData.monto}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.row}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Interés E.A (%)</label>
              <input
                name="ea"
                type="number"
                step="0.1"
                placeholder="0.0"
                value={formData.ea}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Cuota Mínima ({currency})</label>
              <input
                name="cuotaMinima"
                type="number"
                placeholder="0.00"
                value={formData.cuotaMinima}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>
          </div>

          <div 
            style={styles.advancedToggle} 
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <span style={{ fontSize: '0.8rem' }}>Opciones Avanzadas</span>
            {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>

          {showAdvanced && (
            <div className="animate-fade">
              <div style={styles.row}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Manejo</label>
                  <input
                    name="cuotaManejo"
                    type="number"
                    value={formData.cuotaManejo}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Seguros</label>
                  <input
                    name="seguros"
                    type="number"
                    value={formData.seguros}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Cuotas Restantes</label>
                <input
                  name="cuotas"
                  type="number"
                  value={formData.cuotas}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>
          )}

          <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
            <button type="submit" style={styles.saveBtn}>
              <Check size={20} style={{ marginRight: '8px' }} />
              Guardar
            </button>
            {formData.id && (
              <button 
                type="button" 
                onClick={() => { if(confirm('¿Eliminar de verdad?')) { onDelete(formData.id); onClose(); }}}
                style={styles.deleteBtn}
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '20px',
    backdropFilter: 'blur(8px)',
  },
  modal: {
    width: '100%',
    maxWidth: '500px',
    borderRadius: '28px',
    padding: '28px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  scrollArea: {
    overflowY: 'auto',
    paddingRight: '4px',
  },
  closeBtn: {
    background: 'none',
    color: 'var(--text-muted)',
  },
  inputGroup: {
    marginBottom: '16px',
  },
  row: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginBottom: '6px',
    marginLeft: '4px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '14px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--glass-border)',
    color: 'var(--text-main)',
    fontSize: '0.95rem',
    outline: 'none',
  },
  advancedToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: 'var(--primary)',
    cursor: 'pointer',
    margin: '12px 0',
  },
  saveBtn: {
    flex: 1,
    padding: '14px',
    borderRadius: '16px',
    backgroundColor: 'var(--primary)',
    color: 'white',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    padding: '14px',
    borderRadius: '16px',
    backgroundColor: 'var(--danger)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default DebtModal;
