import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Account,
  ExpenseCategory,
  Expense,
  Income,
  Invoice,
  Contact,
  JournalEntry,
  BusinessSettings,
  ReportPeriod,
  InvoicePayment,
  DisplayCurrencyMode,
  InvoiceReminderAlert,
  ReminderUrgency,
  CashFund,
  FundTransfer,
  FundVoucher,
} from '../types/accounting';
import { formatDualCurrency } from '../utils/formatters';
import {
  INITIAL_SETTINGS,
  INITIAL_ACCOUNTS,
  INITIAL_EXPENSE_CATEGORIES,
  INITIAL_EXPENSES,
  INITIAL_INCOME,
  INITIAL_CONTACTS,
  INITIAL_INVOICES,
  INITIAL_JOURNAL_ENTRIES,
  INITIAL_CASH_FUNDS,
  INITIAL_FUND_TRANSFERS,
  INITIAL_FUND_VOUCHERS,
} from '../data/initialData';

interface CategoryBudgetReport {
  category: ExpenseCategory;
  spent: number;
  budget: number;
  percentage: number;
  remaining: number;
  isOverBudget: boolean;
}

interface PeriodBreakdownItem {
  key: string;
  label: string;
  income: number;
  expense: number;
  net: number;
}

interface FinancialReportResult {
  period: ReportPeriod;
  startDate: string;
  endDate: string;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number; // percentage
  items: PeriodBreakdownItem[];
  categoryBreakdown: {
    categoryName: string;
    categoryId: string;
    color: string;
    amount: number;
    percentage: number;
  }[];
}

export interface BackupSnapshot {
  id: string;
  label: string;
  timestamp: string;
  recordsCount: number;
  data: string;
}

interface AccountingContextType {
  settings: BusinessSettings;
  updateSettings: (newSettings: Partial<BusinessSettings>) => void;

  accounts: Account[];
  addAccount: (account: Omit<Account, 'id' | 'balance'>) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;

  expenseCategories: ExpenseCategory[];
  updateCategoryBudget: (categoryId: string, newBudget: number) => void;
  addCategory: (name: string, icon: string, color: string, monthlyBudget: number) => void;

  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  deleteExpense: (id: string) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;

  incomes: Income[];
  addIncome: (income: Omit<Income, 'id' | 'createdAt'>) => void;
  deleteIncome: (id: string) => void;

  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt' | 'payments' | 'paidAmount' | 'status'>) => void;
  recordInvoicePayment: (payment: Omit<InvoicePayment, 'id'>) => void;

  contacts: Contact[];
  addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'currentBalance'>) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;

  journalEntries: JournalEntry[];
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'status'>) => void;
  deleteJournalEntry: (id: string) => void;

  // Calculators & Reports
  getCategoryBudgetReports: (monthStr?: string) => CategoryBudgetReport[];
  generateFinancialReport: (
    period: ReportPeriod, 
    customStart?: string, 
    customEnd?: string
  ) => FinancialReportResult;

  // Multi-Currency & Automatic Exchange (SAR / ETB)
  displayCurrencyMode: DisplayCurrencyMode;
  setDisplayCurrencyMode: (mode: DisplayCurrencyMode) => void;
  exchangeRateSarToEtb: number;
  setExchangeRateSarToEtb: (rate: number) => void;
  formatAmount: (amountInSAR: number, forceMode?: DisplayCurrencyMode) => string;
  convertSarToEtb: (sarAmount: number, customRate?: number) => number;
  convertEtbToSar: (etbAmount: number, customRate?: number) => number;

  // Invoices Due Dates & Alerts System (العملاء والموردون)
  invoiceAlerts: InvoiceReminderAlert[];
  overdueCount: number;
  dueTodayCount: number;
  dueSoonCount: number;
  totalAlertsCount: number;
  totalOverdueReceivablesSar: number;
  totalOverduePayablesSar: number;
  sendInvoiceReminder: (invoiceId: string, channel?: 'whatsapp' | 'sms' | 'email' | 'manual', note?: string) => void;
  snoozeInvoiceDueDate: (invoiceId: string, daysToAdd: number, reason?: string) => void;
  generateReminderMessage: (invoice: Invoice) => string;

  // Financial Cash Funds & Treasuries (الصناديق المالية والخزائن النقدية)
  cashFunds: CashFund[];
  addCashFund: (fund: Omit<CashFund, 'id' | 'createdAt' | 'accountId' | 'balance'> & { initialBalance?: number }) => void;
  updateCashFund: (id: string, updates: Partial<CashFund>) => void;
  deleteCashFund: (id: string) => void;
  fundTransfers: FundTransfer[];
  transferBetweenFunds: (transfer: Omit<FundTransfer, 'id' | 'transferNumber' | 'createdAt'>) => void;
  fundVouchers: FundVoucher[];
  createFundVoucher: (voucher: Omit<FundVoucher, 'id' | 'voucherNumber' | 'createdAt'>) => void;
  totalCashInFundsSar: number;

  // Backup & Recovery
  lastBackupDate: string | null;
  snapshots: BackupSnapshot[];
  createSnapshot: (label?: string) => void;
  restoreSnapshot: (id: string) => boolean;
  deleteSnapshot: (id: string) => void;
  resetToDefaultData: () => void;
  exportBackupJSON: () => void;
  importBackupJSON: (jsonString: string) => { success: boolean; error?: string; stats?: any };
  getBackupSummary: () => {
    totalRecords: number;
    accountsCount: number;
    expensesCount: number;
    incomesCount: number;
    invoicesCount: number;
    journalEntriesCount: number;
    contactsCount: number;
    totalAssets: number;
  };
}

const AccountingContext = createContext<AccountingContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SETTINGS: 'acc_app_settings_v2',
  ACCOUNTS: 'acc_app_accounts_v2',
  CATEGORIES: 'acc_app_categories_v2',
  EXPENSES: 'acc_app_expenses_v2',
  INCOMES: 'acc_app_incomes_v2',
  INVOICES: 'acc_app_invoices_v2',
  CONTACTS: 'acc_app_contacts_v2',
  JOURNAL: 'acc_app_journal_v2',
  FUNDS: 'acc_app_funds_v2',
  TRANSFERS: 'acc_app_transfers_v2',
  VOUCHERS: 'acc_app_vouchers_v2',
  LAST_BACKUP: 'acc_app_last_backup_v2',
  SNAPSHOTS: 'acc_app_snapshots_v2',
};

export const AccountingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<BusinessSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  const [cashFunds, setCashFunds] = useState<CashFund[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FUNDS);
    return saved ? JSON.parse(saved) : INITIAL_CASH_FUNDS;
  });

  const [fundTransfers, setFundTransfers] = useState<FundTransfer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSFERS);
    return saved ? JSON.parse(saved) : INITIAL_FUND_TRANSFERS;
  });

  const [fundVouchers, setFundVouchers] = useState<FundVoucher[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VOUCHERS);
    return saved ? JSON.parse(saved) : INITIAL_FUND_VOUCHERS;
  });

  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return saved ? JSON.parse(saved) : INITIAL_EXPENSE_CATEGORIES;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [incomes, setIncomes] = useState<Income[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INCOMES);
    return saved ? JSON.parse(saved) : INITIAL_INCOME;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVOICES);
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONTACTS);
    return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
  });

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.JOURNAL);
    return saved ? JSON.parse(saved) : INITIAL_JOURNAL_ENTRIES;
  });

  const [lastBackupDate, setLastBackupDate] = useState<string | null>(() => {
    return localStorage.getItem('acc_app_last_backup_date');
  });

  const [snapshots, setSnapshots] = useState<BackupSnapshot[]>(() => {
    const saved = localStorage.getItem('acc_app_snapshots_v2');
    return saved ? JSON.parse(saved) : [];
  });

  // Multi-Currency SAR / ETB state
  const [displayCurrencyMode, setDisplayCurrencyMode] = useState<DisplayCurrencyMode>(() => {
    return (
      (localStorage.getItem('acc_display_currency') as DisplayCurrencyMode) ||
      settings.displayCurrencyMode ||
      'SAR'
    );
  });

  const [exchangeRateSarToEtb, setExchangeRateSarToEtbState] = useState<number>(() => {
    const saved = localStorage.getItem('acc_rate_sar_etb');
    return saved ? parseFloat(saved) : settings.exchangeRateSarToEtb || 34.50;
  });

  const setExchangeRateSarToEtb = (newRate: number) => {
    const rate = Math.max(0.01, newRate);
    setExchangeRateSarToEtbState(rate);
    localStorage.setItem('acc_rate_sar_etb', String(rate));
    setSettings((prev) => ({ ...prev, exchangeRateSarToEtb: rate }));
  };

  const handleSetDisplayCurrencyMode = (mode: DisplayCurrencyMode) => {
    setDisplayCurrencyMode(mode);
    localStorage.setItem('acc_display_currency', mode);
  };

  const convertSarToEtb = (sarAmount: number, customRate?: number) => {
    const rate = customRate || exchangeRateSarToEtb;
    return sarAmount * rate;
  };

  const convertEtbToSar = (etbAmount: number, customRate?: number) => {
    const rate = customRate || exchangeRateSarToEtb;
    return rate > 0 ? etbAmount / rate : 0;
  };

  const formatAmount = (amountInSAR: number, forceMode?: DisplayCurrencyMode) => {
    const mode = forceMode || displayCurrencyMode;
    return formatDualCurrency(amountInSAR, exchangeRateSarToEtb, mode);
  };

  useEffect(() => {
    localStorage.setItem('acc_app_snapshots_v2', JSON.stringify(snapshots));
  }, [snapshots]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(expenseCategories));
  }, [expenseCategories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(incomes));
  }, [incomes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(journalEntries));
  }, [journalEntries]);

  // Actions
  const updateSettings = (newSettings: Partial<BusinessSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const addAccount = (accountData: Omit<Account, 'id' | 'balance'>) => {
    const newAccount: Account = {
      ...accountData,
      id: `acc_${Date.now()}`,
      balance: 0,
    };
    setAccounts((prev) => [...prev, newAccount]);
  };

  const updateAccount = (id: string, updates: Partial<Account>) => {
    setAccounts((prev) => prev.map((acc) => (acc.id === id ? { ...acc, ...updates } : acc)));
  };

  const updateCategoryBudget = (categoryId: string, newBudget: number) => {
    setExpenseCategories((prev) =>
      prev.map((cat) => (cat.id === categoryId ? { ...cat, monthlyBudget: Math.max(0, newBudget) } : cat))
    );
  };

  const addCategory = (name: string, icon: string, color: string, monthlyBudget: number) => {
    const newCat: ExpenseCategory = {
      id: `cat_${Date.now()}`,
      name,
      icon,
      color,
      monthlyBudget: Math.max(0, monthlyBudget),
    };
    setExpenseCategories((prev) => [...prev, newCat]);
  };

  const addExpense = (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    const id = `exp_${Date.now()}`;
    const newExpense: Expense = {
      ...expenseData,
      id,
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [newExpense, ...prev]);

    // Also deduct from selected payment account balance
    if (expenseData.paidFromAccountId) {
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id === expenseData.paidFromAccountId) {
            return { ...acc, balance: acc.balance - expenseData.amount };
          }
          return acc;
        })
      );
    }
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses((prev) => prev.map((exp) => (exp.id === id ? { ...exp, ...updates } : exp)));
  };

  const deleteExpense = (id: string) => {
    const target = expenses.find((e) => e.id === id);
    if (target && target.paidFromAccountId) {
      // Revert account balance
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id === target.paidFromAccountId) {
            return { ...acc, balance: acc.balance + target.amount };
          }
          return acc;
        })
      );
    }
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const addIncome = (incomeData: Omit<Income, 'id' | 'createdAt'>) => {
    const id = `inc_${Date.now()}`;
    const newIncome: Income = {
      ...incomeData,
      id,
      createdAt: new Date().toISOString(),
    };
    setIncomes((prev) => [newIncome, ...prev]);

    // Add to deposit account balance
    if (incomeData.depositAccountId) {
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id === incomeData.depositAccountId) {
            return { ...acc, balance: acc.balance + incomeData.amount };
          }
          return acc;
        })
      );
    }
  };

  const deleteIncome = (id: string) => {
    const target = incomes.find((i) => i.id === id);
    if (target && target.depositAccountId) {
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id === target.depositAccountId) {
            return { ...acc, balance: acc.balance - target.amount };
          }
          return acc;
        })
      );
    }
    setIncomes((prev) => prev.filter((i) => i.id !== id));
  };

  const addInvoice = (invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'payments' | 'paidAmount' | 'status'>) => {
    const id = `inv_${Date.now()}`;
    const newInvoice: Invoice = {
      ...invoiceData,
      id,
      paidAmount: 0,
      status: 'unpaid',
      payments: [],
      createdAt: new Date().toISOString(),
    };
    setInvoices((prev) => [newInvoice, ...prev]);

    // Update customer or vendor balance
    if (invoiceData.partyId) {
      setContacts((prev) =>
        prev.map((c) => {
          if (c.id === invoiceData.partyId) {
            const delta = invoiceData.type === 'sale' ? invoiceData.grandTotal : -invoiceData.grandTotal;
            return { ...c, currentBalance: c.currentBalance + delta };
          }
          return c;
        })
      );
    }
  };

  const recordInvoicePayment = (paymentData: Omit<InvoicePayment, 'id'>) => {
    const payId = `pay_${Date.now()}`;
    const payment: InvoicePayment = {
      ...paymentData,
      id: payId,
    };

    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === paymentData.invoiceId) {
          const newPaid = inv.paidAmount + paymentData.amount;
          const status = newPaid >= inv.grandTotal ? 'paid' : newPaid > 0 ? 'partial' : 'unpaid';
          return {
            ...inv,
            paidAmount: newPaid,
            status,
            payments: [...inv.payments, payment],
          };
        }
        return inv;
      })
    );

    // Update account balance
    const targetInv = invoices.find((inv) => inv.id === paymentData.invoiceId);
    if (targetInv && paymentData.paymentAccountId) {
      const isSale = targetInv.type === 'sale';
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id === paymentData.paymentAccountId) {
            return {
              ...acc,
              balance: isSale ? acc.balance + paymentData.amount : acc.balance - paymentData.amount,
            };
          }
          return acc;
        })
      );

      // Also adjust party balance
      if (targetInv.partyId) {
        setContacts((prev) =>
          prev.map((c) => {
            if (c.id === targetInv.partyId) {
              const delta = isSale ? -paymentData.amount : paymentData.amount;
              return { ...c, currentBalance: c.currentBalance + delta };
            }
            return c;
          })
        );
      }
    }
  };

  const addContact = (contactData: Omit<Contact, 'id' | 'createdAt' | 'currentBalance'>) => {
    const newContact: Contact = {
      ...contactData,
      id: `cnt_${Date.now()}`,
      currentBalance: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setContacts((prev) => [...prev, newContact]);
  };

  const updateContact = (id: string, updates: Partial<Contact>) => {
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const addJournalEntry = (entryData: Omit<JournalEntry, 'id' | 'createdAt' | 'status'>) => {
    const newEntry: JournalEntry = {
      ...entryData,
      id: `je_${Date.now()}`,
      status: 'posted',
      createdAt: new Date().toISOString(),
    };
    setJournalEntries((prev) => [newEntry, ...prev]);

    // Update account balances from entry lines
    setAccounts((prevAccounts) => {
      const updated = [...prevAccounts];
      entryData.lines.forEach((line) => {
        const accIndex = updated.findIndex((a) => a.id === line.accountId);
        if (accIndex !== -1) {
          const acc = updated[accIndex];
          // For assets and expenses: Debit increases, Credit decreases
          // For liabilities, equity, and revenue: Credit increases, Debit decreases
          const isNormalDebit = acc.type === 'asset' || acc.type === 'expense';
          const delta = isNormalDebit ? line.debit - line.credit : line.credit - line.debit;
          updated[accIndex] = {
            ...acc,
            balance: acc.balance + delta,
          };
        }
      });
      return updated;
    });
  };

  const deleteJournalEntry = (id: string) => {
    setJournalEntries((prev) => prev.filter((j) => j.id !== id));
  };

  // Category Budgets Calculator
  const getCategoryBudgetReports = (monthStr?: string): CategoryBudgetReport[] => {
    const targetMonth = monthStr || new Date().toISOString().slice(0, 7); // YYYY-MM
    return expenseCategories.map((cat) => {
      const spent = expenses
        .filter((e) => e.categoryId === cat.id && e.date.startsWith(targetMonth))
        .reduce((sum, e) => sum + e.amount, 0);

      const budget = cat.monthlyBudget;
      const percentage = budget > 0 ? Math.round((spent / budget) * 100) : 0;
      const remaining = budget - spent;

      return {
        category: cat,
        spent,
        budget,
        percentage,
        remaining,
        isOverBudget: spent > budget,
      };
    });
  };

  // Financial Reports Engine (Daily, Weekly, Monthly)
  const generateFinancialReport = (
    period: ReportPeriod,
    customStart?: string,
    customEnd?: string
  ): FinancialReportResult => {
    const now = new Date();
    let startDate = '';
    let endDate = '';
    const items: PeriodBreakdownItem[] = [];

    if (period === 'daily') {
      // Last 7 days breakdown daily
      const daysCount = 7;
      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateKey = d.toISOString().split('T')[0];

        const dayName = new Intl.DateTimeFormat('ar-SA', { weekday: 'short' }).format(d);
        const dayLabel = `${dayName} (${d.getDate()}/${d.getMonth() + 1})`;

        const dayIncome = incomes
          .filter((inc) => inc.date === dateKey)
          .reduce((sum, item) => sum + item.amount, 0);

        const dayExpense = expenses
          .filter((exp) => exp.date === dateKey)
          .reduce((sum, item) => sum + item.amount, 0);

        items.push({
          key: dateKey,
          label: dayLabel,
          income: dayIncome,
          expense: dayExpense,
          net: dayIncome - dayExpense,
        });
      }
      startDate = items[0]?.key || '';
      endDate = items[items.length - 1]?.key || '';
    } else if (period === 'weekly') {
      // Last 4 weeks breakdown
      const weeksCount = 4;
      for (let w = weeksCount - 1; w >= 0; w--) {
        const weekEnd = new Date(now);
        weekEnd.setDate(weekEnd.getDate() - w * 7);
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekStart.getDate() - 6);

        const startStr = weekStart.toISOString().split('T')[0];
        const endStr = weekEnd.toISOString().split('T')[0];
        const label = `الأسبوع ${weeksCount - w} (${weekStart.getDate()}/${weekStart.getMonth() + 1} - ${weekEnd.getDate()}/${weekEnd.getMonth() + 1})`;

        const weekIncome = incomes
          .filter((inc) => inc.date >= startStr && inc.date <= endStr)
          .reduce((sum, item) => sum + item.amount, 0);

        const weekExpense = expenses
          .filter((exp) => exp.date >= startStr && exp.date <= endStr)
          .reduce((sum, item) => sum + item.amount, 0);

        items.push({
          key: `week_${w}`,
          label,
          income: weekIncome,
          expense: weekExpense,
          net: weekIncome - weekExpense,
        });
      }
      const firstWStart = new Date(now);
      firstWStart.setDate(firstWStart.getDate() - 27);
      startDate = firstWStart.toISOString().split('T')[0];
      endDate = now.toISOString().split('T')[0];
    } else if (period === 'monthly') {
      // Last 6 months breakdown
      const monthsCount = 6;
      for (let m = monthsCount - 1; m >= 0; m--) {
        const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
        const monthKey = d.toISOString().slice(0, 7); // YYYY-MM
        const monthLabel = new Intl.DateTimeFormat('ar-SA', { month: 'long', year: 'numeric' }).format(d);

        const monthIncome = incomes
          .filter((inc) => inc.date.startsWith(monthKey))
          .reduce((sum, item) => sum + item.amount, 0);

        const monthExpense = expenses
          .filter((exp) => exp.date.startsWith(monthKey))
          .reduce((sum, item) => sum + item.amount, 0);

        items.push({
          key: monthKey,
          label: monthLabel,
          income: monthIncome,
          expense: monthExpense,
          net: monthIncome - monthExpense,
        });
      }
      startDate = items[0]?.key || '';
      endDate = items[items.length - 1]?.key || '';
    } else {
      // Custom or yearly
      startDate = customStart || new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
      endDate = customEnd || now.toISOString().split('T')[0];

      const rangeIncome = incomes
        .filter((inc) => inc.date >= startDate && inc.date <= endDate)
        .reduce((sum, item) => sum + item.amount, 0);

      const rangeExpense = expenses
        .filter((exp) => exp.date >= startDate && exp.date <= endDate)
        .reduce((sum, item) => sum + item.amount, 0);

      items.push({
        key: 'custom_total',
        label: 'الفترة المحددة',
        income: rangeIncome,
        expense: rangeExpense,
        net: rangeIncome - rangeExpense,
      });
    }

    const totalIncome = items.reduce((sum, it) => sum + it.income, 0);
    const totalExpenses = items.reduce((sum, it) => sum + it.expense, 0);
    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

    // Filter expenses in this period range for category breakdown
    const filteredExpenses = expenses.filter((e) => {
      if (startDate && endDate) {
        return e.date >= startDate && e.date <= endDate;
      }
      return true;
    });

    const categoryMap: { [catId: string]: number } = {};
    filteredExpenses.forEach((exp) => {
      categoryMap[exp.categoryId] = (categoryMap[exp.categoryId] || 0) + exp.amount;
    });

    const categoryBreakdown = expenseCategories
      .map((cat) => {
        const amount = categoryMap[cat.id] || 0;
        const percentage = totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0;
        return {
          categoryId: cat.id,
          categoryName: cat.name,
          color: cat.color,
          amount,
          percentage,
        };
      })
      .filter((c) => c.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    return {
      period,
      startDate,
      endDate,
      totalIncome,
      totalExpenses,
      netSavings,
      savingsRate,
      items,
      categoryBreakdown,
    };
  };

  const resetToDefaultData = () => {
    setSettings(INITIAL_SETTINGS);
    setAccounts(INITIAL_ACCOUNTS);
    setExpenseCategories(INITIAL_EXPENSE_CATEGORIES);
    setExpenses(INITIAL_EXPENSES);
    setIncomes(INITIAL_INCOME);
    setInvoices(INITIAL_INVOICES);
    setContacts(INITIAL_CONTACTS);
    setJournalEntries(INITIAL_JOURNAL_ENTRIES);
  };

  const getBackupSummary = () => {
    const totalRecords =
      accounts.length +
      expenses.length +
      incomes.length +
      invoices.length +
      contacts.length +
      journalEntries.length;

    const totalAssets = accounts
      .filter((a) => a.type === 'asset')
      .reduce((sum, a) => sum + a.balance, 0);

    return {
      totalRecords,
      accountsCount: accounts.length,
      expensesCount: expenses.length,
      incomesCount: incomes.length,
      invoicesCount: invoices.length,
      journalEntriesCount: journalEntries.length,
      contactsCount: contacts.length,
      totalAssets,
    };
  };

  const createSnapshot = (label?: string) => {
    const summary = getBackupSummary();
    const dataObj = {
      settings,
      accounts,
      expenseCategories,
      expenses,
      incomes,
      invoices,
      contacts,
      journalEntries,
      savedAt: new Date().toISOString(),
    };

    const newSnapshot: BackupSnapshot = {
      id: `snap_${Date.now()}`,
      label: label || `نقطة استعادة تلقائية (${new Date().toLocaleDateString('ar-SA')})`,
      timestamp: new Date().toISOString(),
      recordsCount: summary.totalRecords,
      data: JSON.stringify(dataObj),
    };

    setSnapshots((prev) => [newSnapshot, ...prev.slice(0, 9)]); // Keep latest 10
  };

  const restoreSnapshot = (id: string): boolean => {
    const snap = snapshots.find((s) => s.id === id);
    if (!snap) return false;
    const res = importBackupJSON(snap.data);
    return res.success;
  };

  const deleteSnapshot = (id: string) => {
    setSnapshots((prev) => prev.filter((s) => s.id !== id));
  };

  const exportBackupJSON = () => {
    const summary = getBackupSummary();
    const nowIso = new Date().toISOString();
    const dateFormatted = nowIso.split('T')[0];

    const backupPayload = {
      meta: {
        application: 'جهاد أحمد للمحاسبة والاستشارات المالية',
        backupVersion: '2.5',
        exportedAt: nowIso,
        companyName: settings.companyName,
        taxNumber: settings.taxNumber,
        currency: settings.currency,
        stats: summary,
      },
      database: {
        settings,
        accounts,
        expenseCategories,
        expenses,
        incomes,
        invoices,
        contacts,
        journalEntries,
      },
    };

    const jsonStr = JSON.stringify(backupPayload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jihad_accounting_backup_${dateFormatted}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setLastBackupDate(nowIso);
    localStorage.setItem('acc_app_last_backup_date', nowIso);
  };

  const importBackupJSON = (jsonString: string): { success: boolean; error?: string; stats?: any } => {
    try {
      const parsed = JSON.parse(jsonString);
      // Support both structured v2.5 and legacy format
      const db = parsed.database || parsed;

      if (!db.settings || !db.accounts || !db.expenses) {
        return {
          success: false,
          error: 'الملف غير متطابق مع بنية قاعدة بيانات جهاد أحمد للمحاسبة',
        };
      }

      setSettings(db.settings);
      setAccounts(db.accounts);
      setExpenseCategories(db.expenseCategories || INITIAL_EXPENSE_CATEGORIES);
      setExpenses(db.expenses || []);
      setIncomes(db.incomes || []);
      setInvoices(db.invoices || []);
      setContacts(db.contacts || []);
      setJournalEntries(db.journalEntries || []);

      const importedStats = {
        accounts: db.accounts?.length || 0,
        expenses: db.expenses?.length || 0,
        incomes: db.incomes?.length || 0,
        invoices: db.invoices?.length || 0,
        journalEntries: db.journalEntries?.length || 0,
      };

      return { success: true, stats: importedStats };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطأ في معالجة ملف JSON' };
    }
  };

  return (
    <AccountingContext.Provider
      value={{
        settings,
        updateSettings,
        accounts,
        addAccount,
        updateAccount,
        expenseCategories,
        updateCategoryBudget,
        addCategory,
        expenses,
        addExpense,
        deleteExpense,
        updateExpense,
        incomes,
        addIncome,
        deleteIncome,
        invoices,
        addInvoice,
        recordInvoicePayment,
        contacts,
        addContact,
        updateContact,
        journalEntries,
        addJournalEntry,
        deleteJournalEntry,
        getCategoryBudgetReports,
        generateFinancialReport,
        lastBackupDate,
        snapshots,
        createSnapshot,
        restoreSnapshot,
        deleteSnapshot,
        resetToDefaultData,
        exportBackupJSON,
        importBackupJSON,
        getBackupSummary,
        displayCurrencyMode,
        setDisplayCurrencyMode: handleSetDisplayCurrencyMode,
        exchangeRateSarToEtb,
        setExchangeRateSarToEtb,
        formatAmount,
        convertSarToEtb,
        convertEtbToSar,
      }}
    >
      {children}
    </AccountingContext.Provider>
  );
};

export const useAccounting = () => {
  const context = useContext(AccountingContext);
  if (!context) {
    throw new Error('useAccounting must be used within an AccountingProvider');
  }
  return context;
};
