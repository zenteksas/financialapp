import React, { useState, useEffect } from 'react';
import BottomNav from './components/Layout/BottomNav';
import TransactionList from './components/Transactions/TransactionList';
import TransactionModal from './components/Transactions/TransactionModal';
import DebtsModule from './components/Debts/DebtsModule';
import StatsDashboard from './components/Statistics/StatsDashboard';
import { db } from './utils/db';
import { TrendingUp, TrendingDown } from 'lucide-react';

const DashboardView = ({ totals, recentTransactions }) => (
  <div className="animate-fade">
    <header style={{ marginBottom: '32px' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Hola, Ronald</h1>
      <p style={{ color: 'var(--text-muted)' }}>Bienvenido a tu Gestor de Finanzas</p>
    </header>

    <div className="glass" style={styles.balanceCard}>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>Saldo Total</p>
      <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '24px' }}>
        ${totals.balance.toFixed(2)}
      </h2>
      
      <div style={styles.summaryRow}>
        <div style={styles.summaryItem}>
          <TrendingUp size={16} color="var(--secondary)" style={{ marginRight: '6px' }} />
          <div>
            <p style={styles.summaryLabel}>Ingresos</p>
            <p style={styles.summaryValue}>+${totals.income.toFixed(2)}</p>
          </div>
        </div>
        <div style={styles.summaryItem}>
          <TrendingDown size={16} color="var(--danger)" style={{ marginRight: '6px' }} />
          <div>
            <p style={styles.summaryLabel}>Gastos</p>
            <p style={styles.summaryValue}>-${totals.expenses.toFixed(2)}</p>
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
                {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

const styles = {
  balanceCard: {
    padding: '32px 24px',
    borderRadius: '32px',
    backgroundColor: 'var(--surface-color)',
    position: 'relative',
    overflow: 'hidden',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '20px',
    borderTop: '1px solid var(--glass-border)',
  },
  summaryItem: {
    display: 'flex',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  summaryValue: {
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  smallItem: {
    padding: '12px 16px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
  }
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [debts, setDebts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totals, setTotals] = useState({ balance: 0, income: 0, expenses: 0, totalDebt: 0, totalDebtQuota: 0, debtRatio: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const txs = db.getTransactions();
    const cats = db.getCategories();
    const ds = db.getDebts();
    setTransactions(txs);
    setCategories(cats);
    setDebts(ds);
    setTotals(db.getTotals());
  };

  const handleSaveTransaction = (newTx) => {
    db.addTransaction(newTx);
    loadData();
    setActiveTab('transactions');
  };

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard': 
        return <DashboardView totals={totals} recentTransactions={transactions} />;
      case 'transactions': 
        return (
          <TransactionList 
            transactions={transactions} 
            categories={categories} 
            onAddClick={() => setIsModalOpen(true)} 
          />
        );
      case 'debts': 
        return (
          <DebtsModule 
            debts={debts} 
            totals={totals} 
            onUpdate={loadData} 
          />
        );
      case 'stats': 
        return (
          <StatsDashboard transactions={transactions} />
        );
      default: return <DashboardView totals={totals} recentTransactions={transactions} />;
    }
  };

  return (
    <>
      <div className="page-container">
        {renderView()}
      </div>
      
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveTransaction}
        categories={categories}
      />
    </>
  );
}

export default App;
