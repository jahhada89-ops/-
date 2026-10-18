import React, { useState } from 'react';
import { useAccounting } from '../../context/AccountingContext';
import { formatCurrency, formatDate, getTodayString } from '../../utils/formatters';
import { BudgetProgressBar } from '../common/Charts';
import {
  Plus,
  Search,
  Filter,
  DollarSign,
  PieChart,
  Trash2,
  Utensils,
  Car,
  Gamepad2,
  Building,
  Users,
  Megaphone,
  Wifi,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  SlidersHorizontal,
  X,
  CreditCard,
  Calendar,
  Layers,
} from 'lucide-react';
import { ExpenseCategory } from '../../types/accounting';

// Icon resolver for Lucide icons
export const renderCategoryIcon = (iconName: string, className = 'w-4 h-4') => {
  switch (iconName) {
    case 'Utensils':
      return <Utensils className={className} />;
    case 'Car':
      return <Car className={className} />;
    case 'Gamepad2':
      return <Gamepad2 className={className} />;
    case 'Building':
      return <Building className={className} />;
    case 'Users':
      return <Users className={className} />;
    case 'Megaphone':
      return <Megaphone className={className} />;
    case 'Wifi':
      return <Wifi className={className} />;
    case 'Wrench':
      return <Wrench className={className} />;
    default:
      return <Layers className={className} />;
  }
};

export const ExpensesView: React.FC = () => {
  const {
    expenses,
    addExpense,
    deleteExpense,
    expenseCategories,
    updateCategoryBudget,
    getCategoryBudgetReports,
    accounts,
    settings,
    exchangeRateSarToEtb,
    displayCurrencyMode,
    formatAmount,
    convertSarToEtb,
    convertEtbToSar,
  } = useAccounting();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'all' | 'today' | 'week' | 'month'>('month');
  
  // Modals state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [editingBudgetCat, setEditingBudgetCat] = useState<ExpenseCategory | null>(null);
  const [newBudgetValue, setNewBudgetValue] = useState<number>(0);

  // New Expense Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [expenseCurrency, setExpenseCurrency] = useState<'SAR' | 'ETB'>('SAR');
  const [customRate, setCustomRate] = useState<string>(String(exchangeRateSarToEtb));
  const [categoryId, setCategoryId] = useState<string>(expenseCategories[0]?.id || 'cat_food');
  const [date, setDate] = useState<string>(getTodayString());
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'bank'>('card');
  const [paidFromAccountId, setPaidFromAccountId] = useState<string>(
    accounts.find((a) => a.type === 'asset')?.id || ''
  );
  const [vendorName, setVendorName] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Category budget reports
  const budgetReports = getCategoryBudgetReports();
  const totalBudget = expenseCategories.reduce((sum, c) => sum + c.monthlyBudget, 0);
  const totalSpentThisMonth = budgetReports.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalBudget - totalSpentThisMonth;
  const overBudgetCount = budgetReports.filter((b) => b.isOverBudget).length;

  // Filtered expenses
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);
  const todayStr = getTodayString();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const filteredExpenses = expenses.filter((exp) => {
    // Search
    const matchSearch =
      exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exp.vendorName && exp.vendorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      exp.categoryName.toLowerCase().includes(searchTerm.toLowerCase());

    // Category
    const matchCat = selectedCategory === 'all' || exp.categoryId === selectedCategory;

    // Timeframe
    let matchTime = true;
    if (selectedTimeframe === 'today') {
      matchTime = exp.date === todayStr;
    } else if (selectedTimeframe === 'week') {
      matchTime = exp.date >= oneWeekAgo;
    } else if (selectedTimeframe === 'month') {
      matchTime = exp.date.startsWith(currentMonth);
    }

    return matchSearch && matchCat && matchTime;
  });

  const handleOpenAddExpense = (catId?: string) => {
    if (catId) setCategoryId(catId);
    setTitle('');
    setAmount('');
    setExpenseCurrency('SAR');
    setCustomRate(String(exchangeRateSarToEtb));
    setDate(getTodayString());
    setVendorName('');
    setReceiptNumber('');
    setNotes('');
    setIsAddExpenseOpen(true);
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!title.trim() || isNaN(numAmount) || numAmount <= 0) {
      alert('يرجى إدخال وصف ومبلغ صحيح للمصروف');
      return;
    }

    const cat = expenseCategories.find((c) => c.id === categoryId);
    const categoryName = cat ? cat.name : 'أخرى';

    const rate = parseFloat(customRate) || exchangeRateSarToEtb;
    let finalAmountInSAR = numAmount;
    let originalAmt: number | undefined = undefined;
    let exchangeDiff: number | undefined = undefined;

    if (expenseCurrency === 'ETB') {
      originalAmt = numAmount;
      finalAmountInSAR = rate > 0 ? numAmount / rate : 0;
      // Calculate exchange variance against standard rate
      const standardSAR = exchangeRateSarToEtb > 0 ? numAmount / exchangeRateSarToEtb : 0;
      exchangeDiff = finalAmountInSAR - standardSAR;
    }

    addExpense({
      title: title.trim(),
      amount: finalAmountInSAR,
      currency: expenseCurrency,
      originalAmount: originalAmt,
      exchangeRate: rate,
      exchangeDiff: exchangeDiff ? Math.round(exchangeDiff * 100) / 100 : undefined,
      categoryId,
      categoryName,
      date,
      paymentMethod,
      paidFromAccountId,
      vendorName: vendorName.trim() || undefined,
      receiptNumber: receiptNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    setIsAddExpenseOpen(false);
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBudgetCat) {
      updateCategoryBudget(editingBudgetCat.id, newBudgetValue);
      setEditingBudgetCat(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>نظام تتبع المصاريف والميزانيات</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            تسجيل وإدارة النفقات اليومية، وتصنيفها وضبط أسقف الميزانية لكل فئة بدقة
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenAddExpense()}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-all hover:shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مصروف جديد</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Spent this month */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">مصاريف الشهر الحالي</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold text-slate-900">
              {formatCurrency(totalSpentThisMonth, settings.currency)}
            </span>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span>نسبة من إجمالي الميزانية: </span>
              <span className="font-bold text-slate-800">
                {totalBudget > 0 ? Math.round((totalSpentThisMonth / totalBudget) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Total Monthly Budget */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">إجمالي الميزانية الشهرية</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold text-slate-900">
              {formatCurrency(totalBudget, settings.currency)}
            </span>
            <div className="text-xs text-slate-500 mt-1">
              موزعة على {expenseCategories.length} فئات رئيسية
            </div>
          </div>
        </div>

        {/* Remaining Budget */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">المتبقي من الميزانية</span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                totalRemaining >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span
              className={`text-2xl font-extrabold ${
                totalRemaining >= 0 ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {formatCurrency(totalRemaining, settings.currency)}
            </span>
            <div className="text-xs text-slate-500 mt-1">
              {totalRemaining >= 0 ? 'ضمن النطاق المالي المحدد' : 'تم تجاوز إجمالي الميزانية!'}
            </div>
          </div>
        </div>

        {/* Categories Over Budget */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">تجاوزات الميزانية</span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                overBudgetCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span
              className={`text-2xl font-extrabold ${
                overBudgetCount > 0 ? 'text-amber-600' : 'text-emerald-600'
              }`}
            >
              {overBudgetCount} فئات
            </span>
            <div className="text-xs text-slate-500 mt-1">
              {overBudgetCount > 0 ? 'تتطلب مراقبة وتقليص نفقات' : 'جميع الفئات ملتزمة بالسقف'}
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: Categories & Budget Allocation */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
              <span>ميزانيات الفئات (Budget Limits per Category)</span>
            </h2>
            <p className="text-xs text-slate-500">
              تحديد سقف الإنفاق المالي لكل فئة (الطعام، النقل، الترفيه، السكن...) ومتابعة الاستهلاك لحظياً
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {budgetReports.map((report) => (
            <div key={report.category.id} className="relative group">
              <BudgetProgressBar
                categoryName={report.category.name}
                spent={report.spent}
                budget={report.budget}
                color={report.category.color}
                currency={settings.currency}
                onEditBudget={() => {
                  setEditingBudgetCat(report.category);
                  setNewBudgetValue(report.category.monthlyBudget);
                }}
              />
              <button
                onClick={() => handleOpenAddExpense(report.category.id)}
                className="absolute top-4 left-4 text-xs bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 px-2 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                title={`إضافة مصروف سريع لـ ${report.category.name}`}
              >
                <Plus className="w-3 h-3" />
                <span>إضافة</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Expense Records & Filtering */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Filters & Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <h3 className="text-base font-bold text-slate-900 whitespace-nowrap">
              سجل النفقات التفصيلي
            </h3>
            <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-medium">
              {filteredExpenses.length} حركة
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="بحث بالوصف، المورد، الفئة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
            >
              <option value="all">كل الفئات</option>
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Timeframe Filter */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setSelectedTimeframe('today')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  selectedTimeframe === 'today'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                اليوم
              </button>
              <button
                onClick={() => setSelectedTimeframe('week')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  selectedTimeframe === 'week'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                هذا الأسبوع
              </button>
              <button
                onClick={() => setSelectedTimeframe('month')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  selectedTimeframe === 'month'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                هذا الشهر
              </button>
              <button
                onClick={() => setSelectedTimeframe('all')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  selectedTimeframe === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                الكل
              </button>
            </div>
          </div>
        </div>

        {/* Expenses List Table */}
        <div className="overflow-x-auto">
          {filteredExpenses.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Layers className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">لم يتم العثور على نفقات تطابق شروط البحث</p>
              <button
                onClick={() => handleOpenAddExpense()}
                className="mt-3 text-xs text-emerald-600 font-semibold hover:underline cursor-pointer"
              >
                + تسجيل مصروف جديد الآن
              </button>
            </div>
          ) : (
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">التاريخ</th>
                  <th className="py-3.5 px-4 font-semibold">وصف المصروف</th>
                  <th className="py-3.5 px-4 font-semibold">الفئة</th>
                  <th className="py-3.5 px-4 font-semibold">المورد / الجهة</th>
                  <th className="py-3.5 px-4 font-semibold">طريقة الدفع</th>
                  <th className="py-3.5 px-4 font-semibold text-left">المبلغ</th>
                  <th className="py-3.5 px-4 font-semibold text-center w-16">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map((exp) => {
                  const cat = expenseCategories.find((c) => c.id === exp.categoryId);
                  return (
                    <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {formatDate(exp.date)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{exp.title}</div>
                        {exp.receiptNumber && (
                          <div className="text-[11px] text-slate-400">إيصال: {exp.receiptNumber}</div>
                        )}
                        {exp.notes && (
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">{exp.notes}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: cat?.color || '#94a3b8' }}
                          />
                          <span className="font-medium text-slate-700">{exp.categoryName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {exp.vendorName || '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {exp.paymentMethod === 'cash'
                          ? 'نقدي (كاش)'
                          : exp.paymentMethod === 'card'
                          ? 'بطاقة مدى / ائتمان'
                          : 'تحويل بنكي'}
                      </td>
                      <td className="py-3 px-4 text-left font-bold text-rose-600 whitespace-nowrap">
                        {formatCurrency(exp.amount, settings.currency)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            if (confirm(`هل أنت متأكد من حذف مصروف "${exp.title}"؟`)) {
                              deleteExpense(exp.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="حذف المصروف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL 1: Add New Expense */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">تسجيل نفقة / مصروف جديد</h3>
                  <p className="text-xs text-slate-500">إدخال بيانات المصروف وتخصيص الفئة والحساب</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddExpenseOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="p-5 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  بيان / وصف المصروف *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: وجبة غداء عمل، وقود لسيارات التوصيل، اشتراك إنترنت..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Currency Selector (SAR vs ETB) */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-800">عملة المصروف:</label>
                  <div className="flex items-center gap-1 bg-white border border-slate-200 p-0.5 rounded-lg text-xs">
                    <button
                      type="button"
                      onClick={() => setExpenseCurrency('SAR')}
                      className={`px-3 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                        expenseCurrency === 'SAR'
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      🇸🇦 ريال سعودي (SAR)
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpenseCurrency('ETB')}
                      className={`px-3 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                        expenseCurrency === 'ETB'
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      🇪🇹 بر إثيوبي (ETB)
                    </button>
                  </div>
                </div>

                {expenseCurrency === 'ETB' && (
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-600">سعر الصرف (1 ر.س = بر إثيوبي):</span>
                      <input
                        type="number"
                        step="0.01"
                        value={customRate}
                        onChange={(e) => setCustomRate(e.target.value)}
                        className="w-24 px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono font-bold text-left"
                      />
                    </div>
                    {parseFloat(amount) > 0 && (
                      <div className="flex items-center justify-between border-t border-slate-100 pt-1.5 font-bold">
                        <span className="text-slate-600">المعادل بالريال السعودي:</span>
                        <span className="text-emerald-700">
                          {((parseFloat(amount) || 0) / (parseFloat(customRate) || exchangeRateSarToEtb)).toFixed(2)} ر.س
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    المبلغ المطلوب تسجيله ({expenseCurrency === 'ETB' ? 'بر إثيوبي' : 'ريال سعودي'}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">التاريخ *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  تصنيف النفقة (فئة الميزانية) *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
                >
                  {expenseCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} (الميزانية المتاحة: {formatCurrency(cat.monthlyBudget, settings.currency)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method & Paid From Account */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    طريقة الدفع
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="card">بطاقة مدى / ائتمانية</option>
                    <option value="cash">نقدي من الصندوق (كاش)</option>
                    <option value="bank">تحويل بنكي مباشر</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    الخصم من الحساب
                  </label>
                  <select
                    value={paidFromAccountId}
                    onChange={(e) => setPaidFromAccountId(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {accounts
                      .filter((a) => a.type === 'asset')
                      .map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} ({formatCurrency(acc.balance, settings.currency)})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Vendor & Receipt */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    المورد / المتجر (اختياري)
                  </label>
                  <input
                    type="text"
                    placeholder="اسم المتجر أو الشركة"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    رقم الإيصال / الفاتورة (اختياري)
                  </label>
                  <input
                    type="text"
                    placeholder="REC-XXXX"
                    value={receiptNumber}
                    onChange={(e) => setReceiptNumber(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ملاحظات إضافية (اختياري)
                </label>
                <textarea
                  rows={2}
                  placeholder="أي تفاصيل أو ملاحظات..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  حفظ المصروف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Budget Limit */}
      {editingBudgetCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                تعديل سقف ميزانية: {editingBudgetCat.name}
              </h3>
              <button
                onClick={() => setEditingBudgetCat(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  المبلغ الشهري المحدد للميزانية ({settings.currency})
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  required
                  value={newBudgetValue}
                  onChange={(e) => setNewBudgetValue(parseFloat(e.target.value) || 0)}
                  className="w-full text-base font-bold px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
                <p className="text-[11px] text-slate-500 mt-1.5">
                  سيتم تتبع الإنفاق تلقائياً مقابل هذا السقف وتقديم تنبيهات عند الاقتراب أو التجاوز.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingBudgetCat(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer"
                >
                  تحديث الميزانية
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
