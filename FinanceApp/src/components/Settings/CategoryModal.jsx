import React, { useState, useEffect } from 'react';
import { 
  X, Check, Utensils, Car, Home, ShoppingBag, Heart, 
  Gamepad, Briefcase, GraduationCap, Plane, Coffee, 
  Tv, Zap, Trash2, Tag, Smartphone, PiggyBank, Receipt
} from 'lucide-react';

const ICONS = {
  Utensils, Car, Home, ShoppingBag, Heart, Gamepad,
  Briefcase, GraduationCap, Plane, Coffee, Tv, Zap,
  Smartphone, PiggyBank, Receipt, Tag
};

const COLORS = [
  '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#4f46e5',
  '#ec4899', '#8b5cf6', '#06b6d4', '#4ade80', '#fbbf24'
];

const CategoryModal = ({ isOpen, onClose, onSave, onDelete, initialData, type = 'expense' }) => {
  const [formData, setFormData] = useState({
    name: '',
    icon: 'Tag',
    color: COLORS[0],
    type: type,
    ...initialData
  });

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        icon: 'Tag',
        color: COLORS[0],
        type: type,
        ...initialData
      });
      setIsConfirmingDelete(false);
    }
  }, [isOpen, initialData, type]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    onSave(formData);
    onClose();
  };

  return (
    <div style={styles.overlay} className="animate-fade">
      <div className="glass" style={styles.modal}>
        <div style={styles.header}>
          <h3>{formData.id ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
          <button onClick={onClose} style={styles.closeBtn}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nombre</label>
            <input
              autoFocus
              type="text"
              placeholder="Ej: Mascotas, Gimnasio..."
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              style={styles.input}
              required
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

          <div style={styles.footer}>
            <button type="submit" style={styles.saveBtn}>
              <Check size={20} style={{ marginRight: '8px' }} />
              Guardar
            </button>
            {formData.id && (
              <div style={{ display: 'flex', gap: '8px' }}>
                {!isConfirmingDelete ? (
                  <button type="button" onClick={() => setIsConfirmingDelete(true)} style={styles.deleteBtn}>
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
    zIndex: 6000, padding: '20px', backdropFilter: 'blur(8px)',
  },
  modal: { width: '100%', maxWidth: '400px', borderRadius: '28px', padding: '28px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  closeBtn: { background: 'none', color: 'var(--text-muted)' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '0.8rem', color: 'var(--text-muted)' },
  input: {
    width: '100%', padding: '14px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--glass-border)', color: 'var(--text-main)', fontSize: '1rem', outline: 'none',
  },
  iconGrid: { display: 'flex', gap: '8px', flexWrap: 'wrap', maxHeight: '150px', overflowY: 'auto', padding: '4px' },
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

export default CategoryModal;
