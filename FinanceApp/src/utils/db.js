const DB_KEYS = {
  TRANSACTIONS: 'finance_transactions',
  DEBTS: 'finance_debts',
  CATEGORIES: 'finance_categories',
  USER_PREFS: 'finance_prefs'
};

const INITIAL_CATEGORIES = [
  { id: '1', name: 'Comida', icon: 'Utensils', color: '#f59e0b', type: 'expense' },
  { id: '2', name: 'Transporte', icon: 'Car', color: '#3b82f6', type: 'expense' },
  { id: '3', name: 'Vivienda', icon: 'Home', color: '#ef4444', type: 'expense' },
  { id: '4', name: 'Salario', icon: 'Wallet', color: '#10b981', type: 'income' },
  { id: '5', name: 'Otros', icon: 'Circle', color: '#94a3b8', type: 'expense' }
];

export const db ={
  // General Storage access
  get: (key) => JSON.parse(localStorage.getItem(key)) || [],
  save: (key, data) => localStorage.setItem(key, JSON.stringify(data)),

  // Transactions
  getTransactions: () => db.get(DB_KEYS.TRANSACTIONS),
  addTransaction: (transaction) => {
    const list = db.getTransactions();
    list.unshift({ ...transaction, id: Date.now().toString() });
    db.save(DB_KEYS.TRANSACTIONS, list);
    return list;
  },

  // Categories
  getCategories: () => {
    const cats = db.get(DB_KEYS.CATEGORIES);
    if (cats.length === 0) {
      db.save(DB_KEYS.CATEGORIES, INITIAL_CATEGORIES);
      return INITIAL_CATEGORIES;
    }
    return cats;
  },

  // Debts
  getDebts: () => db.get(DB_KEYS.DEBTS),
  addDebt: (debt) => {
    const list = db.getDebts();
    const newDebt = { ...debt, id: debt.id || Date.now().toString() };
    const idx = list.findIndex(d => d.id === newDebt.id);
    if (idx !== -1) list[idx] = newDebt;
    else list.push(newDebt);
    db.save(DB_KEYS.DEBTS, list);
    return list;
  },
  deleteDebt: (id) => {
    const list = db.getDebts().filter(d => d.id !== id);
    db.save(DB_KEYS.DEBTS, list);
    return list;
  },

  // User Prefs / Income
  getIncome: () => {
    const prefs = db.get(DB_KEYS.USER_PREFS);
    return prefs.income || 0;
  },
  saveIncome: (income) => {
    const prefs = db.get(DB_KEYS.USER_PREFS);
    db.save(DB_KEYS.USER_PREFS, { ...prefs, income });
  },

  // Scheduled Payments (for Strategy)
  getScheduledPayments: () => {
    const prefs = db.get(DB_KEYS.USER_PREFS);
    return prefs.scheduledPayments || {};
  },
  saveScheduledPayments: (sp) => {
    const prefs = db.get(DB_KEYS.USER_PREFS);
    db.save(DB_KEYS.USER_PREFS, { ...prefs, scheduledPayments: sp });
  },

  // Calculate totals
  getTotals: () => {
    const txs = db.getTransactions();
    const debts = db.getDebts();
    const income = db.getIncome();
    
    const financial = txs.reduce((acc, tx) => {
      if (tx.type === 'income') acc.balance += tx.amount;
      else acc.balance -= tx.amount;
      
      if (tx.type === 'income') acc.income += tx.amount;
      else acc.expenses += tx.amount;
      
      return acc;
    }, { balance: 0, income: 0, expenses: 0 });

    const totalDebt = debts.reduce((sum, d) => sum + d.monto, 0);
    const totalDebtQuota = debts.reduce((sum, d) => sum + d.cuotaMinima, 0);
    
    return {
      ...financial,
      totalDebt,
      totalDebtQuota,
      debtRatio: income > 0 ? (totalDebtQuota / income) * 100 : 0
    };
  }
};
