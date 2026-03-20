import React, { useState, useEffect } from 'react';
import { X, Check, Plus, Tag, Trash2 } from 'lucide-react';

const ICONS = { Tag }; // Fallback for simple display

const TransactionModal = ({ isOpen, onClose, onSave, onDelete, categories, accounts, currency, onAddCategory, initialCategoryId, initialData }) => {
  const [type, setType] = useState(initialData?.type || 'expense');
  const [amount, setAmount] = useState(initialData?.amount || '');
  const [accountId, setAccountId] = useState(initialData?.accountId || accounts[0]?.id || 'default');
  const [fromAccountId, setFromAccountId] = useState(initialData?.fromAccountId || '');
  const [toAccountId, setToAccountId] = useState(initialData?.toAccountId || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || initialCategoryId || categories.filter(c => c.type === type)[0]?.id || '');
  const [note, setNote] = useState(initialData?.note || '');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);

  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (isOpen && !hasInitialized) {
      if (initialData && initialData.id) {
        // Mode: EDITING
        setType(initialData.type);
        setAmount(initialData.amount);
        setAccountId(initialData.accountId || accounts[0]?.id || 'default');
        setFromAccountId(initialData.fromAccountId || accounts[0]?.id || 'default');
        setToAccountId(initialData.toAccountId || accounts[1]?.id || accounts[0]?.id || 'default');
        setCategoryId(initialData.categoryId || '');
        setNote(initialData.note || '');
      } else if (initialData && initialData.type) {
        // Mode: NEW but with pre-selected type (Contextual FAB)
        setType(initialData.type);
        setAmount('');
        setAccountId(accounts[0]?.id || 'default');
        setFromAccountId('');
        setToAccountId('');
        setCategoryId(initialCategoryId || categories.filter(c => c.type === initialData.type)[0]?.id || '');
        setNote('');
        setDate(new Date().toISOString().split('T')[0]);
      } else {
        // Mode: NEW default
        setType('expense');
        setAmount('');
        setAccountId(accounts[0]?.id || 'default');
        setFromAccountId('');
        setToAccountId('');
        setCategoryId(initialCategoryId || categories.filter(c => c.type === 'expense')[0]?.id || '');
        setNote('');
        setDate(new Date().toISOString().split('T')[0]);
      }
      setHasInitialized(true);
    }
    
    if (!isOpen && hasInitialized) {
      setHasInitialized(false);
    }
  }, [isOpen, initialData, initialCategoryId, categories, accounts, hasInitialized]);

  // Update default category when type changes (only if not editing)
  useEffect(() => {
    if (!initialData && !initialCategoryId && isOpen) {
      const firstCat = categories.find(c => c.type === type);
      if (firstCat) setCategoryId(firstCat.id);
    }
  }, [type, categories, initialData, initialCategoryId, isOpen]);
 
  const formatAmountDisplay = (val) => {
    if (val === null || val === undefined || val === '') return '';
    const numericStr = val.toString().replace(/\D/g, '');
    if (!numericStr) return '';
    return numericStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleAmountChange = (e) => {
    let rawValue = e.target.value.replace(/\D/g, '');
    if (rawValue.length > 1 && rawValue.startsWith('0')) {
      rawValue = rawValue.replace(/^0+/, '');
    }
    setAmount(rawValue);
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;
    if (type === 'transfer' && (!fromAccountId || !toAccountId)) {
      alert('Por favor selecciona ambas cuentas para la transferencia.');
      return;
    }
    if (type === 'transfer' && fromAccountId === toAccountId) {
      alert('La cuenta de origen y destino no pueden ser la misma.');
      return;
    }
    
    onSave({
      ...initialData,
      amount: parseFloat(amount),
      type,
      accountId: type === 'transfer' ? null : accountId,
      fromAccountId: type === 'transfer' ? fromAccountId : null,
      toAccountId: type === 'transfer' ? toAccountId : null,
      categoryId: type === 'transfer' ? null : categoryId,
      note,
      date,
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
          <h3>
            {(() => {
              const isEdit = !!(initialData && initialData.id);
              const action = isEdit ? 'Editar' : 'Nuevo';
              if (type === 'expense') return `${action} Gasto`;
              if (type === 'income') return `${action} Ingreso`;
              if (type === 'transfer') return `${action} Transferencia`;
              return `${action} Movimiento`;
            })()}
          </h3>
          <button onClick={onClose} style={styles.closeBtn}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          {(!initialData || !initialData.type) && (
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
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Monto ({currency})</label>
            <input
              autoFocus
              type="text"
              inputMode="numeric"
              placeholder="$ 0"
              value={formatAmountDisplay(amount)}
              onChange={handleAmountChange}
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
                  <option value="" disabled>Seleccionar cuenta origen</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.currentBalance?.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} {currency})
                    </option>
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
                  <option value="" disabled>Seleccionar cuenta destino</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.currentBalance?.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} {currency})
                    </option>
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
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.currentBalance?.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} {currency})
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Categoría</label>
                <div style={styles.categoryGrid}>
                  {categories.filter(c => c.type === type).map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(cat.id)}
                      style={styles.categoryChip(categoryId === cat.id, cat.color)}
                    >
                      <span style={{ fontSize: '1.2rem', marginBottom: '4px' }}>
                        {/* We could use real icons here if we imported them, but for now we'll use a dot if tag is missed */}
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: cat.color }} />
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>{cat.name}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => onAddCategory(type)}
                    style={styles.addCategoryChip}
                  >
                    <Plus size={18} color="var(--primary)" />
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--primary)' }}>Agregar</span>
                  </button>
                </div>
              </div>
            </>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Fecha</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={styles.input}
            />
          </div>

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
          
          {initialData && initialData.id && (
            <button 
              type="button" 
              onClick={() => onDelete(initialData.id)}
              style={{ ...styles.saveBtn, backgroundColor: 'transparent', color: 'var(--danger)', marginTop: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}
            >
              <Trash2 size={18} style={{ marginRight: '8px' }} />
              Eliminar Movimiento
            </button>
          )}
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
    backdropFilter: 'blur(8px)',
  },
  modal: {
    width: '100%',
    borderTopLeftRadius: '32px',
    borderTopRightRadius: '32px',
    padding: '32px 24px calc(32px + var(--safe-area-bottom))',
    boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
    maxHeight: '90vh',
    overflowY: 'auto'
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
  categoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
    gap: '10px',
    marginTop: '8px',
  },
  categoryChip: (active, color) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 8px',
    borderRadius: '16px',
    backgroundColor: active ? `${color}25` : 'rgba(255,255,255,0.03)',
    border: `1px solid ${active ? color : 'var(--glass-border)'}`,
    color: active ? 'white' : 'var(--text-muted)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  }),
  addCategoryChip: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 8px',
    borderRadius: '16px',
    backgroundColor: 'rgba(74, 222, 128, 0.05)',
    border: '1px dashed var(--primary)',
    cursor: 'pointer',
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
