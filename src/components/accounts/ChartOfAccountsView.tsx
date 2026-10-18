import React, { useState } from 'react';
import { useAccounting } from '../../context/AccountingContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Account, AccountType, AccountCategory } from '../../types/accounting';
import {
  ListTree,
  Plus,
  Search,
  Filter,
  Eye,
  X,
  BookOpen,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';

export const ChartOfAccountsView: React.FC = () => {
  const { accounts, addAccount, journalEntries, settings } = useAccounting();

  const [activeType, setActiveType] = useState<AccountType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingLedgerAcc, setViewingLedgerAcc] = useState<Account | null>(null);

  // New Account Form
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('asset');
  const [category, setCategory] = useState<AccountCategory>('current_asset');
  const [description, setDescription] = useState('');

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      alert('يرجى تعبئة رمز واسم الحساب');
      return;
    }

    const categoryNames: Record<AccountCategory, string> = {
      current_asset: 'أصول متداولة',
      fixed_asset: 'أصول ثابتة',
      current_liability: 'التزامات متداولة',
      long_term_liability: 'التزامات طويلة الأجل',
      equity: 'حقوق الملكية',
      operating_revenue: 'إيرادات تشغيلية',
      other_revenue: 'إيرادات أخرى',
      operating_expense: 'مصروفات تشغيلية',
      cost_of_sales: 'تكلفة المبيعات',
    };

    addAccount({
      code: code.trim(),
      name: name.trim(),
      type,
      category,
      categoryNameAr: categoryNames[category],
      description: description.trim() || undefined,
    });

    setIsAddModalOpen(false);
    setCode('');
    setName('');
    setDescription('');
  };

  const filteredAccounts = accounts.filter((acc) => {
    const matchType = activeType === 'all' || acc.type === activeType;
    const matchSearch =
      acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.code.includes(searchTerm) ||
      acc.categoryNameAr.toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchSearch;
  });

  // Calculate Ledger movements for currently selected account
  const ledgerMovements = viewingLedgerAcc
    ? journalEntries.flatMap((je) =>
        je.lines
          .filter((l) => l.accountId === viewingLedgerAcc.id)
          .map((l) => ({
            entryId: je.id,
            entryNumber: je.entryNumber,
            date: je.date,
            description: je.description,
            memo: l.memo,
            debit: l.debit,
            credit: l.credit,
          }))
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>دليل الحسابات (شجرة الحسابات العامة)</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            تصنيف وهيكلة الحسابات المالية (الأصول، الخصوم، حقوق الملكية، الإيرادات، والمصروفات)
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة حساب جديد للدليل</span>
        </button>
      </div>

      {/* Toolbar & Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setActiveType('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            كل الحسابات ({accounts.length})
          </button>
          <button
            onClick={() => setActiveType('asset')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeType === 'asset' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الأصول (1)
          </button>
          <button
            onClick={() => setActiveType('liability')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeType === 'liability' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الخصوم (2)
          </button>
          <button
            onClick={() => setActiveType('equity')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeType === 'equity' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            حقوق الملكية (3)
          </button>
          <button
            onClick={() => setActiveType('revenue')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeType === 'revenue' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الإيرادات (4)
          </button>
          <button
            onClick={() => setActiveType('expense')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeType === 'expense' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            المصروفات (5)
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث برمز أو اسم الحساب..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold w-24">رمز الحساب</th>
                <th className="py-3 px-4 font-semibold">اسم الحساب</th>
                <th className="py-3 px-4 font-semibold">التصنيف المحاسبي</th>
                <th className="py-3 px-4 font-semibold">النوع</th>
                <th className="py-3 px-4 font-semibold text-left">الرصيد الدفتري الحالي</th>
                <th className="py-3 px-4 font-semibold text-center w-28">كشف الحساب</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAccounts.map((acc) => {
                const isDebitNature = acc.type === 'asset' || acc.type === 'expense';
                return (
                  <tr key={acc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{acc.code}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{acc.name}</div>
                      {acc.nameEn && <div className="text-[11px] text-slate-400">{acc.nameEn}</div>}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{acc.categoryNameAr}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          acc.type === 'asset'
                            ? 'bg-emerald-50 text-emerald-700'
                            : acc.type === 'liability'
                            ? 'bg-rose-50 text-rose-700'
                            : acc.type === 'equity'
                            ? 'bg-blue-50 text-blue-700'
                            : acc.type === 'revenue'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {acc.type === 'asset'
                          ? 'أصول (مدين)'
                          : acc.type === 'liability'
                          ? 'خصوم (دائن)'
                          : acc.type === 'equity'
                          ? 'حقوق ملكية'
                          : acc.type === 'revenue'
                          ? 'إيرادات (دائن)'
                          : 'مصروفات (مدين)'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-left font-black text-slate-900 text-sm">
                      {formatCurrency(acc.balance, settings.currency)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setViewingLedgerAcc(acc)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>الأستاذ</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Add New Account */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">إضافة حساب جديد لدليل الحسابات</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  رمز الحساب (Account Code) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: 106 أو 203 أو 509"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  اسم الحساب بالعربية *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مصروف صيانة المركبات، عهدة الفرع الشمالي..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    النوع الرئيسي
                  </label>
                  <select
                    value={type}
                    onChange={(e) => {
                      const newType = e.target.value as AccountType;
                      setType(newType);
                      if (newType === 'asset') setCategory('current_asset');
                      else if (newType === 'liability') setCategory('current_liability');
                      else if (newType === 'equity') setCategory('equity');
                      else if (newType === 'revenue') setCategory('operating_revenue');
                      else setCategory('operating_expense');
                    }}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="asset">أصول (Assets)</option>
                    <option value="liability">خصوم (Liabilities)</option>
                    <option value="equity">حقوق ملكية (Equity)</option>
                    <option value="revenue">إيرادات (Revenue)</option>
                    <option value="expense">مصروفات (Expense)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    التصنيف الفرعي
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as AccountCategory)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {type === 'asset' && (
                      <>
                        <option value="current_asset">أصول متداولة</option>
                        <option value="fixed_asset">أصول ثابتة</option>
                      </>
                    )}
                    {type === 'liability' && (
                      <>
                        <option value="current_liability">التزامات متداولة</option>
                        <option value="long_term_liability">التزامات طويلة الأجل</option>
                      </>
                    )}
                    {type === 'equity' && <option value="equity">حقوق ملكية</option>}
                    {type === 'revenue' && (
                      <>
                        <option value="operating_revenue">إيرادات تشغيلية</option>
                        <option value="other_revenue">إيرادات أخرى</option>
                      </>
                    )}
                    {type === 'expense' && (
                      <>
                        <option value="operating_expense">مصروفات تشغيلية</option>
                        <option value="cost_of_sales">تكلفة المبيعات</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  الوصف / الاستخدام
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="وصف مختصر للغرض من الحساب..."
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer"
                >
                  حفظ الحساب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Account Ledger Statement (دفتر الأستاذ للحساب) */}
      {viewingLedgerAcc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded text-xs">
                    {viewingLedgerAcc.code}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    كشف دفتر الأستاذ: {viewingLedgerAcc.name}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  التصنيف: {viewingLedgerAcc.categoryNameAr} · الرصيد الحالي: {formatCurrency(viewingLedgerAcc.balance, settings.currency)}
                </p>
              </div>
              <button
                onClick={() => setViewingLedgerAcc(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {ledgerMovements.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  لا توجد حركات قيود مسجلة على هذا الحساب حتى الآن.
                </div>
              ) : (
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">التاريخ</th>
                      <th className="py-2.5 px-3 font-semibold">رقم القيد</th>
                      <th className="py-2.5 px-3 font-semibold">البيان</th>
                      <th className="py-2.5 px-3 font-semibold text-left">مدين</th>
                      <th className="py-2.5 px-3 font-semibold text-left">دائن</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ledgerMovements.map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">{formatDate(m.date)}</td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">{m.entryNumber}</td>
                        <td className="py-2.5 px-3 text-slate-800">
                          <div>{m.description}</div>
                          {m.memo && <div className="text-[11px] text-slate-400">{m.memo}</div>}
                        </td>
                        <td className="py-2.5 px-3 text-left font-bold text-slate-900">
                          {m.debit > 0 ? formatCurrency(m.debit, settings.currency) : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-left font-bold text-slate-900">
                          {m.credit > 0 ? formatCurrency(m.credit, settings.currency) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-900">
              <span>إجمالي الحركات: {ledgerMovements.length} حركة</span>
              <span className="text-sm">الرصيد النهائي: {formatCurrency(viewingLedgerAcc.balance, settings.currency)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
