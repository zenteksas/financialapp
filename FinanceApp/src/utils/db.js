import { storage } from './storage';

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
  // General Storage access (internal)
  _get: async (key) => await storage.get(key) || [],
  _save: async (key, data) => await storage.set(key, data),

  /**
   * Initialize database and migrate data if necessary.
   */
  init: async () => {
    // Migration from localStorage
    await storage.migrateFromLocalStorage(Object.values(DB_KEYS));
  },

  // Transactions
  getTransactions: async () => await db._get(DB_KEYS.TRANSACTIONS),
  addTransaction: async (transaction) => {
    const list = await db.getTransactions();
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
    await db._save(DB_KEYS.TRANSACTIONS, list);
    return list;
  },

  // Categories
  getCategories: async () => {
    const cats = await db._get(DB_KEYS.CATEGORIES);
    if (!cats || cats.length === 0) {
      await db._save(DB_KEYS.CATEGORIES, INITIAL_CATEGORIES);
      return INITIAL_CATEGORIES;
    }
    return cats;
  },
  addCategory: async (category) => {
    const list = await db.getCategories();
    const newCat = { ...category, id: category.id || Date.now().toString() };
    const idx = list.findIndex(c => c.id === newCat.id);
    if (idx !== -1) list[idx] = newCat;
    else list.push(newCat);
    await db._save(DB_KEYS.CATEGORIES, list);
    return list;
  },
  deleteCategory: async (id) => {
    const list = (await db.getCategories()).filter(c => c.id !== id);
    await db._save(DB_KEYS.CATEGORIES, list);
    return list;
  },

  // Accounts
  getAccounts: async () => {
    const accs = await db._get(DB_KEYS.ACCOUNTS);
    return Array.isArray(accs) ? accs : [];
  },
  addAccount: async (account) => {
    const list = await db.getAccounts();
    const newAcc = { ...account, id: account.id || Date.now().toString() };
    const idx = list.findIndex(a => a.id === newAcc.id);
    if (idx !== -1) list[idx] = newAcc;
    else list.push(newAcc);
    await db._save(DB_KEYS.ACCOUNTS, list);
    return list;
  },
  deleteAccount: async (id) => {
    // Also delete transactions associated with this account
    const txList = (await db.getTransactions()).filter(t => 
      !((t.type === 'transfer' && (t.fromAccountId === id || t.toAccountId === id)) ||
        (t.type !== 'transfer' && (t.accountId || 'default') === id))
    );
    await db._save(DB_KEYS.TRANSACTIONS, txList);

    const list = (await db.getAccounts()).filter(a => a.id !== id);
    await db._save(DB_KEYS.ACCOUNTS, list);
    return list;
  },

  // Payments (Recurring)
  getPayments: async () => await db._get(DB_KEYS.PAYMENTS),
  addPayment: async (payment) => {
    const list = await db.getPayments();
    const newPay = { ...payment, id: payment.id || Date.now().toString() };
    const idx = list.findIndex(p => p.id === newPay.id);
    if (idx !== -1) list[idx] = newPay;
    else list.push(newPay);
    await db._save(DB_KEYS.PAYMENTS, list);
    return list;
  },
  deletePayment: async (id) => {
    const list = (await db.getPayments()).filter(p => p.id !== id);
    await db._save(DB_KEYS.PAYMENTS, list);
    return list;
  },

  // Debts
  getDebts: async () => await db._get(DB_KEYS.DEBTS),
  addDebt: async (debt) => {
    const list = await db.getDebts();
    const newDebt = { ...debt, id: debt.id || Date.now().toString() };
    const idx = list.findIndex(d => d.id === newDebt.id);
    if (idx !== -1) list[idx] = newDebt;
    else list.push(newDebt);
    await db._save(DB_KEYS.DEBTS, list);
    return list;
  },
  deleteDebt: async (id) => {
    const list = (await db.getDebts()).filter(d => d.id !== id);
    await db._save(DB_KEYS.DEBTS, list);
    return list;
  },

  // Reminders
  getReminders: async () => await db._get(DB_KEYS.REMINDERS),
  addReminder: async (reminder) => {
    const list = await db.getReminders();
    const newRem = { ...reminder, id: reminder.id || Date.now().toString(), completed: false };
    const idx = list.findIndex(r => r.id === newRem.id);
    if (idx !== -1) list[idx] = newRem;
    else list.push(newRem);
    await db._save(DB_KEYS.REMINDERS, list);
    return list;
  },
  deleteReminder: async (id) => {
    const list = (await db.getReminders()).filter(r => r.id !== id);
    await db._save(DB_KEYS.REMINDERS, list);
    return list;
  },
  toggleReminderComplete: async (id) => {
    const list = await db.getReminders();
    const idx = list.findIndex(r => r.id === id);
    if (idx !== -1) {
      list[idx].completed = !list[idx].completed;
      await db._save(DB_KEYS.REMINDERS, list);
    }
    return list;
  },

  // Notifications Logic
  getActiveNotifications: async () => {
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
    const payments = await db.getPayments();
    payments.forEach(p => {
      if (parseInt(p.date) === todayDay) {
        notifications.push({
          id: `pay-${p.id}`,
          type: 'payment',
          title: `Pago hoy: ${p.name}`,
          message: `Recuerda realizar el pago de ${p.amount.toLocaleString()} ${db.getCurrencySync()}.`,
          color: p.color || 'var(--primary)',
          data: p
        });
      }
    });

    // 2. Check personal reminders (only if date passed OR today and time passed)
    const reminders = await db.getReminders();
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
  getIncome: async () => {
    const prefs = await db._get(DB_KEYS.USER_PREFS);
    return prefs.income || 0;
  },
  saveIncome: async (income) => {
    const prefs = await db._get(DB_KEYS.USER_PREFS);
    await db._save(DB_KEYS.USER_PREFS, { ...prefs, income });
  },

  // Expected Expenses
  getExpectedExpenses: async () => {
    const prefs = await db._get(DB_KEYS.USER_PREFS);
    return prefs.expectedExpenses || 0;
  },
  saveExpectedExpenses: async (expectedExpenses) => {
    const prefs = await db._get(DB_KEYS.USER_PREFS);
    await db._save(DB_KEYS.USER_PREFS, { ...prefs, expectedExpenses });
  },

  // Scheduled Payments (for Strategy)
  getScheduledPayments: async () => {
    const prefs = await db._get(DB_KEYS.USER_PREFS);
    return prefs.scheduledPayments || {};
  },
  saveScheduledPayments: async (sp) => {
    const prefs = await db._get(DB_KEYS.USER_PREFS);
    await db._save(DB_KEYS.USER_PREFS, { ...prefs, scheduledPayments: sp });
  },

  // Currency
  getCurrency: async () => {
    return (await storage.get(DB_KEYS.CURRENCY)) || 'COP';
  },
  getCurrencySync: () => {
    // Legacy fallback for some UI parts if needed, but we should aim to avoid it
    return 'COP'; 
  },
  saveCurrency: async (currency) => {
    await storage.set(DB_KEYS.CURRENCY, currency);
  },

  // Profile
  getProfile: async () => {
    const defaultProfile = {
      name: '',
      avatar: '', // Icon name or empty for initials
      onboardingComplete: false
    };
    return (await storage.get(DB_KEYS.PROFILE)) || defaultProfile;
  },
  saveProfile: async (profile) => {
    await storage.set(DB_KEYS.PROFILE, profile);
  },

  // Calculate totals
  getTotals: async () => {
    const txs = await db.getTransactions();
    const debts = await db.getDebts();
    const accounts = await db.getAccounts();
    const income = await db.getIncome();
    const currency = await db.getCurrency();
    
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
  getTransactionsByPeriod: async (period = 'month') => {
    const txs = await db.getTransactions();
    const now = new Date();
    
    return txs.filter(tx => {
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
  reset: async () => {
    await storage.clear();
  },

  // Backup & Restore
  exportFullData: async () => {
    const data = {};
    for (const key of Object.values(DB_KEYS)) {
      data[key] = await storage.get(key);
    }
    // Add active tab
    data['finance_active_tab'] = localStorage.getItem('finance_active_tab') || 'dashboard';
    return data;
  },

  importFullData: async (data) => {
    if (!data || typeof data !== 'object') return false;
    
    const keys = Object.values(DB_KEYS);
    for (const key of keys) {
      if (data[key]) {
        await storage.set(key, data[key]);
      }
    }

    if (data['finance_active_tab']) {
      localStorage.setItem('finance_active_tab', data['finance_active_tab']);
    }
    
    return true;
  }
};
