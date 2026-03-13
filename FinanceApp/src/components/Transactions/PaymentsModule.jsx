import React from 'react';
import { CreditCard, Zap, Tv, Home, Shield, Plus, MoreVertical } from 'lucide-react';

const PaymentsModule = () => {
  const recurringPayments = [
    { id: 1, name: 'Netflix', amount: 45000, category: 'Ocio', icon: Tv, color: '#E50914', date: 'Día 15' },
    { id: 2, name: 'Energía (Enel)', amount: 120000, category: 'Servicios', icon: Zap, color: '#fbbf24', date: 'Día 20' },
    { id: 3, name: 'Seguro de Vida', amount: 85000, category: 'Salud', icon: Shield, color: '#3b82f6', date: 'Día 5' },
    { id: 4, name: 'Arriendo', amount: 1500000, category: 'Hogar', icon: Home, color: '#10b981', date: 'Día 1' },
  ];

  return (
    <div className="animate-fade">
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ marginBottom: '8px' }}>Pagos Habituales</h1>
        <p style={{ color: 'var(--text-muted)' }}>Gestiona tus suscripciones y facturas fijas</p>
      </header>

      <div style={styles.list}>
        {recurringPayments.map(payment => {
          const Icon = payment.icon;
          return (
            <div key={payment.id} className="glass" style={styles.card}>
              <div style={styles.iconCircle(payment.color)}>
                <Icon size={20} />
              </div>
              <div style={styles.info}>
                <h3 style={styles.name}>{payment.name}</h3>
                <p style={styles.meta}>{payment.category} • {payment.date}</p>
              </div>
              <div style={styles.amountArea}>
                <p style={styles.amount}>${payment.amount.toLocaleString()}</p>
                <MoreVertical size={16} style={{ color: 'var(--text-muted)' }} />
              </div>
            </div>
          );
        })}
        
        <button className="glass" style={styles.addBtn}>
          <Plus size={20} style={{ marginRight: '8px' }} />
          Programar Nuevo Pago
        </button>
      </div>

      <div className="glass" style={styles.totalCard}>
        <p style={styles.totalLabel}>Total Mensual Habitual</p>
        <h2 style={styles.totalValue}>$1.750.000</h2>
      </div>
    </div>
  );
};

const styles = {
  list: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' },
  card: { padding: '16px 20px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '16px' },
  iconCircle: (color) => ({
    width: '44px', height: '44px', borderRadius: '14px',
    backgroundColor: `${color}20`, color: color,
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  }),
  info: { flex: 1 },
  name: { fontSize: '1rem', fontWeight: '600', color: 'var(--text-heading)' },
  meta: { fontSize: '0.8rem', color: 'var(--text-muted)' },
  amountArea: { textAlign: 'right', display: 'flex', alignItems: 'center', gap: '12px' },
  amount: { fontWeight: '700', fontSize: '1rem', color: 'var(--text-main)' },
  addBtn: {
    padding: '20px', borderRadius: '20px', border: '1px dashed var(--primary)',
    color: 'var(--secondary)', fontWeight: '600', background: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  totalCard: { padding: '24px', borderRadius: '28px', backgroundColor: 'var(--surface-color)', textAlign: 'center' },
  totalLabel: { fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' },
  totalValue: { fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-heading)' }
};

export default PaymentsModule;
