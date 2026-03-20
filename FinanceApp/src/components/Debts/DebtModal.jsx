import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

const DebtModal = ({ isOpen, onClose, onSave, onDelete, initialData, currency }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    monto: '',
    ea: '',
    cuotas: '',
    cuotaMinima: '',
    cuotaManejo: '',
    seguros: '',
    abonoAdicional: '',
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          ...initialData,
          ea: (initialData.ea * 100).toString(),
        });
      } else {
        setFormData({
          nombre: '',
          monto: '',
          ea: '',
          cuotas: '',
          cuotaMinima: '',
          cuotaManejo: '',
          seguros: '',
          abonoAdicional: '',
        });
      }
      setShowAdvanced(false);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const formatAmountDisplay = (val) => {
    if (val === null || val === undefined || val === '') return '';
    const numericStr = val.toString().replace(/\D/g, '');
    if (!numericStr) return '';
    return numericStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleAmountChange = (e, field) => {
    let rawValue = e.target.value.replace(/\D/g, '');
    if (rawValue.length > 1 && rawValue.startsWith('0')) {
      rawValue = rawValue.replace(/^0+/, '');
    }
    setFormData(prev => ({ ...prev, [field]: rawValue }));
  };

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
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={formatAmountDisplay(formData.monto)}
              onChange={(e) => handleAmountChange(e, 'monto')}
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
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={formatAmountDisplay(formData.cuotaMinima)}
                onChange={(e) => handleAmountChange(e, 'cuotaMinima')}
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
                  <label style={styles.label}>Cuota de Manejo</label>
                  <input
                    name="cuotaManejo"
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={formatAmountDisplay(formData.cuotaManejo)}
                    onChange={(e) => handleAmountChange(e, 'cuotaManejo')}
                    style={styles.input}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Seguros</label>
                  <input
                    name="seguros"
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={formatAmountDisplay(formData.seguros)}
                    onChange={(e) => handleAmountChange(e, 'seguros')}
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
    backgroundColor: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'flex-end',
    zIndex: 2000,
    backdropFilter: 'blur(8px)',
  },
  modal: {
    width: '100%',
    borderTopLeftRadius: '32px',
    borderTopRightRadius: '32px',
    padding: '32px 24px calc(32px + var(--safe-area-bottom))',
    boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
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
    flex: 1,
    minHeight: 0,
    paddingRight: '4px',
    marginRight: '-4px',
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
