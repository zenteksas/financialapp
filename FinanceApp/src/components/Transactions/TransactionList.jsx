import React from 'react';
import { Plus, Search, Tag, Settings, Building2, Wallet, PiggyBank, CreditCard, Coins, MoveRight } from 'lucide-react';

const ICONS = { Building2, Wallet, PiggyBank, CreditCard, Coins };

const TransactionList = ({ transactions, categories, accounts, onAddClick, onAccountClick, onAddAccount }) => {
  return (
    <div className="animate-fade">
      <div style={styles.header}>
        <h1 style={{ marginBottom: '4px' }}>Transacciones</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {transactions.length} movimientos realizados
        </p>
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
                  <p style={styles.accBalance}>${acc.currentBalance?.toLocaleString() || '0'}</p>
                </div>
                {!acc.includeInTotal && <div style={styles.hiddenIndicator} title="No suma al balance" />}
              </div>
            );
          })}
        </div>
      </section>

      <div style={styles.listContainer}>
        {transactions.length === 0 ? (
          <div className="glass" style={styles.emptyState}>
            <Search size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <p>No hay movimientos registrados</p>
          </div>
        ) : (
          transactions.map((tx) => {
            if (tx.type === 'transfer') {
              const fromAcc = accounts.find(a => a.id === tx.fromAccountId) || { name: '?' };
              const toAcc = accounts.find(a => a.id === tx.toAccountId) || { name: '?' };
              return (
                <div key={tx.id} className="glass" style={styles.item}>
                  <div style={styles.itemIcon('var(--primary)')}>
                    <MoveRight size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {fromAcc.name} <MoveRight size={14} /> {toAcc.name}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{tx.date} • Transferencia</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: '700', color: 'var(--text-main)' }}>
                      ${tx.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            }

            const category = categories.find(c => c.id === tx.categoryId) || {};
            return (
              <div key={tx.id} className="glass" style={styles.item}>
                <div style={styles.itemIcon(category.color)}>
                  <Tag size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '600' }}>{tx.note || category.name}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{tx.date}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={styles.amount(tx.type)}>
                    {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

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
    marginTop: '24px',
  },
  accountsSection: { marginBottom: '24px' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  addAccBtn: { fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600', padding: '4px 8px', borderRadius: '8px', background: 'rgba(79, 70, 229, 0.1)' },
  accountsScroll: {
    display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px',
    msOverflowStyle: 'none', scrollbarWidth: 'none',
  },
  accCard: (color) => ({
    flex: '0 0 140px', padding: '16px', borderRadius: '20px', cursor: 'pointer',
    borderLeft: `4px solid ${color}`, position: 'relative',
  }),
  accIconWrap: { marginBottom: '12px', color: 'var(--text-muted)' },
  accName: { fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' },
  accBalance: { fontSize: '1rem', fontWeight: '700' },
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
    borderRadius: '20px',
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
