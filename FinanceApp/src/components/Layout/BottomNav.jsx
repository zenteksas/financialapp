import React from 'react';
import { Home, ArrowLeftRight, CreditCard, PieChart } from 'lucide-react';

const BottomNav = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', label: 'Inicio', icon: Home },
    { id: 'transactions', label: 'Transacciones', icon: ArrowLeftRight },
    { id: 'debts', label: 'Deudas', icon: CreditCard },
    { id: 'stats', label: 'Estadísticas', icon: PieChart },
  ];

  return (
    <nav className="glass" style={styles.nav}>
      <div style={styles.container}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.tab,
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              }}
            >
              <Icon size={24} style={{ marginBottom: '4px', transition: 'transform 0.2s' }} />
              <span style={{ fontSize: '10px', fontWeight: isActive ? '600' : '400' }}>
                {tab.label}
              </span>
              {isActive && <div style={styles.indicator} />}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: 'var(--nav-height)',
    display: 'flex',
    justifyContent: 'center',
    zIndex: 1000,
    paddingBottom: 'var(--safe-area-bottom)',
    borderTop: '1px solid var(--glass-border)',
  },
  container: {
    display: 'flex',
    width: '100%',
    maxWidth: '600px',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tab: {
    background: 'none',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
  indicator: {
    position: 'absolute',
    top: '4px',
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary)',
    boxShadow: '0 0 8px var(--primary-glow)',
  }
};

export default BottomNav;
