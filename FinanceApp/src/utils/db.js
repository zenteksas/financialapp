const DB_KEYS = {
  TRANSACTIONS: 'finance_transactions',
  DEBTS: 'finance_debts',
  CATEGORIES: 'finance_categories',
  USER_PREFS: 'finance_prefs',
  ACCOUNTS: 'finance_accounts',
  PAYMENTS: 'finance_payments',
  REMINDERS: 'finance_reminders',
  CURRENCY: 'finance_currency',
  PROFILE: 'finance_profile'
};

const INITIAL_CATEGORIES = [
  { id: '1', name: 'Comida', icon: 'Utensils', color: '#f59e0b', type: 'expense' },
  { id: '2', name: 'Transporte', icon: 'Car', color: '#3b82f6', type: 'expense' },
  { id: '3', name: 'Vivienda', icon: 'Home', color: '#ef4444', type: 'expense' },
  { id: '4', name: 'Otros', icon: 'Circle', color: '#94a3b8', type: 'expense' },
  { id: '5', name: 'Salario', icon: 'Wallet', color: '#10b981', type: 'income' }
];

const INITIAL_ACCOUNTS = [
  { id: 'default', name: 'Efectivo', balance: 0, color: '#10b981', icon: 'Wallet', includeInTotal: true }
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
    if (!cats || cats.length === 0) {
      db.save(DB_KEYS.CATEGORIES, INITIAL_CATEGORIES);
      return INITIAL_CATEGORIES;
    }
    return cats;
  },
  addCategory: (category) => {
    const list = db.getCategories();
    const newCat = { ...category, id: category.id || Date.now().toString() };
    const idx = list.findIndex(c => c.id === newCat.id);
    if (idx !== -1) list[idx] = newCat;
    else list.push(newCat);
    db.save(DB_KEYS.CATEGORIES, list);
    return list;
  },
  deleteCategory: (id) => {
    const list = db.getCategories().filter(c => c.id !== id);
    db.save(DB_KEYS.CATEGORIES, list);
    return list;
  },

  // Accounts
  getAccounts: () => {
    const accs = db.get(DB_KEYS.ACCOUNTS);
    if (accs.length === 0) {
      db.save(DB_KEYS.ACCOUNTS, INITIAL_ACCOUNTS);
      return INITIAL_ACCOUNTS;
    }
    return accs;
  },
  addAccount: (account) => {
    const list = db.getAccounts();
    const newAcc = { ...account, id: account.id || Date.now().toString() };
    const idx = list.findIndex(a => a.id === newAcc.id);
    if (idx !== -1) list[idx] = newAcc;
    else list.push(newAcc);
    db.save(DB_KEYS.ACCOUNTS, list);
    return list;
  },
  deleteAccount: (id) => {
    // Also delete transactions associated with this account
    const txList = db.getTransactions().filter(t => 
      !((t.type === 'transfer' && (t.fromAccountId === id || t.toAccountId === id)) ||
        (t.type !== 'transfer' && (t.accountId || 'default') === id))
    );
    db.save(DB_KEYS.TRANSACTIONS, txList);

    const list = db.getAccounts().filter(a => a.id !== id);
    db.save(DB_KEYS.ACCOUNTS, list);
    return list;
  },

  // Payments (Recurring)
  getPayments: () => db.get(DB_KEYS.PAYMENTS),
  addPayment: (payment) => {
    const list = db.getPayments();
    const newPay = { ...payment, id: payment.id || Date.now().toString() };
    const idx = list.findIndex(p => p.id === newPay.id);
    if (idx !== -1) list[idx] = newPay;
    else list.push(newPay);
    db.save(DB_KEYS.PAYMENTS, list);
    return list;
  },
  deletePayment: (id) => {
    const list = db.getPayments().filter(p => p.id !== id);
    db.save(DB_KEYS.PAYMENTS, list);
    return list;
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

  // Expected Expenses
  getExpectedExpenses: () => {
    const prefs = db.get(DB_KEYS.USER_PREFS);
    return prefs.expectedExpenses || 0;
  },
  saveExpectedExpenses: (expectedExpenses) => {
    const prefs = db.get(DB_KEYS.USER_PREFS);
    db.save(DB_KEYS.USER_PREFS, { ...prefs, expectedExpenses });
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

  // Currency
  getCurrency: () => {
    return localStorage.getItem(DB_KEYS.CURRENCY) || 'COP';
  },
  saveCurrency: (currency) => {
    localStorage.setItem(DB_KEYS.CURRENCY, currency);
  },

  // Profile
  getProfile: () => {
    const defaultProfile = {
      name: '',
      avatar: '', // Icon name or empty for initials
      onboardingComplete: false
    };
    return JSON.parse(localStorage.getItem(DB_KEYS.PROFILE)) || defaultProfile;
  },
  saveProfile: (profile) => {
    localStorage.setItem(DB_KEYS.PROFILE, JSON.stringify(profile));
  },

  // Calculate totals
  getTotals: () => {
    const txs = db.getTransactions();
    const debts = db.getDebts();
    const accounts = db.getAccounts();
    const income = db.getIncome();
    
    // Initial balance from accounts marked for inclusion
    const initialBalance = accounts
      .filter(a => a.includeInTotal)
      .reduce((sum, a) => sum + (parseFloat(a.balance) || 0), 0);

    const financial = txs.reduce((acc, tx) => {
      if (tx.type === 'transfer') {
        const fromAcc = accounts.find(a => a.id === tx.fromAccountId);
        const toAcc = accounts.find(a => a.id === tx.toAccountId);
        
        const fromVisible = fromAcc ? fromAcc.includeInTotal : true;
        const toVisible = toAcc ? toAcc.includeInTotal : true;

        // Balance change only if visibility differs
        if (fromVisible && !toVisible) acc.balance -= tx.amount;
        if (!fromVisible && toVisible) acc.balance += tx.amount;
        // Both visible or both hidden means net change to total balance is 0
        
        return acc;
      }

      // Find the account. If not found or if the account is marked FOR inclusion, we count it.
      const account = accounts.find(a => a.id === (tx.accountId || 'default'));
      const shouldInclude = !account || account.includeInTotal;

      if (tx.type === 'income') {
        if (shouldInclude) acc.balance += tx.amount;
        acc.income += tx.amount;
      } else {
        if (shouldInclude) acc.balance -= tx.amount;
        acc.expenses += tx.amount;
      }
      
      return acc;
    }, { balance: initialBalance, income: 0, expenses: 0 });

    const totalDebt = debts.reduce((sum, d) => sum + d.monto, 0);
    const totalDebtQuota = debts.reduce((sum, d) => sum + d.cuotaMinima, 0);
    
    const accountBalances = accounts.map(acc => {
      const accTxs = txs.filter(t => 
        (t.type === 'transfer' && (t.fromAccountId === acc.id || t.toAccountId === acc.id)) ||
        (t.type !== 'transfer' && (t.accountId || 'default') === acc.id)
      );
      
      const net = accTxs.reduce((sum, t) => {
        if (t.type === 'transfer') {
          if (t.fromAccountId === acc.id) return sum - t.amount;
          if (t.toAccountId === acc.id) return sum + t.amount;
          return sum;
        }
        return t.type === 'income' ? sum + t.amount : sum - t.amount;
      }, 0);
      
      return { ...acc, currentBalance: (parseFloat(acc.balance) || 0) + net };
    });

    return {
      ...financial,
      totalDebt,
      totalDebtQuota,
      debtRatio: income > 0 ? (totalDebtQuota / income) * 100 : 0,
      accountBalances
    };
  },

  // Analytics Helpers
  getTransactionsByPeriod: (period = 'month') => {
    const txs = db.getTransactions();
    const now = new Date();
    
    return txs.filter(tx => {
      // Note: In a real app, we'd parse tx.date or have a timestamp
      // For this demo, we'll assume tx.id (Date.now()) is the timestamp
      const txDate = new Date(parseInt(tx.id));
      
      if (period === 'day') {
        return txDate.toDateString() === now.toDateString();
      }
      if (period === 'week') {
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        return txDate >= weekStart;
      }
      if (period === 'month') {
        return txDate.getMonth() === new Date().getMonth() && txDate.getFullYear() === new Date().getFullYear();
      }
      if (period === 'year') {
        return txDate.getFullYear() === new Date().getFullYear();
      }
      return true; // 'periodo' (all)
    });
  }
};
