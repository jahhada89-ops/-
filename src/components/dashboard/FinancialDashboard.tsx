import React from 'react';
import { useAccounting } from '../../context/AccountingContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { BarChart, DonutChart, BudgetProgressBar } from '../common/Charts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  Users,
  Building2,
  FileText,
  AlertCircle,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronLeft,
  PiggyBank,
} from 'lucide-react';

interface FinancialDashboardProps {
  onNavigate: (tab: string) => void;
  onOpenAddExpense: () => void;
  onOpenAddIncome: () => void;
}

export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({
  onNavigate,
  onOpenAddExpense,
  onOpenAddIncome,
}) => {
  const {
    settings,
    accounts,
    expenses,
    incomes,
    invoices,
    contacts,
    getCategoryBudgetReports,
    generateFinancialReport,
  } = useAccounting();

  // Summary Metrics
  const monthlyReport = generateFinancialReport('monthly');
  const weeklyReport = generateFinancialReport('weekly');

  // Cash and Bank Balances
  const cashAcc = accounts.find((a) => a.id === settings.defaultCashAccountId) || accounts[0];
  const bankAcc = accounts.find((a) => a.id === settings.defaultBankAccountId) || accounts[1];
  const totalLiquidCash = (cashAcc?.balance || 0) + (bankAcc?.balance || 0);

  // Receivables & Payables
  const clients = contacts.filter((c) => c.type === 'client');
  const vendors = contacts.filter((c) => c.type === 'vendor');
  const totalReceivables = clients.reduce((sum, c) => sum + Math.max(0, c.currentBalance), 0);
  const totalPayables = vendors.reduce((sum, v) => sum + Math.abs(Math.min(0, v.currentBalance)), 0);

  // Budget summaries
  const budgetReports = getCategoryBudgetReports();
  const topOverBudgets = budgetReports.filter((b) => b.isOverBudget);

  // Recent Transactions (combined expenses + incomes)
  const recentActivities = [
    ...expenses.map((e) => ({
      id: e.id,
      title: e.title,
      amount: e.amount,
      type: 'expense' as const,
      category: e.categoryName,
      date: e.date,
    })),
    ...incomes.map((i) => ({
      id: i.id,
      title: i.title,
      amount: i.amount,
      type: 'income' as const,
      category: i.category,
      date: i.date,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-emerald-400 font-bold text-xs tracking-wider uppercase">
              لوحة التحكم المالية والمركز النقدي
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {settings.companyName}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              متابعة الأرصدة النقدية، تتبع النفقات والميزانيات، وفواتير المبيعات مع التقارير والرسوم البيانية اللحظية.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenAddExpense}
              className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-102 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل مصروف جديد</span>
            </button>
            <button
              onClick={onOpenAddIncome}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-102 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل إيراد مالي</span>
            </button>
          </div>
        </div>

        {/* Subtle decorative glow */}
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Liquidity / Cash in Banks */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">السيولة النقدية المتاحة</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">
              {formatCurrency(totalLiquidCash, settings.currency)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
              <span>البنك: {formatCurrency(bankAcc?.balance || 0, settings.currency)}</span>
              <span>الصندوق: {formatCurrency(cashAcc?.balance || 0, settings.currency)}</span>
            </div>
          </div>
        </div>

        {/* Monthly Income */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">إجمالي إيرادات الفترة</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-600">
              {formatCurrency(monthlyReport.totalIncome, settings.currency)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              مبيعات وعقود واستشارات مسجلة
            </div>
          </div>
        </div>

        {/* Monthly Expenses */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">إجمالي المصروفات والنفقات</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-600">
              {formatCurrency(monthlyReport.totalExpenses, settings.currency)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              مصنفة ضمن ميزانيات الأقسام
            </div>
          </div>
        </div>

        {/* Net Savings / Surplus */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">الفائض الصافي / الأرباح</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div
              className={`text-2xl font-black ${
                monthlyReport.netSavings >= 0 ? 'text-slate-900' : 'text-rose-600'
              }`}
            >
              {formatCurrency(monthlyReport.netSavings, settings.currency)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              معدل الوفر المالي {monthlyReport.savingsRate}%
            </div>
          </div>
        </div>
      </div>

      {/* Alert on Overbudget (if any) */}
      {topOverBudgets.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900">
                تنبيه: تم تجاوز سقف الميزانية في {topOverBudgets.length} فئات!
              </h4>
              <p className="text-[11px] text-amber-700">
                الفئات المتجاوزة: {topOverBudgets.map((b) => b.category.name).join('، ')}. يرجى مراجعة وتعديل الميزانية أو ضبط النفقات.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('expenses')}
            className="text-xs font-bold text-amber-900 bg-white border border-amber-300 hover:bg-amber-100 px-3.5 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer"
          >
            عرض المصاريف والميزانيات
          </button>
        </div>
      )}

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Income vs Expenses Bar Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                مقارنة الإيرادات والنفقات (أسبوعيًا)
              </h3>
              <p className="text-xs text-slate-500">
                حجم التدفقات النقدية الداخلة والخارجة لآخر 4 أسابيع
              </p>
            </div>
            <button
              onClick={() => onNavigate('reports')}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>عرض كافة التقارير</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <BarChart data={weeklyReport.items} currency={settings.currency} height={260} />
        </div>

        {/* Expenses Distribution Donut */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900">توزيع المصاريف</h3>
              <button
                onClick={() => onNavigate('expenses')}
                className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                تعديل الميزانيات
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              نسبة كل فئة إنفاق من الإجمالي
            </p>

            <DonutChart
              data={monthlyReport.categoryBreakdown}
              totalAmount={monthlyReport.totalExpenses}
              currency={settings.currency}
            />
          </div>
        </div>
      </div>

      {/* Two Columns: Top Budgets status & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Status Snapshot */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              أبرز أسقف الميزانيات المعتمدة لهذا الشهر
            </h3>
            <button
              onClick={() => onNavigate('expenses')}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer"
            >
              عرض الكل ({budgetReports.length})
            </button>
          </div>

          <div className="space-y-3">
            {budgetReports.slice(0, 3).map((r) => (
              <BudgetProgressBar
                key={r.category.id}
                categoryName={r.category.name}
                spent={r.spent}
                budget={r.budget}
                color={r.category.color}
                currency={settings.currency}
              />
            ))}
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">أحدث الحركات المالية</h3>
            <span className="text-xs text-slate-400">آخر 6 حركات</span>
          </div>

          <div className="divide-y divide-slate-100">
            {recentActivities.map((act) => (
              <div key={act.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      act.type === 'income'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-rose-50 text-rose-600'
                    }`}
                  >
                    {act.type === 'income' ? (
                      <ArrowDownLeft className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{act.title}</div>
                    <div className="text-[11px] text-slate-400">
                      {act.category} · {formatDate(act.date)}
                    </div>
                  </div>
                </div>

                <div
                  className={`font-bold text-sm whitespace-nowrap ${
                    act.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {act.type === 'income' ? '+' : '-'}
                  {formatCurrency(act.amount, settings.currency)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
