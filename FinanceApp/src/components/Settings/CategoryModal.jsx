import React, { useState, useEffect } from 'react';
import { 
  X, Check, Utensils, Car, Home, ShoppingBag, Heart, 
  Gamepad, Briefcase, GraduationCap, Plane, Coffee, 
  Tv, Zap, Trash2, Tag, Smartphone, PiggyBank, Receipt,
  Wallet, Gift, Landmark, HelpCircle, FileText, Users,
  Dumbbell, Bus, Pizza, Wifi, BarChart3, Bike, Footprints,
  PawPrint, Power, CreditCard, Ruler, Music, Camera,
  Rocket, Star, Gem, Wine, ShieldCheck, Phone,
  Moon, Sun, Key
} from 'lucide-react';

const ICONS = {
  Utensils, Car, Home, ShoppingBag, Heart, Gamepad,
  Briefcase, GraduationCap, Plane, Coffee, Tv, Zap,
  Smartphone, PiggyBank, Receipt, Tag,
  Wallet, Gift, Landmark, HelpCircle, FileText, Users,
  Dumbbell, Bus, Pizza, Wifi, BarChart3, Bike, Footprints,
  PawPrint, Power, CreditCard, Ruler, Music, Camera,
  Rocket, Star, Gem, Wine, ShieldCheck, Phone,
  Moon, Sun, Key
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
          <div style={styles.typeSelector}>
            <button 
              type="button" 
              style={styles.typeBtn(formData.type === 'expense', 'var(--danger)')}
              onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
            >
              GASTO
            </button>
            <button 
              type="button" 
              style={styles.typeBtn(formData.type === 'income', 'var(--secondary)')}
              onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
            >
              INGRESO
            </button>
          </div>

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
    backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'flex-end',
    zIndex: 6000, backdropFilter: 'blur(8px)',
  },
  modal: { 
    width: '100%', 
    borderTopLeftRadius: '32px', 
    borderTopRightRadius: '32px', 
    padding: '32px 24px calc(32px + var(--safe-area-bottom))',
    boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
    maxHeight: '90vh',
    overflowY: 'auto'
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  closeBtn: { background: 'none', color: 'var(--text-muted)' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  typeSelector: {
    display: 'flex', gap: '8px', backgroundColor: 'rgba(255,255,255,0.05)',
    padding: '4px', borderRadius: '14px', marginBottom: '8px'
  },
  typeBtn: (active, color) => ({
    flex: 1, padding: '10px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '700',
    backgroundColor: active ? color : 'transparent', color: active ? 'white' : 'var(--text-muted)',
    border: 'none', transition: 'all 0.2s', cursor: 'pointer'
  }),
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
