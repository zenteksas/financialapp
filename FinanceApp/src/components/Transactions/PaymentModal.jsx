import React, { useState, useEffect } from 'react';
import { X, Check, Tv, Zap, Shield, Home, ShoppingBag, Heart, Trash2 } from 'lucide-react';

const ICONS = { Tv, Zap, Shield, Home, ShoppingBag, Heart };
const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#E50914'];

const PaymentModal = ({ isOpen, onClose, onSave, onDelete, initialData, currency }) => {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    date: '1',
    icon: 'Tv',
    color: COLORS[0],
    category: 'Ocio',
    ...(initialData || {})
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        amount: '',
        date: '1',
        icon: 'Tv',
        color: COLORS[0],
        category: 'Ocio',
        ...(initialData || {})
      });
    }
  }, [isOpen, initialData]);

  const formatAmountDisplay = (val) => {
    if (val === null || val === undefined || val === '') return '';
    const numericStr = val.toString().replace(/\D/g, '');
    if (!numericStr) return '';
    return numericStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleAmountChange = (e) => {
    let rawValue = e.target.value.replace(/\D/g, '');
    if (rawValue.length > 1 && rawValue.startsWith('0')) {
      rawValue = rawValue.replace(/^0+/, '');
    }
    setFormData(prev => ({ ...prev, amount: rawValue }));
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.amount) return;
    onSave({ ...formData, amount: parseFloat(formData.amount) });
    onClose();
  };

  return (
    <div style={styles.overlay} className="animate-fade" onClick={onClose}>
      <div className="glass" style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3>{formData.id ? 'Editar Pago' : 'Nuevo Pago Habitual'}</h3>
          <button onClick={onClose} style={styles.closeBtn}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nombre</label>
            <input
              type="text"
              placeholder="Ej: Netflix, Internet..."
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.row}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Monto ({currency})</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="$ 0"
                value={formatAmountDisplay(formData.amount)}
                onChange={handleAmountChange}
                style={styles.input}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Día de Pago</label>
              <input
                type="number"
                min="1"
                max="31"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                style={styles.input}
                required
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Icono</label>
            <div style={styles.iconGrid}>
              {Object.keys(ICONS).map(name => {
                const Icon = ICONS[name];
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, icon: name }))}
                    style={styles.iconBtn(formData.icon === name, formData.color)}
                  >
                    <Icon size={20} />
                  </button>
                );
              })}
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Color</label>
            <div style={styles.colorGrid}>
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color: c }))}
                  style={styles.colorBtn(formData.color === c, c)}
                />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button type="submit" style={styles.saveBtn}>
              <Check size={20} style={{ marginRight: '8px' }} />
              Guardar
            </button>
            {formData.id && (
              <button 
                type="button" 
                onClick={() => { if(confirm('¿Eliminar pago?')) { onDelete(formData.id); onClose(); }}}
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
    justifyContent: 'center',
    zIndex: 6000,
    backdropFilter: 'blur(8px)',
  },
  modal: {
    width: '100%',
    maxWidth: '550px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    borderTopLeftRadius: '32px',
    borderTopRightRadius: '32px',
    padding: '32px 24px calc(32px + var(--safe-area-bottom))',
    boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  closeBtn: { background: 'none', color: 'var(--text-muted)' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  row: { display: 'flex', gap: '12px' },
  label: { fontSize: '0.8rem', color: 'var(--text-muted)' },
  input: {
    width: '100%', padding: '14px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--glass-border)', color: 'var(--text-main)', fontSize: '1rem', outline: 'none',
  },
  iconGrid: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  iconBtn: (active, color) => ({
    width: '42px', height: '42px', borderRadius: '12px',
    backgroundColor: active ? color : 'rgba(255,255,255,0.05)',
    color: active ? 'white' : 'var(--text-muted)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: `1px solid ${active ? color : 'var(--glass-border)'}`,
  }),
  colorGrid: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  colorBtn: (active, color) => ({
    width: '32px', height: '32px', borderRadius: '50%',
    backgroundColor: color, border: active ? '3px solid white' : 'none',
  }),
  saveBtn: {
    flex: 1, padding: '16px', borderRadius: '18px', backgroundColor: 'var(--primary)',
    color: 'white', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  deleteBtn: {
    padding: '16px', borderRadius: '18px', backgroundColor: 'var(--danger)',
    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
};

export default PaymentModal;
