import React, { useState, useEffect } from 'react';
import Sidebar from './components/Layout/Sidebar';
import TransactionList from './components/Transactions/TransactionList';
import TransactionModal from './components/Transactions/TransactionModal';
import DebtsModule from './components/Debts/DebtsModule';
import StatsDashboard from './components/Statistics/StatsDashboard';
import AccountModal from './components/Transactions/AccountModal';
import CategoryModal from './components/Settings/CategoryModal';
import CategoryGrid from './components/Settings/CategoryGrid';
import PerformanceStats from './components/Statistics/PerformanceStats';
import PaymentsModule from './components/Transactions/PaymentsModule';
import RemindersModule from './components/Settings/RemindersModule';
import { db } from './utils/db';
import { Menu, ChevronDown, Bell } from 'lucide-react';

const DashboardView = ({ totals, recentTransactions, currency }) => (
  <div className="animate-fade">
    <header style={{ marginBottom: '32px' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Hola, Ronald</h1>
      <p style={{ color: 'var(--text-muted)' }}>Bienvenido a tu Gestor de Finanzas</p>
    </header>

    <div className="glass" style={styles.balanceCard}>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>Saldo Total</p>
      <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '24px' }}>
        {totals.balance.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {currency}
      </h2>
      
      <div style={styles.summaryRow}>
        <div style={styles.summaryItem}>
          <TrendingUp size={16} color="var(--secondary)" style={{ marginRight: '6px' }} />
          <div>
            <p style={styles.summaryLabel}>Ingresos</p>
            <p style={styles.summaryValue}>+{totals.income.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {currency}</p>
          </div>
        </div>
        <div style={styles.summaryItem}>
          <TrendingDown size={16} color="var(--danger)" style={{ marginRight: '6px' }} />
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

const styles = {
  topBar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 20px', backgroundColor: 'var(--bg-color)',
    position: 'sticky', top: 0, zIndex: 1000
  },
  menuBtn: { background: 'none', border: 'none', color: 'var(--text-heading)', cursor: 'pointer' },
  totalSelector: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' },
  totalLabel: { fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' },
  totalAmount: { fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-heading)' },
  pageContainer: {
    padding: '0 20px 100px 20px',
    maxWidth: '600px',
    margin: '0 auto',
  }
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [debts, setDebts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  
  const [editingAccount, setEditingAccount] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [defaultCategoryType, setDefaultCategoryType] = useState('expense');
  const [totals, setTotals] = useState({ balance: 0, income: 0, expenses: 0, accountBalances: [] });
  const [selectedAccountId, setSelectedAccountId] = useState(null); // null means "All accounts"
  const [isAccountSelectorOpen, setIsAccountSelectorOpen] = useState(false);
  const [currency, setCurrency] = useState('COP');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const txs = db.getTransactions();
    const cats = db.getCategories();
    const ds = db.getDebts();
    const accs = db.getAccounts();
    const currentTotals = db.getTotals();
    const currentCurrency = db.getCurrency();
    
    setTransactions(txs);
    setCategories(cats);
    setDebts(ds);
    setAccounts(currentTotals.accountBalances || accs);
    setTotals(currentTotals);
    setCurrency(currentCurrency);
  };

  const handleSaveAccount = (data) => {
    db.addAccount(data);
    loadData();
  };

  const handleDeleteAccount = (id) => {
    db.deleteAccount(id);
    loadData();
    setIsAccountModalOpen(false);
  };

  const handleAccountClick = (acc) => {
    setEditingAccount(acc);
    setIsAccountModalOpen(true);
  };

  const handleAddAccount = () => {
    setEditingAccount(null);
    setIsAccountModalOpen(true);
  };

  const handleSaveTransaction = (newTx) => {
    db.addTransaction(newTx);
    loadData();
    setActiveTab('dashboard');
  };

  const handleSaveCategory = (data) => {
    db.addCategory(data);
    loadData();
  };

  const handleDeleteCategory = (id) => {
    db.deleteCategory(id);
    loadData();
    setIsCategoryModalOpen(false);
  };

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard': 
        return (
          <StatsDashboard 
            transactions={transactions} 
            categories={categories} 
            onAddClick={() => setIsModalOpen(true)}
            selectedAccountId={selectedAccountId}
            accounts={accounts}
          />
        );
      case 'stats': 
        return <PerformanceStats transactions={transactions} currency={currency} />;
      case 'payments':
        return <PaymentsModule currency={currency} />;
      case 'reminders':
        return <RemindersModule currency={currency} />;
      case 'transactions': 
        return (
          <TransactionList 
            transactions={transactions} 
            categories={categories} 
            accounts={accounts}
            onAddClick={() => setIsModalOpen(true)} 
            onAccountClick={handleAccountClick}
            onAddAccount={handleAddAccount}
            currency={currency}
          />
        );
      case 'accounts':
        return (
          <div className="animate-fade">
             <h2 style={{ marginBottom: '20px' }}>Mis Cuentas</h2>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
               {accounts.map(acc => (
                 <div key={acc.id} className="glass" style={{ padding: '20px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => handleAccountClick(acc)}>
                    <div>
                      <p style={{ fontWeight: '600' }}>{acc.name}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{acc.includeInTotal ? 'Sumado al balance' : 'Oculto'}</p>
                    </div>
                    <p style={{ fontWeight: '700', fontSize: '1.2rem' }}>{acc.currentBalance?.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {currency}</p>
                 </div>
               ))}
               <button onClick={handleAddAccount} className="glass" style={{ padding: '16px', borderRadius: '16px', color: 'var(--primary)', fontWeight: '600', border: '1px dashed var(--primary)' }}>
                 + Añadir Nueva Cuenta
               </button>
             </div>
          </div>
        );
      case 'categories':
        return (
          <CategoryGrid 
            categories={categories}
            onCategoryClick={(cat) => { setEditingCategory(cat); setIsCategoryModalOpen(true); }}
            onCreateClick={(type) => { 
              setEditingCategory(null); 
              setDefaultCategoryType(type);
              setIsCategoryModalOpen(true); 
            }}
          />
        );
      case 'debts': 
        return <DebtsModule debts={debts} totals={totals} onUpdate={loadData} currency={currency} />;
      case 'settings':
        return (
          <div className="animate-fade">
            <h2 style={{ marginBottom: '24px' }}>Ajustes</h2>
            <div className="glass" style={{ padding: '24px', borderRadius: '24px' }}>
              <h4 style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>Tipo de Divisa</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {['COP', 'USD', 'EUR'].map(curr => (
                  <button 
                    key={curr}
                    className="glass"
                    style={{ 
                      padding: '16px', 
                      borderRadius: '16px', 
                      border: currency === curr ? '2px solid var(--secondary)' : '1px solid rgba(255,255,255,0.05)',
                      textAlign: 'left',
                      fontWeight: '600',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                    onClick={() => {
                      db.saveCurrency(curr);
                      setCurrency(curr);
                    }}
                  >
                    <span>{curr === 'COP' ? 'Peso Colombiano (COP)' : curr === 'USD' ? 'Dólar Estadounidense (USD)' : 'Euro (EUR)'}</span>
                    {currency === curr && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--secondary)' }} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      default: return (
        <StatsDashboard 
          transactions={transactions} 
          categories={categories} 
          onAddClick={() => setIsModalOpen(true)}
          selectedAccountId={selectedAccountId}
          accounts={accounts}
          currency={currency}
        />
      );
    }
  };

  return (
    <>
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        userName="Ronald Barrera" 
        totalBalance={totals.balance}
        activeTab={activeTab}
        onNavigate={setActiveTab}
        currency={currency}
      />

      <div style={styles.topBar}>
        <button style={styles.menuBtn} onClick={() => setIsSidebarOpen(true)}>
          <Menu size={28} />
        </button>
        <button 
          style={{ ...styles.menuBtn, ...styles.totalSelector }} 
          onClick={() => setIsAccountSelectorOpen(true)}
        >
          <span style={styles.totalLabel}>
            {selectedAccountId ? accounts.find(a => a.id === selectedAccountId)?.name : 'Total'} <ChevronDown size={14} />
          </span>
          <span style={styles.totalAmount}>
            {selectedAccountId 
              ? accounts.find(a => a.id === selectedAccountId)?.currentBalance?.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) 
              : totals.balance.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
            } {currency}
          </span>
        </button>
        <button style={styles.menuBtn}>
          <Bell size={24} />
        </button>
      </div>

      <div style={styles.pageContainer}>
        {renderView()}
      </div>
      
      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveTransaction}
        categories={categories}
        accounts={accounts}
        currency={currency}
      />

      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onSave={handleSaveAccount}
        onDelete={handleDeleteAccount}
        initialData={editingAccount}
        currency={currency}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={handleSaveCategory}
        onDelete={handleDeleteCategory}
        initialData={editingCategory}
        type={defaultCategoryType}
      />

      {/* Account Selector Modal */}
      {isAccountSelectorOpen && (
        <div className="modal-overlay" onClick={() => setIsAccountSelectorOpen(false)}>
          <div className="glass modal-content animate-slide-up" onClick={e => e.stopPropagation()} style={{ padding: '24px', borderRadius: '32px 32px 0 0', position: 'fixed', bottom: 0, left: 0, right: 0, maxWidth: '600px', margin: '0 auto' }}>
            <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>Seleccionar Cuenta</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                className="glass" 
                style={{ padding: '16px', borderRadius: '16px', border: !selectedAccountId ? '2px solid var(--secondary)' : 'none', textAlign: 'left', fontWeight: '600' }}
                onClick={() => { setSelectedAccountId(null); setIsAccountSelectorOpen(false); }}
              >
                Todas las cuentas
              </button>
              {accounts.map(acc => (
                <button 
                  key={acc.id} 
                  className="glass" 
                  style={{ padding: '16px', borderRadius: '16px', border: selectedAccountId === acc.id ? '2px solid var(--secondary)' : 'none', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  onClick={() => { setSelectedAccountId(acc.id); setIsAccountSelectorOpen(false); }}
                >
                  <span style={{ fontWeight: '600' }}>{acc.name}</span>
                  <span style={{ fontWeight: '700' }}>{acc.currentBalance?.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {currency}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
