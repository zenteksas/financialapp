import React, { useState, useEffect } from 'react';
import { X, Check, Building2, Wallet, PiggyBank, CreditCard, Coins, Trash2 } from 'lucide-react';

const ICONS = {
  Building2: Building2,
  Wallet: Wallet,
  PiggyBank: PiggyBank,
  CreditCard: CreditCard,
  Coins: Coins
};

const COLORS = [
  '#4f46e5', // Indigo
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#06b6d4'  // Cyan
];

const AccountModal = ({ isOpen, onClose, onSave, onDelete, initialData, currency }) => {
  const [formData, setFormData] = useState({
    name: '',
    balance: '',
    color: COLORS[0],
    icon: 'Wallet',
    includeInTotal: true,
    ...initialData
  });

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        balance: '',
        color: COLORS[0],
        icon: 'Wallet',
        includeInTotal: true,
        ...initialData
      });
      setIsConfirmingDelete(false);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    onSave({
      ...formData,
      balance: parseFloat(formData.balance) || 0
    });
    onClose();
  };

  return (
    <div style={styles.overlay} className="animate-fade">
      <div className="glass" style={styles.modal}>
        <div style={styles.header}>
          <h3>{formData.id ? 'Editar Cuenta' : 'Nueva Cuenta'}</h3>
          <button onClick={onClose} style={styles.closeBtn}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nombre de la Cuenta</label>
            <input
              name="name"
              type="text"
              placeholder="Ej: Nómina, Ahorros, Efectivo"
              value={formData.name}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Saldo Inicial ({currency})</label>
            <input
              name="balance"
              type="number"
              placeholder="0.00"
              value={formData.balance}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Icono</label>
            <div style={styles.iconGrid}>
              {Object.entries(ICONS).map(([name, Icon]) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, icon: name }))}
                  style={styles.iconBtn(formData.icon === name, formData.color)}
                >
                  <Icon size={20} />
                </button>
              ))}
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

          <div style={styles.toggleRow}>
            <div>
              <p style={{ fontWeight: '500', fontSize: '0.95rem' }}>Incluir en Balance General</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>El saldo sumará al total de la app</p>
            </div>
            <label className="switch" style={styles.switch}>
              <input
                name="includeInTotal"
                type="checkbox"
                checked={formData.includeInTotal}
                onChange={handleChange}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div style={styles.footer}>
            <button type="submit" style={styles.saveBtn}>
              <Check size={20} style={{ marginRight: '8px' }} />
              {formData.id ? 'Guardar Cambios' : 'Crear Cuenta'}
            </button>
            {formData.id && formData.id !== 'default' && (
              <div style={{ display: 'flex', gap: '8px' }}>
                {!isConfirmingDelete ? (
                  <button 
                    type="button" 
                    onClick={() => setIsConfirmingDelete(true)}
                    style={styles.deleteBtn}
                  >
                    <Trash2 size={20} />
                  </button>
                ) : (
                  <button 
                    type="button" 
                    onClick={() => onDelete(formData.id)}
                    style={{ ...styles.deleteBtn, backgroundColor: 'var(--danger)', padding: '0 16px', fontSize: '0.8rem' }}
                  >
                    ¿Seguro?
                  </button>
                )}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 3000, padding: '20px', backdropFilter: 'blur(8px)',
  },
  modal: { width: '100%', maxWidth: '400px', borderRadius: '28px', padding: '28px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  closeBtn: { background: 'none', color: 'var(--text-muted)' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '4px' },
  input: {
    width: '100%', padding: '14px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--glass-border)', color: 'var(--text-main)', fontSize: '1rem', outline: 'none',
  },
  iconGrid: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  iconBtn: (active, color) => ({
    width: '44px', height: '44px', borderRadius: '12px',
    backgroundColor: active ? color : 'rgba(255,255,255,0.05)',
    color: active ? 'white' : 'var(--text-muted)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: `1px solid ${active ? color : 'var(--glass-border)'}`,
  }),
  colorGrid: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  colorBtn: (active, color) => ({
    width: '32px', height: '32px', borderRadius: '50%',
    backgroundColor: color,
    border: active ? '3px solid white' : 'none',
    boxShadow: active ? `0 0 10px ${color}` : 'none',
  }),
  toggleRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px', borderRadius: '18px', backgroundColor: 'rgba(255,255,255,0.03)',
  },
  switch: { position: 'relative', display: 'inline-block', width: '46px', height: '24px' },
  slider: {
    position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#ccc', transition: '.4s', borderRadius: '24px'
  },
  // We'll use CSS for slider checked state in a style tag or index.css, 
  // but for now let's use a simpler inline approach or just standard input.
  footer: { display: 'flex', gap: '12px', marginTop: '10px' },
  saveBtn: {
    flex: 1, padding: '16px', borderRadius: '18px', backgroundColor: 'var(--primary)',
    color: 'white', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  deleteBtn: {
    padding: '16px', borderRadius: '18px', backgroundColor: 'var(--danger)',
    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
};

export default AccountModal;
