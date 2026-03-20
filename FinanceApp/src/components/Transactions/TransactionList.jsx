import React from 'react';
import { Plus, Search, Tag, Settings, Building2, Wallet, PiggyBank, CreditCard, Coins, MoveRight, X, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const ICONS = { Building2, Wallet, PiggyBank, CreditCard, Coins };

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  // Avoid parser shifts by adding midday time
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).replace('.', '');
};

const TransactionList = ({ transactions, categories, accounts, onAddClick, onAccountClick, onAddAccount, currency }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('all'); // all, income, expense, transfer

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = (tx.note || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (categories.find(c => c.id === tx.categoryId)?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="animate-fade">
      <div style={styles.header}>
        <h1 style={{ marginBottom: '4px' }}>Transacciones</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {filteredTransactions.length} movimientos encontrados
        </p>
      </div>

      <div style={styles.searchBar}>
        <div style={styles.searchInputWrap}>
          <Search size={18} style={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Buscar por nota o categoría..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} style={styles.clearBtn}>
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div style={styles.filterBar}>
        {['all', 'income', 'expense', 'transfer'].map(type => (
          <button 
            key={type}
            onClick={() => setTypeFilter(type)}
            style={styles.filterChip(typeFilter === type)}
          >
            {type === 'all' ? 'Todo' : type === 'income' ? 'Ingresos' : type === 'expense' ? 'Gastos' : 'Transf.'}
          </button>
        ))}
      </div>

      <section style={styles.accountsSection}>
        <div style={styles.sectionHeader}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Mis Cuentas</h3>
          <button onClick={onAddAccount} style={styles.addAccBtn}>Nueva</button>
        </div>
        <div style={styles.accountsScroll}>
          {accounts.map(acc => {
            const Icon = ICONS[acc.icon] || Wallet;
            return (
              <div 
                key={acc.id} 
                className="glass" 
                style={styles.accCard(acc.color)}
                onClick={() => onAccountClick(acc)}
              >
                <div style={styles.accIconWrap}>
                  <Icon size={18} />
                </div>
                <div>
                  <p style={styles.accName}>{acc.name}</p>
                  <p style={styles.accBalance}>{acc.currentBalance?.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {currency}</p>
                </div>
                {!acc.includeInTotal && <div style={styles.hiddenIndicator} title="No suma al balance" />}
              </div>
            );
          })}
        </div>
      </section>

      <motion.div 
        style={styles.listContainer}
        variants={container}
        initial="hidden"
        animate="show"
      >
        {filteredTransactions.length === 0 ? (
          <motion.div variants={itemAnim} className="glass" style={styles.emptyState}>
            <Search size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <p>{searchTerm || typeFilter !== 'all' ? 'No se encontraron resultados' : 'No hay movimientos registrados'}</p>
          </motion.div>
        ) : (
          filteredTransactions.map((tx) => {
            const isTransfer = tx.type === 'transfer';
            const category = !isTransfer ? (categories.find(c => c.id === tx.categoryId) || {}) : null;
            const fromAcc = isTransfer ? (accounts.find(a => a.id === tx.fromAccountId) || { name: '?' }) : null;
            const toAcc = isTransfer ? (accounts.find(a => a.id === tx.toAccountId) || { name: '?' }) : null;

            return (
              <motion.div 
                key={tx.id} 
                variants={itemAnim}
                className="glass" 
                style={styles.item}
              >
                {isTransfer ? (
                  <>
                    <div style={styles.itemIcon('var(--primary)')}>
                      <MoveRight size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {fromAcc.name} <MoveRight size={14} /> {toAcc.name}
                      </p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatDate(tx.date)} • Transferencia</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: '700', color: 'var(--text-main)' }}>
                        {tx.amount.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {currency}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={styles.itemIcon(category.color)}>
                      <Tag size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: '600' }}>{tx.note || category.name}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatDate(tx.date)}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={styles.amount(tx.type)}>
                        {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {currency}
                      </p>
                    </div>
                  </>
                )}
              </motion.div>
            );
          })
        )}
      </motion.div>

      <button onClick={onAddClick} style={styles.fab}>
        <Plus color="white" size={32} />
      </button>
    </div>
  );
};

const styles = {
  header: {
    marginBottom: '24px',
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '16px',
  },
  searchBar: {
    marginBottom: '16px',
  },
  searchInputWrap: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '14px',
    padding: '0 12px',
    border: '1px solid var(--glass-border)',
  },
  searchIcon: {
    color: 'var(--text-muted)',
    marginRight: '12px',
  },
  searchInput: {
    flex: 1,
    background: 'none',
    border: 'none',
    color: 'var(--text-main)',
    padding: '12px 0',
    fontSize: '0.9rem',
    outline: 'none',
  },
  clearBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    padding: '4px',
    cursor: 'pointer',
  },
  filterBar: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    paddingBottom: '4px',
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
  },
  filterChip: (active) => ({
    padding: '8px 16px',
    borderRadius: '12px',
    backgroundColor: active ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255, 255, 255, 0.05)',
    color: active ? 'var(--secondary)' : 'var(--text-muted)',
    border: active ? '1px solid rgba(74, 222, 128, 0.3)' : '1px solid var(--glass-border)',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s',
  }),
  accountsSection: { marginBottom: '24px' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  addAccBtn: { fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600', padding: '4px 8px', borderRadius: '8px', background: 'rgba(79, 70, 229, 0.1)' },
  accountsScroll: {
    display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px',
    msOverflowStyle: 'none', scrollbarWidth: 'none',
  },
  accCard: (color) => ({
    flex: '0 0 140px', padding: '16px', borderRadius: '24px', cursor: 'pointer',
    borderLeft: `4px solid ${color}`, position: 'relative',
  }),
  accIconWrap: { marginBottom: '12px', color: 'var(--text-muted)' },
  accName: { fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' },
  accBalance: { fontSize: '1rem', fontWeight: '800' },
  hiddenIndicator: {
    position: 'absolute', top: '10px', right: '10px', width: '6px', height: '6px',
    borderRadius: '50%', backgroundColor: 'var(--text-muted)', opacity: 0.5
  },
  emptyState: {
    padding: '60px 20px',
    borderRadius: '24px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  item: {
    padding: '16px',
    borderRadius: '18px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  itemIcon: (color) => ({
    width: '44px',
    height: '44px',
    borderRadius: '14px',
    backgroundColor: `${color}20`,
    color: color || 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  amount: (type) => ({
    fontWeight: '700',
    color: type === 'income' ? 'var(--secondary)' : 'var(--danger)',
  }),
  fab: {
    position: 'fixed',
    bottom: 'calc(var(--nav-height) + 20px)',
    right: '20px',
    width: '60px',
    height: '60px',
    borderRadius: '30px',
    backgroundColor: 'var(--primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 16px var(--primary-glow)',
    zIndex: 100,
  }
};

export default TransactionList;
