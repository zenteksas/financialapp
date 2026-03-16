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
import OnboardingView from './components/Onboarding/OnboardingView';
import ProfileModal from './components/Settings/ProfileModal';
import { db } from './utils/db';
import { Menu, ChevronDown, Bell, User, Edit2, Smile, Heart, Zap, Coffee, Gamepad, Rocket, Star, Trash2 } from 'lucide-react';

const AVATAR_ICONS = { User, Smile, Heart, Zap, Coffee, Gamepad, Rocket, Star };

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
  const [userProfile, setUserProfile] = useState(db.getProfile());
  const [currency, setCurrency] = useState(db.getCurrency());
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const [editingAccount, setEditingAccount] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [defaultCategoryType, setDefaultCategoryType] = useState('expense');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [totals, setTotals] = useState({ balance: 0, income: 0, expenses: 0, accountBalances: [] });
  const [selectedAccountId, setSelectedAccountId] = useState(null); // null means "All accounts"
  const [isAccountSelectorOpen, setIsAccountSelectorOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalModalType, setGoalModalType] = useState('income'); // 'income' or 'expense'
  const [goalInputValue, setGoalInputValue] = useState(0);
  const [editingTransaction, setEditingTransaction] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTransactions(db.getTransactions());
    setDebts(db.getDebts());
    setAccounts(db.getAccounts());
    setCategories(db.getCategories());
    setUserProfile(db.getProfile());
    setCurrency(db.getCurrency());
    setTotals(db.getTotals());
  };

  const handleSaveAccount = (data) => {
    const processedData = {
      ...data,
      balance: parseFloat(data.balance) || 0
    };
    db.addAccount(processedData);
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
    setEditingTransaction(null);
    setSelectedCategoryId(null); // Clear after use
    loadData();
    // No need to switch tab if editing from dashboard
  };

  const handleEditTransaction = (tx) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  const handleSaveCategory = (data) => {
    db.addCategory(data);
    loadData();
    // Use the name to find the one we just added if it's new
    if (!data.id) {
      const updatedCats = db.getCategories();
      const newCat = updatedCats.find(c => c.name === data.name);
      if (newCat) setSelectedCategoryId(newCat.id);
    }
  };

  const handleDeleteCategory = (id) => {
    db.deleteCategory(id);
    loadData();
    setIsCategoryModalOpen(false);
  };

  const handleSaveProfile = (data) => {
    db.saveProfile(data);
    loadData();
  };

  const handleOnboardingComplete = ({ profile, currency, initialAccount }) => {
    db.saveProfile(profile);
    db.saveCurrency(currency);
    db.addAccount(initialAccount);
    loadData();
  };

  if (!userProfile.onboardingComplete) {
    return <OnboardingView onComplete={handleOnboardingComplete} />;
  }

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
            currency={currency}
            userProfile={userProfile}
            onEditGoals={(type) => {
              setGoalModalType(type);
              setGoalInputValue(type === 'income' ? db.getIncome() : db.getExpectedExpenses());
              setIsGoalModalOpen(true);
            }}
            onEditTransaction={handleEditTransaction}
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
            <div className="glass" style={{ padding: '24px', borderRadius: '24px', marginBottom: '24px' }}>
              <h4 style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>Mi Perfil</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '20px', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {(() => {
                    const AvatarIcon = AVATAR_ICONS[userProfile.avatar];
                    if (AvatarIcon) return <AvatarIcon color="var(--primary)" size={30} />;
                    return (
                      <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '1.25rem' }}>
                        {userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </span>
                    );
                  })()}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '600', fontSize: '1.1rem' }}>{userProfile.name}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Toca el lápiz para editar tu información</p>
                </div>
                <button 
                  onClick={() => setIsProfileModalOpen(true)}
                  style={{ background: 'none', color: 'var(--primary)', cursor: 'pointer' }}
                >
                  <Edit2 size={20} />
                </button>
              </div>
            </div>

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

            <div style={{ marginTop: '32px', textAlign: 'center' }}>
              <button 
                className="glass"
                style={{ 
                  padding: '16px 32px', 
                  borderRadius: '16px', 
                  backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                  color: 'var(--danger)', 
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  margin: '0 auto'
                }}
                onClick={() => {
                  if (window.confirm('¿Estás seguro de que quieres reiniciar la aplicación? Se borrarán TODOS tus datos permanentemente.')) {
                    db.reset();
                    window.location.reload();
                  }
                }}
              >
                <Trash2 size={20} />
                Reiniciar Aplicación
              </button>
              <p style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Esta acción borrará transacciones, cuentas y configuraciones.
              </p>
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
          userProfile={userProfile}
          onEditGoals={(type) => {
            setGoalModalType(type);
            setGoalInputValue(type === 'income' ? db.getIncome() : db.getExpectedExpenses());
            setIsGoalModalOpen(true);
          }}
        />
      );
    }
  };

  return (
    <>
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        userProfile={userProfile}
        totalBalance={totals.balance}
        onNavigate={setActiveTab}
        activeTab={activeTab}
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
        onClose={() => { setIsModalOpen(false); setEditingTransaction(null); }}
        onSave={handleSaveTransaction}
        categories={categories}
        accounts={accounts}
        currency={currency}
        onAddCategory={(type) => {
          setDefaultCategoryType(type);
          setIsCategoryModalOpen(true);
        }}
        initialCategoryId={selectedCategoryId}
        initialData={editingTransaction}
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
        currency={currency}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleSaveProfile}
        initialData={userProfile}
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

      {/* Goal Edit Modal */}
      {isGoalModalOpen && (
        <div className="modal-overlay" onClick={() => setIsGoalModalOpen(false)}>
          <div className="glass modal-content animate-slide-up" onClick={e => e.stopPropagation()} style={{ padding: '24px', borderRadius: '32px 32px 0 0', position: 'fixed', bottom: 0, left: 0, right: 0, maxWidth: '600px', margin: '0 auto' }}>
            <h3 style={{ marginBottom: '12px', textAlign: 'center' }}>
              {goalModalType === 'income' ? 'Editar Meta de Ingresos' : 'Editar Meta de Gastos'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', marginBottom: '20px' }}>
              Define tu valor mensual esperado para calcular tu salud financiera.
            </p>
            <div style={{ marginBottom: '20px' }}>
              <input 
                type="number" 
                value={goalInputValue}
                onChange={(e) => setGoalInputValue(e.target.value)}
                placeholder="Ej: 3000000"
                style={{
                  width: '100%', padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--glass-border)', color: 'white', outline: 'none', fontSize: '1.1rem'
                }}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setIsGoalModalOpen(false)} 
                style={{ flex: 1, padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontWeight: '600' }}
              >
                Cancelar
              </button>
              <button 
                onClick={() => { 
                  if (goalModalType === 'income') db.saveIncome(parseFloat(goalInputValue) || 0);
                  else db.saveExpectedExpenses(parseFloat(goalInputValue) || 0);
                  loadData();
                  setIsGoalModalOpen(false); 
                }}
                style={{ flex: 1, padding: '16px', borderRadius: '16px', background: 'var(--primary)', color: 'white', fontWeight: '700' }}
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
