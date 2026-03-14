import React from 'react';
import { 
  Home, Wallet, PieChart, Tag, Repeat, Bell, Settings, 
  CircleOff, Share2, Star, MessageSquare, RefreshCw, X,
  User, Smile, Heart, Zap, Coffee, Gamepad, Rocket
} from 'lucide-react';

const AVATAR_ICONS = { User, Smile, Heart, Zap, Coffee, Gamepad, Rocket, Star };

const Sidebar = ({ isOpen, onClose, userProfile, totalBalance, onNavigate, activeTab, currency }) => {
  const userName = userProfile?.name || 'Usuario';
  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const AvatarIcon = AVATAR_ICONS[userProfile?.avatar];
  const menuItems = [
    { id: 'dashboard', label: 'Inicio', icon: Home },
    { id: 'accounts', label: 'Cuentas', icon: Wallet },
    { id: 'stats', label: 'Gráficos', icon: PieChart },
    { id: 'categories', label: 'Categorías', icon: Tag },
    { id: 'debts', label: 'Deudas', icon: Wallet },
    { id: 'payments', label: 'Pagos habituales', icon: Repeat },
    { id: 'reminders', label: 'Recordatorios', icon: Bell },
    { id: 'settings', label: 'Ajustes', icon: Settings },
  ];

  const secondaryItems = [
    { id: 'ads', label: 'Desactivar anuncios', icon: CircleOff },
    { id: 'share', label: 'Compartir con amigos', icon: Share2 },
    { id: 'rate', label: 'Valore la aplicación', icon: Star },
    { id: 'support', label: 'Contacte con el equipo', icon: MessageSquare },
  ];

  return (
    <>
      <div 
        className={`sidebar-overlay ${isOpen ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'}`} 
        onClick={onClose}
      />
      
      <div className={`sidebar-drawer ${isOpen ? 'animate-slide-in' : 'animate-slide-out'}`}>
        <div style={styles.header}>
          <div style={styles.profileArea}>
            <div style={{ ...styles.avatar, backgroundColor: 'var(--primary-light)' }}>
              {AvatarIcon ? (
                <div style={styles.avatarFlex}>
                  <AvatarIcon size={32} color="var(--primary)" />
                </div>
              ) : (
                <div style={styles.avatarFlex}>
                  <span style={styles.initials}>{initials}</span>
                </div>
              )}
            </div>
            <div style={styles.profileInfo}>
              <h3 style={styles.userName}>{userName}</h3>
              <p style={styles.userBalance}>Balance: {totalBalance.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {currency}</p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={24} />
          </button>
        </div>

        <div style={styles.menuList}>
          {menuItems.map(item => (
            <button 
              key={item.id} 
              style={styles.menuItem(activeTab === item.id)}
              onClick={() => { onNavigate(item.id); onClose(); }}
            >
              <item.icon size={22} style={styles.icon} />
              <span>{item.label}</span>
            </button>
          ))}
          
          <div style={styles.divider} />

          {secondaryItems.map(item => (
            <button 
              key={item.id} 
              style={styles.menuItem(false)}
              onClick={() => onClose()}
            >
              <item.icon size={22} style={styles.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div style={styles.footer}>
          <div style={styles.syncRow}>
            <RefreshCw size={18} />
            <span>{new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>
    </>
  );
};

const styles = {
  header: {
    padding: '32px 24px',
    borderBottom: '1px solid var(--glass-border)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  profileArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  avatar: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '2px solid var(--primary)',
  },
  avatarFlex: { 
    width: '100%', height: '100%', display: 'flex', 
    alignItems: 'center', justifyContent: 'center' 
  },
  initials: { fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary)' },
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  profileInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  userName: { fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-heading)' },
  userBalance: { fontSize: '0.9rem', color: 'var(--text-muted)' },
  closeBtn: { background: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' },
  menuList: {
    padding: '16px 8px',
    height: 'calc(100% - 220px)',
    overflowY: 'auto',
  },
  menuItem: (active) => ({
    width: '100%',
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    background: active ? 'rgba(74, 222, 128, 0.1)' : 'none',
    color: active ? 'var(--secondary)' : 'var(--text-main)',
    border: 'none',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: active ? '600' : '400',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s',
  }),
  icon: { opacity: 0.8 },
  divider: { height: '1px', background: 'var(--glass-border)', margin: '16px' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '16px 24px',
    borderTop: '1px solid var(--glass-border)',
  },
  syncRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: 'var(--text-muted)',
    fontSize: '0.8rem',
  }
};

export default Sidebar;
