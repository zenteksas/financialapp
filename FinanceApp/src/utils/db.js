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


export const db ={
  // General Storage access
  get: (key) => JSON.parse(localStorage.getItem(key)) || [],
  save: (key, data) => localStorage.setItem(key, JSON.stringify(data)),

  // Transactions
  getTransactions: () => db.get(DB_KEYS.TRANSACTIONS),
  addTransaction: (transaction) => {
    const list = db.getTransactions();
    if (transaction.id) {
      // Edit existing transaction
      const idx = list.findIndex(t => t.id === transaction.id);
      if (idx !== -1) {
        list[idx] = { ...transaction };
      } else {
        list.unshift({ ...transaction });
      }
    } else {
      // Create new transaction
      list.unshift({ ...transaction, id: Date.now().toString() });
    }
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

  // Reminders
  getReminders: () => db.get(DB_KEYS.REMINDERS),
  addReminder: (reminder) => {
    const list = db.getReminders();
    const newRem = { ...reminder, id: reminder.id || Date.now().toString(), completed: false };
    const idx = list.findIndex(r => r.id === newRem.id);
    if (idx !== -1) list[idx] = newRem;
    else list.push(newRem);
    db.save(DB_KEYS.REMINDERS, list);
    return list;
  },
  deleteReminder: (id) => {
    const list = db.getReminders().filter(r => r.id !== id);
    db.save(DB_KEYS.REMINDERS, list);
    return list;
  },
  toggleReminderComplete: (id) => {
    const list = db.getReminders();
    const idx = list.findIndex(r => r.id === id);
    if (idx !== -1) {
      list[idx].completed = !list[idx].completed;
      db.save(DB_KEYS.REMINDERS, list);
    }
    return list;
  },

  // Notifications Logic
  getActiveNotifications: () => {
    const now = new Date();
    const todayDay = now.getDate();
    
    // Get local date YYYY-MM-DD
    const y = now.getFullYear();
    const m = (now.getMonth() + 1).toString().padStart(2, '0');
    const d = now.getDate().toString().padStart(2, '0');
    const todayLocalStr = `${y}-${m}-${d}`;
    
    // Get local time HH:mm
    const currentLocalTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    
    const notifications = [];

    // 1. Check habitual payments for TODAY
    const payments = db.getPayments();
    payments.forEach(p => {
      if (parseInt(p.date) === todayDay) {
        notifications.push({
          id: `pay-${p.id}`,
          type: 'payment',
          title: `Pago hoy: ${p.name}`,
          message: `Recuerda realizar el pago de ${p.amount.toLocaleString()} ${db.getCurrency()}.`,
          color: p.color || 'var(--primary)',
          data: p
        });
      }
    });

    // 2. Check personal reminders (only if date passed OR today and time passed)
    const reminders = db.getReminders();
    reminders.forEach(r => {
      const isPastDate = r.date < todayLocalStr;
      const isToday = r.date === todayLocalStr;
      const isPastTime = r.time ? r.time <= currentLocalTime : true;

      if (!r.completed && (isPastDate || (isToday && isPastTime))) {
        notifications.push({
          id: `rem-${r.id}`,
          type: 'reminder',
          title: r.title,
          message: `Programado para: ${r.date} ${r.time || ''}`,
          color: r.color || 'var(--secondary)',
          data: r
        });
      }
    });

    return notifications;
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
    const txs = Array.isArray(db.getTransactions()) ? db.getTransactions() : [];
    const debts = Array.isArray(db.getDebts()) ? db.getDebts() : [];
    const accounts = Array.isArray(db.getAccounts()) ? db.getAccounts() : [];
    const income = db.getIncome() || 0;
    
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

    const totalDebt = debts.reduce((sum, d) => sum + (parseFloat(d.monto) || 0), 0);
    const totalDebtQuota = debts.reduce((sum, d) => sum + (parseFloat(d.cuotaMinima) || 0), 0);
    
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
  },

  // Factory Reset
  reset: () => {
    Object.values(DB_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },

  // Backup & Restore
  exportFullData: () => {
    const data = {};
    Object.keys(DB_KEYS).forEach(key => {
      data[DB_KEYS[key]] = db.get(DB_KEYS[key]);
    });
    // Add active tab if exists
    data['finance_active_tab'] = localStorage.getItem('finance_active_tab') || 'dashboard';
    return data;
  },

  importFullData: (data) => {
    if (!data || typeof data !== 'object') return false;
    
    // Validate that it looks like our data (optional but good)
    const keys = Object.values(DB_KEYS);
    keys.forEach(key => {
      if (data[key]) {
        db.save(key, data[key]);
      }
    });

    if (data['finance_active_tab']) {
      localStorage.setItem('finance_active_tab', data['finance_active_tab']);
    }
    
    return true;
  }
};
