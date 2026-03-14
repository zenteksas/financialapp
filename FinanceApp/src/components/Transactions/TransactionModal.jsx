import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

const TransactionModal = ({ isOpen, onClose, onSave, categories, accounts, currency }) => {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState(accounts[0]?.id || 'default');
  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || 'default');
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || accounts[0]?.id || 'default');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;
    
    onSave({
      amount: parseFloat(amount),
      type,
      accountId: type === 'transfer' ? null : accountId,
      fromAccountId: type === 'transfer' ? fromAccountId : null,
      toAccountId: type === 'transfer' ? toAccountId : null,
      categoryId: type === 'transfer' ? null : categoryId,
      note,
      date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
    });
    
    // Reset and close
    setAmount('');
    setNote('');
    onClose();
  };

  return (
    <div style={styles.overlay} className="animate-fade">
      <div className="glass" style={styles.modal}>
        <div style={styles.header}>
          <h3>Nuevo Movimiento</h3>
          <button onClick={onClose} style={styles.closeBtn}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.typeSelector}>
            <button
              type="button"
              onClick={() => setType('expense')}
              style={styles.typeBtn(type === 'expense', 'var(--danger)')}
            >
              Gasto
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              style={styles.typeBtn(type === 'income', 'var(--secondary)')}
            >
              Ingreso
            </button>
            <button
              type="button"
              onClick={() => setType('transfer')}
              style={styles.typeBtn(type === 'transfer', 'var(--primary)')}
            >
              Transferir
            </button>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Monto ({currency})</label>
            <input
              autoFocus
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          {type === 'transfer' ? (
            <>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Desde Cuenta</label>
                <select
                  value={fromAccountId}
                  onChange={(e) => setFromAccountId(e.target.value)}
                  style={styles.input}
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Hacia Cuenta</label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  style={styles.input}
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Cuenta</label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  style={styles.input}
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Categoría</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  style={styles.input}
                >
                  {categories.filter(c => c.type === type).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Nota (Opcional)</label>
            <input
              type="text"
              placeholder="¿Para qué fue?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={styles.input}
            />
          </div>

          <button type="submit" style={styles.saveBtn}>
            <Check size={20} style={{ marginRight: '8px' }} />
            Guardar
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'flex-end',
    zIndex: 2000,
    backdropFilter: 'blur(4px)',
  },
  modal: {
    width: '100%',
    borderTopLeftRadius: '32px',
    borderTopRightRadius: '32px',
    padding: '32px 24px calc(32px + var(--safe-area-bottom))',
    boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  closeBtn: {
    padding: '8px',
    background: 'none',
    color: 'var(--text-muted)',
  },
  typeSelector: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
  },
  typeBtn: (active, color) => ({
    flex: 1,
    padding: '12px',
    borderRadius: '16px',
    backgroundColor: active ? `${color}20` : 'rgba(255,255,255,0.05)',
    color: active ? color : 'var(--text-muted)',
    fontWeight: '600',
    border: `1px solid ${active ? color : 'transparent'}`,
  }),
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '16px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--glass-border)',
    color: 'var(--text-main)',
    fontSize: '1rem',
    outline: 'none',
  },
  saveBtn: {
    width: '100%',
    padding: '16px',
    borderRadius: '18px',
    backgroundColor: 'var(--primary)',
    color: 'white',
    fontWeight: '700',
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '12px',
  }
};

export default TransactionModal;
