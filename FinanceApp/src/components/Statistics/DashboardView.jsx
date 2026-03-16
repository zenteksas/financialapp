import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const styles = {
  balanceCard: {
    padding: '32px',
    borderRadius: '32px',
    background: 'linear-gradient(135deg, var(--primary) 0%, #4338ca 100%)',
    color: 'white',
    boxShadow: '0 20px 40px rgba(79, 70, 229, 0.3)',
    marginBottom: '32px'
  },
  summaryRow: {
    display: 'flex',
    gap: '16px',
    marginTop: '24px',
    paddingTop: '24px',
    borderTop: '1px solid rgba(255,255,255,0.1)'
  },
  summaryItem: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  summaryLabel: {
    fontSize: '0.75rem',
    opacity: 0.8,
    marginBottom: '2px'
  },
  summaryValue: {
    fontSize: '1rem',
    fontWeight: '700'
  },
  smallItem: {
    padding: '16px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.03)'
  }
};

const DashboardView = ({ totals, recentTransactions, currency, userProfile, onEditGoals }) => (
  <div className="animate-fade">
    <header style={{ marginBottom: '32px' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Hola, {userProfile?.name || 'Usuario'}</h1>
      <p style={{ color: 'var(--text-muted)' }}>Bienvenido a tu Gestor de Finanzas</p>
    </header>

    <div className="glass" style={styles.balanceCard}>
      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '8px' }}>Saldo Total</p>
      <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '24px' }}>
        {totals.balance.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {currency}
      </h2>
      
      <div style={styles.summaryRow}>
        <div 
          style={{ ...styles.summaryItem, cursor: 'pointer' }}
          onClick={() => onEditGoals('income')}
          title="Editar meta de ingresos"
        >
          <div style={{ padding: '8px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.2)' }}>
            <TrendingUp size={18} color="#10b981" />
          </div>
          <div>
            <p style={styles.summaryLabel}>Ingresos</p>
            <p style={styles.summaryValue}>+{totals.income.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {currency}</p>
          </div>
        </div>
        <div 
          style={{ ...styles.summaryItem, cursor: 'pointer' }}
          onClick={() => onEditGoals('expense')}
          title="Editar meta de gastos"
        >
          <div style={{ padding: '8px', borderRadius: '12px', backgroundColor: 'rgba(239, 68, 68, 0.2)' }}>
            <TrendingDown size={18} color="#ef4444" />
          </div>
          <div>
            <p style={styles.summaryLabel}>Gastos</p>
            <p style={styles.summaryValue}>-{totals.expenses.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {currency}</p>
          </div>
        </div>
      </div>
    </div>

    <div style={{ marginTop: '32px' }}>
      <h3 style={{ marginBottom: '16px' }}>Actividad Reciente</h3>
      {recentTransactions.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No hay movimientos aún.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {recentTransactions.slice(0, 3).map(tx => (
            <div key={tx.id} className="glass" style={styles.smallItem}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: '500', fontSize: '0.9rem' }}>{tx.note || 'Transacción'}</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{tx.date}</p>
              </div>
              <p style={{ fontWeight: '600', color: tx.type === 'income' ? 'var(--secondary)' : 'var(--danger)', fontSize: '0.9rem' }}>
                {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {currency}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

export default DashboardView;
