import React from 'react';
import { Plus, Search, Tag } from 'lucide-react';

const TransactionList = ({ transactions, categories, onAddClick }) => {
  return (
    <div className="animate-fade">
      <div style={styles.header}>
        <h1 style={{ marginBottom: '4px' }}>Transacciones</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {transactions.length} movimientos realizados
        </p>
      </div>

      <div style={styles.listContainer}>
        {transactions.length === 0 ? (
          <div className="glass" style={styles.emptyState}>
            <Search size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <p>No hay movimientos registrados</p>
          </div>
        ) : (
          transactions.map((tx) => {
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
