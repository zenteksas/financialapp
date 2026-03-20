import React, { useState, useEffect } from 'react';
import { 
  X, Check, User, Smile, Star, Heart, Zap, Coffee, 
  Gamepad, Rocket
} from 'lucide-react';

const AVATARS = [
  { id: 'User', icon: User, color: '#4f46e5' },
  { id: 'Smile', icon: Smile, color: '#10b981' },
  { id: 'Star', icon: Star, color: '#f59e0b' },
  { id: 'Heart', icon: Heart, color: '#ef4444' },
  { id: 'Zap', icon: Zap, color: '#8b5cf6' },
  { id: 'Coffee', icon: Coffee, color: '#06b6d4' },
  { id: 'Gamepad', icon: Gamepad, color: '#ec4899' },
  { id: 'Rocket', icon: Rocket, color: '#f97316' },
];

const ProfileModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    avatar: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        avatar: initialData.avatar || ''
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!formData.name.trim()) return;
    onSave({
      ...initialData,
      name: formData.name,
      avatar: formData.avatar
    });
    onClose();
  };

  return (
    <div style={modalStyles.overlay} className="animate-fade">
      <div className="glass" style={modalStyles.modal}>
        <div style={modalStyles.header}>
          <h3>Editar Perfil</h3>
          <button onClick={onClose} style={modalStyles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        <div style={modalStyles.body}>
          <div style={modalStyles.inputGroup}>
            <label style={modalStyles.label}>Nombre</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              style={modalStyles.input}
              placeholder="Tu nombre"
            />
          </div>

          <div style={modalStyles.inputGroup}>
            <label style={modalStyles.label}>Avatar / Icono</label>
            <div style={modalStyles.avatarGrid}>
              {AVATARS.map(ava => {
                const Icon = ava.icon;
                return (
                  <button
                    key={ava.id}
                    onClick={() => setFormData({...formData, avatar: ava.id})}
                    style={modalStyles.avatarBtn(formData.avatar === ava.id, ava.color)}
                  >
                    <Icon size={20} />
                  </button>
                );
              })}
              <button
                onClick={() => setFormData({...formData, avatar: ''})}
                style={modalStyles.avatarBtn(formData.avatar === '', '#94a3b8')}
              >
                <span style={{ fontWeight: '700', fontSize: '0.7rem' }}>Aa</span>
              </button>
            </div>
          </div>
        </div>

        <button onClick={handleSave} style={modalStyles.saveBtn}>
          <Check size={20} style={{ marginRight: '8px' }} />
          Guardar Cambios
        </button>
      </div>
    </div>
  );
};

const modalStyles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'flex-end',
    zIndex: 3000, backdropFilter: 'blur(8px)'
  },
  modal: { 
    width: '100%', 
    borderTopLeftRadius: '32px', 
    borderTopRightRadius: '32px', 
    padding: '32px 24px calc(32px + var(--safe-area-bottom))',
    boxShadow: '0 -10px 40px rgba(0,0,0,0.5)'
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  closeBtn: { background: 'none', color: 'var(--text-muted)', cursor: 'pointer' },
  body: { marginBottom: '28px' },
  inputGroup: { marginBottom: '20px' },
  label: { display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', marginLeft: '4px' },
  input: {
    width: '100%', padding: '14px', borderRadius: '14px', backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--glass-border)', color: 'var(--text-main)', outline: 'none'
  },
  avatarGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px',
  },
  avatarBtn: (active, color) => ({
    width: '100%', aspectRatio: '1', borderRadius: '14px',
    backgroundColor: active ? color : 'rgba(255,255,255,0.05)',
    color: active ? 'white' : 'var(--text-muted)',
    border: '1px solid ' + (active ? color : 'var(--glass-border)'),
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer'
  }),
  saveBtn: {
    width: '100%', padding: '16px', borderRadius: '16px', backgroundColor: 'var(--primary)',
    color: 'white', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', border: 'none'
  }
};

export default ProfileModal;
