import React from 'react';
import { Bell, Calendar, Clock, AlertTriangle, CheckCircle2, MoreHorizontal } from 'lucide-react';

const RemindersModule = () => {
  const reminders = [
    { id: 1, title: 'Pagar Tarjeta de Crédito', date: 'Mañana, 14 de Marzo', type: 'urgente', icon: AlertTriangle, color: 'var(--danger)' },
    { id: 2, title: 'Renovación Netflix', date: '15 de Marzo', type: 'proximo', icon: Clock, color: 'var(--accent)' },
    { id: 3, title: 'Ahorro Programado', date: '25 de Marzo', type: 'normal', icon: Bell, color: 'var(--secondary)' },
    { id: 4, title: 'Revisión Saldo Ahorros', date: 'Hoy completado', type: 'mision', icon: CheckCircle2, color: 'var(--secondary)', completed: true },
  ];

  return (
    <div className="animate-fade">
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ marginBottom: '8px' }}>Recordatorios</h1>
        <p style={{ color: 'var(--text-muted)' }}>No olvides tus compromisos financieros</p>
      </header>

      <div style={styles.list}>
        {reminders.map(rem => {
          const Icon = rem.icon;
          return (
            <div key={rem.id} className="glass" style={{ ...styles.card, opacity: rem.completed ? 0.6 : 1 }}>
              <div style={styles.iconCircle(rem.color)}>
                <Icon size={20} />
              </div>
              <div style={styles.info}>
                <h3 style={{ ...styles.title, textDecoration: rem.completed ? 'line-through' : 'none' }}>{rem.title}</h3>
                <div style={styles.dateRow}>
                  <Calendar size={14} />
                  <span>{rem.date}</span>
                </div>
              </div>
              <button style={styles.moreBtn}>
                <MoreHorizontal size={18} />
              </button>
            </div>
          );
        })}
      </div>

      <div className="glass" style={styles.infoBox}>
        <h4 style={{ marginBottom: '8px', color: 'var(--secondary)' }}>Tip de Ahorro:</h4>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Automatizar tus pagos habituales te ayuda a evitar cargos por mora y mejora tu historial crediticio.
        </p>
      </div>
    </div>
  );
};

const styles = {
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  card: { padding: '16px 20px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '16px' },
  iconCircle: (color) => ({
    width: '44px', height: '44px', borderRadius: '14px',
    backgroundColor: `${color}20`, color: color,
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  }),
  info: { flex: 1 },
  title: { fontSize: '1rem', fontWeight: '600', color: 'var(--text-heading)', marginBottom: '4px' },
  dateRow: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' },
  moreBtn: { background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' },
  infoBox: { padding: '24px', borderRadius: '28px', marginTop: '32px', backgroundColor: 'var(--surface-color)' }
};

export default RemindersModule;
