import React, { useState } from 'react';
import { useAccounting } from '../../context/AccountingContext';
import { formatCurrency, formatDate, exportToCSV } from '../../utils/formatters';
import { BarChart, DonutChart } from '../common/Charts';
import { ReportPeriod } from '../../types/accounting';
import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart as PieIcon,
  FileSpreadsheet,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle,
} from 'lucide-react';

export const FinancialReportsView: React.FC = () => {
  const {
    settings,
    generateFinancialReport,
    accounts,
    journalEntries,
    invoices,
    expenses,
    incomes,
  } = useAccounting();

  // Active view tab inside reports
  const [activeReportTab, setActiveReportTab] = useState<
    'summary' | 'income_statement' | 'balance_sheet' | 'trial_balance' | 'vat_report'
  >('summary');

  // Time period filter
  const [period, setPeriod] = useState<ReportPeriod>('monthly');

  // Get report data from context engine
  const reportData = generateFinancialReport(period);

  // Accounting Statements Computations
  // 1. Income Statement
  const revenueAccounts = accounts.filter((a) => a.type === 'revenue');
  const expenseAccounts = accounts.filter((a) => a.type === 'expense');
  const totalRevenue = revenueAccounts.reduce((sum, a) => sum + Math.abs(a.balance), 0);
  const totalExpensesFromAccounts = expenseAccounts.reduce((sum, a) => sum + Math.abs(a.balance), 0);
  const accountingNetProfit = totalRevenue - totalExpensesFromAccounts;

  // 2. Balance Sheet
  const assetAccounts = accounts.filter((a) => a.type === 'asset');
  const liabilityAccounts = accounts.filter((a) => a.type === 'liability');
  const equityAccounts = accounts.filter((a) => a.type === 'equity');

  const totalAssets = assetAccounts.reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = liabilityAccounts.reduce((sum, a) => sum + a.balance, 0);
  const totalEquity = equityAccounts.reduce((sum, a) => sum + a.balance, 0) + accountingNetProfit;

  // 3. VAT calculations
  const salesInvoices = invoices.filter((i) => i.type === 'sale');
  const purchaseInvoices = invoices.filter((i) => i.type === 'purchase');
  const outputVat = salesInvoices.reduce((sum, i) => sum + i.taxTotal, 0);
  const inputVat = purchaseInvoices.reduce((sum, i) => sum + i.taxTotal, 0);
  const netVatPayable = outputVat - inputVat;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (activeReportTab === 'summary') {
      const rows: (string | number)[][] = [
        ['تقرير ملخص الدخل والنفقات', settings.companyName],
        ['الفترة الزمنية', period === 'daily' ? 'يومي' : period === 'weekly' ? 'أسبوعي' : 'شهري'],
        ['من تاريخ', reportData.startDate, 'إلى تاريخ', reportData.endDate],
        [''],
        ['الفترة / البند', 'إجمالي الدخل', 'إجمالي النفقات', 'صافي الفارق'],
        ...reportData.items.map((it) => [it.label, it.income, it.expense, it.net]),
        ['الإجمالي العام', reportData.totalIncome, reportData.totalExpenses, reportData.netSavings],
      ];
      exportToCSV(`financial_report_${period}`, rows);
    } else if (activeReportTab === 'trial_balance') {
      const rows: (string | number)[][] = [
        ['ميزان المراجعة', settings.companyName],
        ['تاريخ التقرير', new Date().toISOString().split('T')[0]],
        [''],
        ['رمز الحساب', 'اسم الحساب', 'النوع', 'مدين', 'دائن'],
        ...accounts.map((acc) => {
          const isDebit = acc.type === 'asset' || acc.type === 'expense';
          return [
            acc.code,
            acc.name,
            acc.categoryNameAr,
            isDebit ? acc.balance : 0,
            !isDebit ? acc.balance : 0,
          ];
        }),
      ];
      exportToCSV('trial_balance', rows);
    } else {
      const rows: (string | number)[][] = [
        ['قائمة الحسابات والتقرير المالي', settings.companyName],
        ['إجمالي الإيرادات', totalRevenue],
        ['إجمالي المصروفات', totalExpensesFromAccounts],
        ['صافي الربح', accountingNetProfit],
        ['إجمالي الأصول', totalAssets],
        ['إجمالي الخصوم', totalLiabilities],
        ['إجمالي حقوق الملكية', totalEquity],
      ];
      exportToCSV('financial_statement', rows);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 no-print">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>التقارير المالية والتحليل البياني</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            ملخصات الدخل والنفقات لفترات محددة مع الرسوم البيانية، وقوائم الدخل والميزانية العمومية
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>تصدير Excel/CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة التقرير</span>
          </button>
        </div>
      </div>

      {/* Printable Header (Visible only when printing) */}
      <div className="hidden print-only mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold">{settings.companyName}</h2>
        <div className="text-sm text-gray-600">
          <span>الرقم الضريبي: {settings.taxNumber}</span> ·{' '}
          <span>تاريخ الطباعة: {formatDate(new Date().toISOString())}</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2 no-print">
        <button
          onClick={() => setActiveReportTab('summary')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeReportTab === 'summary'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>ملخص الدخل والنفقات (بياني)</span>
        </button>

        <button
          onClick={() => setActiveReportTab('income_statement')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeReportTab === 'income_statement'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>قائمة الدخل والأرباح (P&L)</span>
        </button>

        <button
          onClick={() => setActiveReportTab('balance_sheet')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeReportTab === 'balance_sheet'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>الميزانية العمومية (Balance Sheet)</span>
        </button>

        <button
          onClick={() => setActiveReportTab('trial_balance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeReportTab === 'trial_balance'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>ميزان المراجعة (Trial Balance)</span>
        </button>

        <button
          onClick={() => setActiveReportTab('vat_report')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeReportTab === 'vat_report'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>إقرار ضريبة القيمة المضافة (VAT)</span>
        </button>
      </div>

      {/* TAB 1: SUMMARY WITH CHARTS (DAILY, WEEKLY, MONTHLY) */}
      {activeReportTab === 'summary' && (
        <div className="space-y-6">
          {/* Period Selection Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-800">تحديد الفترة الزمنية للتقرير:</span>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setPeriod('daily')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  period === 'daily'
                    ? 'bg-white text-emerald-700 shadow-xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                يوميًا (Daily)
              </button>
              <button
                onClick={() => setPeriod('weekly')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  period === 'weekly'
                    ? 'bg-white text-emerald-700 shadow-xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                أسبوعيًا (Weekly)
              </button>
              <button
                onClick={() => setPeriod('monthly')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  period === 'monthly'
                    ? 'bg-white text-emerald-700 shadow-xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                شهريًا (Monthly)
              </button>
            </div>
          </div>

          {/* Metric KPI Cards for Period */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Income */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">إجمالي الدخل المحصل</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ArrowDownLeft className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-extrabold text-emerald-600">
                  {formatCurrency(reportData.totalIncome, settings.currency)}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  خلال الفترة: {period === 'daily' ? 'آخر 7 أيام' : period === 'weekly' ? 'آخر 4 أسابيع' : 'آخر 6 أشهر'}
                </div>
              </div>
            </div>

            {/* Total Expenses */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">إجمالي النفقات والمصروفات</span>
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-extrabold text-rose-600">
                  {formatCurrency(reportData.totalExpenses, settings.currency)}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  موزعة على كافة تصنيفات الميزانية
                </div>
              </div>
            </div>

            {/* Net Savings / Profit */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">صافي الوفر / الأرباح</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div
                  className={`text-2xl font-extrabold ${
                    reportData.netSavings >= 0 ? 'text-slate-900' : 'text-rose-600'
                  }`}
                >
                  {formatCurrency(reportData.netSavings, settings.currency)}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  الفارق الصافي (الدخل - المصروفات)
                </div>
              </div>
            </div>

            {/* Savings Rate */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">معدل الوفر والربحية</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-extrabold text-slate-900">
                  {reportData.savingsRate}%
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  نسبة الفائض المالي من إجمالي الدخل
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bar Chart (Income vs Expense) */}
            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-600" />
                    <span>مقارنة الدخل والنفقات ({period === 'daily' ? 'يوميًا' : period === 'weekly' ? 'أسبوعيًا' : 'شهريًا'})</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    رسم بياني يوضح تدفقات الإيرادات مقابل المصروفات عبر فترات زمنية محددة
                  </p>
                </div>
              </div>

              <BarChart data={reportData.items} currency={settings.currency} height={280} />
            </div>

            {/* Donut Chart (Expenses by Category) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
                  <PieIcon className="w-4 h-4 text-rose-500" />
                  <span>توزيع النفقات حسب الفئات</span>
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  نسبة استهلاك كل تصنيف من إجمالي المصاريف
                </p>

                <DonutChart
                  data={reportData.categoryBreakdown}
                  totalAmount={reportData.totalExpenses}
                  currency={settings.currency}
                />
              </div>
            </div>
          </div>

          {/* Detailed Period Breakdown Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                جدول البيانات التفصيلي للفترة ({period === 'daily' ? 'اليومية' : period === 'weekly' ? 'الأسبوعية' : 'الشهرية'})
              </h3>
              <span className="text-xs text-slate-500">
                الفترة من {reportData.startDate} إلى {reportData.endDate}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-semibold">الفترة الزمنية</th>
                    <th className="py-3 px-4 font-semibold text-emerald-700">إجمالي الدخل</th>
                    <th className="py-3 px-4 font-semibold text-rose-700">إجمالي النفقات</th>
                    <th className="py-3 px-4 font-semibold">صافي الفارق (الربح / التوفير)</th>
                    <th className="py-3 px-4 font-semibold text-center">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.items.map((it) => (
                    <tr key={it.key} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-800">{it.label}</td>
                      <td className="py-3 px-4 text-emerald-600 font-bold">
                        {formatCurrency(it.income, settings.currency)}
                      </td>
                      <td className="py-3 px-4 text-rose-600 font-bold">
                        {formatCurrency(it.expense, settings.currency)}
                      </td>
                      <td
                        className={`py-3 px-4 font-extrabold ${
                          it.net >= 0 ? 'text-slate-900' : 'text-rose-600'
                        }`}
                      >
                        {formatCurrency(it.net, settings.currency)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            it.net >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {it.net >= 0 ? 'فائض مالي' : 'عجز / سالب'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {/* Total Row */}
                  <tr className="bg-slate-50 font-bold border-t-2 border-slate-200 text-slate-900">
                    <td className="py-3.5 px-4 font-extrabold">المجموع الإجمالي</td>
                    <td className="py-3.5 px-4 text-emerald-700 font-black">
                      {formatCurrency(reportData.totalIncome, settings.currency)}
                    </td>
                    <td className="py-3.5 px-4 text-rose-700 font-black">
                      {formatCurrency(reportData.totalExpenses, settings.currency)}
                    </td>
                    <td className="py-3.5 px-4 font-black">
                      {formatCurrency(reportData.netSavings, settings.currency)}
                    </td>
                    <td className="py-3.5 px-4 text-center text-emerald-700">
                      نسبة الوفر {reportData.savingsRate}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INCOME STATEMENT (P&L) */}
      {activeReportTab === 'income_statement' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <div className="text-center pb-4 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">قائمة الدخل (الأرباح والخسائر)</h3>
            <p className="text-xs text-slate-500 mt-1">عن السنة المالية المنتهية في 2026</p>
          </div>

          <div className="space-y-4 max-w-3xl mx-auto text-xs sm:text-sm">
            {/* Revenue */}
            <div>
              <div className="flex items-center justify-between font-bold text-slate-900 bg-slate-100 p-2.5 rounded-lg mb-2">
                <span>الإيرادات والمبيعات (Revenues)</span>
                <span>{formatCurrency(totalRevenue, settings.currency)}</span>
              </div>
              <div className="space-y-1.5 pr-4">
                {revenueAccounts.map((acc) => (
                  <div key={acc.id} className="flex justify-between text-slate-600 py-1 border-b border-slate-100">
                    <span>
                      {acc.code} - {acc.name}
                    </span>
                    <span className="font-semibold text-slate-800">
                      {formatCurrency(acc.balance, settings.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expenses */}
            <div>
              <div className="flex items-center justify-between font-bold text-slate-900 bg-slate-100 p-2.5 rounded-lg mb-2">
                <span>المصروفات والتكاليف التشغيلية (Expenses)</span>
                <span className="text-rose-600">
                  {formatCurrency(totalExpensesFromAccounts, settings.currency)}
                </span>
              </div>
              <div className="space-y-1.5 pr-4">
                {expenseAccounts.map((acc) => (
                  <div key={acc.id} className="flex justify-between text-slate-600 py-1 border-b border-slate-100">
                    <span>
                      {acc.code} - {acc.name}
                    </span>
                    <span className="font-semibold text-slate-800">
                      {formatCurrency(acc.balance, settings.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Net Income Summary */}
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between font-bold text-base text-emerald-900 mt-6">
              <span>صافي الربح / الدخل الصافي (Net Income)</span>
              <span className="text-xl font-black text-emerald-700">
                {formatCurrency(accountingNetProfit, settings.currency)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BALANCE SHEET */}
      {activeReportTab === 'balance_sheet' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <div className="text-center pb-4 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">الميزانية العمومية (قائمة المركز المالي)</h3>
            <p className="text-xs text-slate-500 mt-1">كما في تاريخ اليوم YYYY-MM-DD</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs sm:text-sm">
            {/* Assets */}
            <div className="space-y-4">
              <div className="flex justify-between items-center font-bold text-slate-900 bg-slate-100 p-2.5 rounded-lg">
                <span>الأصول والموجودات (Assets)</span>
                <span className="text-emerald-700 font-black">
                  {formatCurrency(totalAssets, settings.currency)}
                </span>
              </div>
              <div className="space-y-1.5 pr-2">
                {assetAccounts.map((acc) => (
                  <div key={acc.id} className="flex justify-between text-slate-600 py-1 border-b border-slate-100">
                    <span>
                      {acc.code} - {acc.name}
                    </span>
                    <span className="font-semibold text-slate-800">
                      {formatCurrency(acc.balance, settings.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Liabilities & Equity */}
            <div className="space-y-6">
              {/* Liabilities */}
              <div className="space-y-2">
                <div className="flex justify-between items-center font-bold text-slate-900 bg-slate-100 p-2.5 rounded-lg">
                  <span>الخصوم والالتزامات (Liabilities)</span>
                  <span className="text-rose-700 font-black">
                    {formatCurrency(totalLiabilities, settings.currency)}
                  </span>
                </div>
                <div className="space-y-1.5 pr-2">
                  {liabilityAccounts.map((acc) => (
                    <div key={acc.id} className="flex justify-between text-slate-600 py-1 border-b border-slate-100">
                      <span>
                        {acc.code} - {acc.name}
                      </span>
                      <span className="font-semibold text-slate-800">
                        {formatCurrency(acc.balance, settings.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Equity */}
              <div className="space-y-2">
                <div className="flex justify-between items-center font-bold text-slate-900 bg-slate-100 p-2.5 rounded-lg">
                  <span>حقوق الملكية (Equity)</span>
                  <span className="text-blue-700 font-black">
                    {formatCurrency(totalEquity, settings.currency)}
                  </span>
                </div>
                <div className="space-y-1.5 pr-2">
                  {equityAccounts.map((acc) => (
                    <div key={acc.id} className="flex justify-between text-slate-600 py-1 border-b border-slate-100">
                      <span>
                        {acc.code} - {acc.name}
                      </span>
                      <span className="font-semibold text-slate-800">
                        {formatCurrency(acc.balance, settings.currency)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between text-slate-700 py-1 font-semibold">
                    <span>أرباح الفترة الحالية (من قائمة الدخل)</span>
                    <span className="text-emerald-600 font-bold">
                      {formatCurrency(accountingNetProfit, settings.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Balance verification note */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-center justify-between text-xs text-slate-700 font-semibold">
            <span>إجمالي الأصول: {formatCurrency(totalAssets, settings.currency)}</span>
            <span className="text-emerald-600 font-bold">معادلة الميزانية: الأصول = الخصوم + حقوق الملكية ✓</span>
            <span>إجمالي الخصوم وحقوق الملكية: {formatCurrency(totalLiabilities + totalEquity, settings.currency)}</span>
          </div>
        </div>
      )}

      {/* TAB 4: TRIAL BALANCE */}
      {activeReportTab === 'trial_balance' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-900">ميزان المراجعة بالأرصدة (Trial Balance)</h3>
            <p className="text-xs text-slate-500">تدقيق إجمالي الحركات والأرصدة المدينة والدائنة لكافة حسابات الدليل</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">رمز الحساب</th>
                  <th className="py-3 px-4 font-semibold">اسم الحساب</th>
                  <th className="py-3 px-4 font-semibold">التصنيف</th>
                  <th className="py-3 px-4 font-semibold text-left">الرصيد المدين</th>
                  <th className="py-3 px-4 font-semibold text-left">الرصيد الدائن</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accounts.map((acc) => {
                  const isDebit = acc.type === 'asset' || acc.type === 'expense';
                  return (
                    <tr key={acc.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-4 font-mono font-semibold text-slate-800">{acc.code}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-900">{acc.name}</td>
                      <td className="py-2.5 px-4 text-slate-500">{acc.categoryNameAr}</td>
                      <td className="py-2.5 px-4 text-left font-semibold text-slate-900">
                        {isDebit ? formatCurrency(acc.balance, settings.currency) : '-'}
                      </td>
                      <td className="py-2.5 px-4 text-left font-semibold text-slate-900">
                        {!isDebit ? formatCurrency(acc.balance, settings.currency) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: VAT REPORT */}
      {activeReportTab === 'vat_report' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <div className="text-center pb-4 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">إقرار ضريبة القيمة المضافة (15% VAT)</h3>
            <p className="text-xs text-slate-500 mt-1">
              حساب ضريبة المخرجات وضريبة المدخلات وصافي الضريبة المستحقة لهيئة الزكاة والضريبة والجمارك
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-xs text-slate-500 font-medium">ضريبة المبيعات (المخرجات)</span>
              <div className="text-xl font-bold text-slate-900 mt-2">
                {formatCurrency(outputVat, settings.currency)}
              </div>
              <span className="text-[11px] text-slate-400">من فواتير المبيعات الصادرة</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-xs text-slate-500 font-medium">ضريبة المشتريات (المدخلات القابلة للخصم)</span>
              <div className="text-xl font-bold text-slate-900 mt-2">
                {formatCurrency(inputVat, settings.currency)}
              </div>
              <span className="text-[11px] text-slate-400">من فواتير الشراء المعتمدة</span>
            </div>

            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50">
              <span className="text-xs text-emerald-800 font-semibold">صافي الضريبة المستحقة للسداد</span>
              <div className="text-xl font-black text-emerald-700 mt-2">
                {formatCurrency(netVatPayable, settings.currency)}
              </div>
              <span className="text-[11px] text-emerald-600">المبلغ الواجب سداده للهيئة</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
