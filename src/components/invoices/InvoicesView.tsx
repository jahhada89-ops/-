import React, { useState } from 'react';
import { useAccounting } from '../../context/AccountingContext';
import { formatCurrency, formatDate, getTodayString } from '../../utils/formatters';
import { Invoice, InvoiceItem, InvoiceType, InvoiceStatus } from '../../types/accounting';
import { AppLogo } from '../common/AppLogo';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Printer,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Trash2,
  CreditCard,
  Download,
  Building,
  User,
  QrCode,
} from 'lucide-react';

export const InvoicesView: React.FC = () => {
  const {
    invoices,
    addInvoice,
    recordInvoicePayment,
    contacts,
    accounts,
    settings,
    exchangeRateSarToEtb,
    displayCurrencyMode,
    formatAmount,
    convertSarToEtb,
  } = useAccounting();

  // Filters
  const [activeType, setActiveType] = useState<InvoiceType | 'all'>('sale');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);

  // Payment Form state
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(getTodayString());
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank'>('bank');
  const [paymentAccountId, setPaymentAccountId] = useState<string>(
    accounts.find((a) => a.type === 'asset')?.id || ''
  );
  const [paymentNotes, setPaymentNotes] = useState('');

  // New Invoice Form state
  const [invType, setInvType] = useState<InvoiceType>('sale');
  const [partyId, setPartyId] = useState<string>(contacts[0]?.id || '');
  const [invDate, setInvDate] = useState<string>(getTodayString());
  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });
  const [invNotes, setInvNotes] = useState('');
  const [items, setItems] = useState<
    { id: string; description: string; quantity: number; unitPrice: number; discount: number; taxRate: number }[]
  >([
    {
      id: '1',
      description: 'خدمات استشارية ومحاسبية متكاملة',
      quantity: 1,
      unitPrice: 5000,
      discount: 0,
      taxRate: settings.defaultTaxRate || 15,
    },
  ]);

  // Invoice calculations
  const calculatedItems: InvoiceItem[] = items.map((it) => {
    const subtotal = Math.max(0, it.quantity * it.unitPrice - (it.discount || 0));
    const taxAmount = (subtotal * it.taxRate) / 100;
    const total = subtotal + taxAmount;
    return {
      ...it,
      subtotal,
      taxAmount,
      total,
    };
  });

  const subtotal = calculatedItems.reduce((sum, it) => sum + it.subtotal, 0);
  const taxTotal = calculatedItems.reduce((sum, it) => sum + it.taxAmount, 0);
  const discountTotal = items.reduce((sum, it) => sum + (Number(it.discount) || 0), 0);
  const grandTotal = subtotal + taxTotal;

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        description: '',
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        taxRate: settings.defaultTaxRate || 15,
      },
    ]);
  };

  const handleRemoveItem = (idx: number) => {
    if (items.length <= 1) {
      alert('يجب أن تحتوي الفاتورة على بند واحد على الأقل');
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx: number, field: string, value: any) => {
    setItems((prev) =>
      prev.map((it, i) => {
        if (i === idx) {
          return { ...it, [field]: value };
        }
        return it;
      })
    );
  };

  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const party = contacts.find((c) => c.id === partyId);
    const partyName = party ? party.name : 'طرف غير محدد';

    const invNum = `${invType === 'sale' ? 'INV' : 'BILL'}-2026-${String(invoices.length + 1).padStart(3, '0')}`;

    addInvoice({
      invoiceNumber: invNum,
      type: invType,
      partyId,
      partyName,
      date: invDate,
      dueDate,
      items: calculatedItems,
      subtotal,
      taxTotal,
      discountTotal,
      grandTotal,
      notes: invNotes.trim() || undefined,
      paymentMethod: 'bank',
    });

    setIsCreateOpen(false);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice) return;
    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('يرجى إدخال مبلغ سداد صحيح');
      return;
    }
    const remaining = payingInvoice.grandTotal - payingInvoice.paidAmount;
    if (amt > remaining) {
      alert(`المبلغ المدخل أكبر من المتبقي على الفاتورة (${formatCurrency(remaining, settings.currency)})`);
      return;
    }

    recordInvoicePayment({
      invoiceId: payingInvoice.id,
      amount: amt,
      date: paymentDate,
      paymentMethod,
      paymentAccountId,
      notes: paymentNotes.trim() || undefined,
    });

    setPayingInvoice(null);
    setPaymentAmount('');
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchType = activeType === 'all' || inv.type === activeType;
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.partyName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 no-print">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>إدارة الفواتير والمبيعات والمشتريات</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            إصدار ومتابعة فواتير المبيعات الضريبية وفواتير الشراء، وسداد الدفعات وحساب الضريبة 15%
          </p>
        </div>

        <button
          onClick={() => {
            setInvType('sale');
            setIsCreateOpen(true);
          }}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء فاتورة جديدة</span>
        </button>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 no-print">
        {/* Type selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setActiveType('sale')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeType === 'sale'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            فواتير المبيعات (Sales)
          </button>
          <button
            onClick={() => setActiveType('purchase')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeType === 'purchase'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            فواتير المشتريات (Purchases)
          </button>
          <button
            onClick={() => setActiveType('all')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeType === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الكل
          </button>
        </div>

        {/* Status & Search */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">كل الحالات</option>
            <option value="paid">مسددة بالكامل</option>
            <option value="partial">مسددة جزئيًا</option>
            <option value="unpaid">غير مسددة</option>
          </select>

          <div className="relative flex-1 md:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="بحث برقم الفاتورة أو الطرف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden no-print">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">رقم الفاتورة</th>
                <th className="py-3 px-4 font-semibold">العميل / المورد</th>
                <th className="py-3 px-4 font-semibold">تاريخ الإصدار</th>
                <th className="py-3 px-4 font-semibold">الاستحقاق</th>
                <th className="py-3 px-4 font-semibold text-left">الإجمالي شامل الضريبة</th>
                <th className="py-3 px-4 font-semibold text-left">المسدد</th>
                <th className="py-3 px-4 font-semibold text-left">المتبقي</th>
                <th className="py-3 px-4 font-semibold text-center">حالة السداد</th>
                <th className="py-3 px-4 font-semibold text-center w-36">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    لا توجد فواتير مطابقة للشروط
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const remaining = inv.grandTotal - inv.paidAmount;
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{inv.partyName}</td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{formatDate(inv.date)}</td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{formatDate(inv.dueDate)}</td>
                      <td className="py-3 px-4 text-left font-black text-slate-900">
                        {formatAmount(inv.grandTotal)}
                      </td>
                      <td className="py-3 px-4 text-left font-semibold text-emerald-600">
                        {formatAmount(inv.paidAmount)}
                      </td>
                      <td className="py-3 px-4 text-left font-bold text-slate-700">
                        {formatAmount(remaining)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            inv.status === 'paid'
                              ? 'bg-emerald-50 text-emerald-700'
                              : inv.status === 'partial'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {inv.status === 'paid'
                            ? 'مسددة بالكامل'
                            : inv.status === 'partial'
                            ? 'مسددة جزئياً'
                            : 'غير مسددة'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setViewingInvoice(inv)}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="معاينة وطباعة الفاتورة الضريبية"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {inv.status !== 'paid' && (
                            <button
                              onClick={() => {
                                setPayingInvoice(inv);
                                setPaymentAmount(String(remaining));
                              }}
                              className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="تسجيل دفعة سداد"
                            >
                              <CreditCard className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Create New Invoice */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <AppLogo size="sm" showText={false} logoUrl={settings.logoUrl || '/logo.jpg'} />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    إنشاء فاتورة {invType === 'sale' ? 'مبيعات ضريبية' : 'مشتريات'} جديدة
                  </h3>
                  <p className="text-xs text-slate-500">
                    حساب الضريبة {settings.defaultTaxRate}% تلقائياً وتحديث أرصدة العملاء والموردين
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInvoice} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    نوع الفاتورة
                  </label>
                  <select
                    value={invType}
                    onChange={(e) => setInvType(e.target.value as InvoiceType)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="sale">فاتورة مبيعات (عميل)</option>
                    <option value="purchase">فاتورة مشتريات (مورد)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {invType === 'sale' ? 'العميل' : 'المورد'} *
                  </label>
                  <select
                    value={partyId}
                    onChange={(e) => setPartyId(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {contacts
                      .filter((c) =>
                        invType === 'sale'
                          ? c.type === 'client' || c.type === 'both'
                          : c.type === 'vendor' || c.type === 'both'
                      )
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.city || ''})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">تاريخ الإصدار</label>
                  <input
                    type="date"
                    required
                    value={invDate}
                    onChange={(e) => setInvDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">تاريخ الاستحقاق</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Items Line Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden mt-4">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">بنود الفاتورة والخدمات</span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة بند</span>
                  </button>
                </div>

                <div className="p-3 space-y-2">
                  {items.map((it, idx) => (
                    <div key={it.id} className="flex flex-wrap sm:flex-nowrap items-center gap-2 text-xs">
                      <div className="w-full sm:w-2/5">
                        <input
                          type="text"
                          required
                          placeholder="وصف الصنف أو الخدمة..."
                          value={it.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                        />
                      </div>

                      <div className="w-1/4 sm:w-20">
                        <input
                          type="number"
                          min="1"
                          required
                          placeholder="الكمية"
                          value={it.quantity}
                          onChange={(e) =>
                            handleItemChange(idx, 'quantity', parseInt(e.target.value) || 1)
                          }
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center"
                        />
                      </div>

                      <div className="w-1/3 sm:w-28">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          placeholder="السعر"
                          value={it.unitPrice}
                          onChange={(e) =>
                            handleItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-left"
                        />
                      </div>

                      <div className="w-1/3 sm:w-24">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="خصم"
                          value={it.discount}
                          onChange={(e) =>
                            handleItemChange(idx, 'discount', parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-left"
                        />
                      </div>

                      <div className="w-1/4 sm:w-20 text-center font-semibold text-slate-600">
                        %{it.taxRate}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Calculation Summary Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="text-slate-500">
                    ضريبة القيمة المضافة محسوبة بنسبة {settings.defaultTaxRate}%
                  </div>
                  <div className="space-y-1 text-left">
                    <div className="flex justify-between gap-8 text-slate-600">
                      <span>المجموع الفرعي (قبل الضريبة):</span>
                      <span className="font-bold">{formatCurrency(subtotal, settings.currency)}</span>
                    </div>
                    {discountTotal > 0 && (
                      <div className="flex justify-between gap-8 text-rose-600">
                        <span>إجمالي الخصم:</span>
                        <span className="font-bold">-{formatCurrency(discountTotal, settings.currency)}</span>
                      </div>
                    )}
                    <div className="flex justify-between gap-8 text-slate-600">
                      <span>إجمالي ضريبة القيمة المضافة (15%):</span>
                      <span className="font-bold text-slate-800">
                        {formatCurrency(taxTotal, settings.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-8 text-sm font-extrabold text-slate-900 border-t border-slate-200 pt-1">
                      <span>الإجمالي الكلي النهائي:</span>
                      <span className="text-emerald-700">
                        {formatCurrency(grandTotal, settings.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  شروط وملاحظات الفاتورة (اختياري)
                </label>
                <textarea
                  rows={2}
                  placeholder="مثال: يرجى التحويل إلى مصرف الراجحي... شكراً لتعاملكم معنا"
                  value={invNotes}
                  onChange={(e) => setInvNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs cursor-pointer"
                >
                  إصدار الفاتورة وترحيلها
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Record Payment */}
      {payingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                تسجيل دفعة سداد: {payingInvoice.invoiceNumber}
              </h3>
              <button
                onClick={() => setPayingInvoice(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-5 space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>إجمالي الفاتورة:</span>
                  <span className="font-bold">{formatCurrency(payingInvoice.grandTotal, settings.currency)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>المبلغ المسدد مسبقاً:</span>
                  <span className="font-semibold text-emerald-600">
                    {formatCurrency(payingInvoice.paidAmount, settings.currency)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1">
                  <span>المتبقي للسداد:</span>
                  <span className="text-rose-600">
                    {formatCurrency(payingInvoice.grandTotal - payingInvoice.paidAmount, settings.currency)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  مبلغ الدفعة ({settings.currency}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full text-base font-bold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    طريقة السداد
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="bank">تحويل بنكي</option>
                    <option value="cash">نقدي (كاش)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    إيداع في حساب
                  </label>
                  <select
                    value={paymentAccountId}
                    onChange={(e) => setPaymentAccountId(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {accounts
                      .filter((a) => a.type === 'asset')
                      .map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">تاريخ السداد</label>
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setPayingInvoice(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                >
                  تأكيد السداد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Official Printable Tax Invoice Preview (WITH LOGO) */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-8">
            {/* Top Toolbar (no print) */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between no-print">
              <span className="text-xs font-bold">معاينة الفاتورة الضريبية الرسمية الجاهزة للطباعة</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة الفاتورة</span>
                </button>
                <button
                  onClick={() => setViewingInvoice(null)}
                  className="text-slate-300 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official Invoice Sheet */}
            <div className="p-8 sm:p-12 space-y-8 bg-white text-slate-900" id="tax-invoice-printable">
              {/* Header with user logo */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b-2 border-slate-900">
                <div className="flex items-center gap-4">
                  {/* User-specified logo */}
                  <div className="w-20 h-20 shrink-0 bg-white p-1 rounded-xl border border-slate-200 shadow-xs flex items-center justify-center overflow-hidden">
                    <img
                      src={settings.logoUrl || '/logo.jpg'}
                      alt="شعار جهاد أحمد للمحاسبة"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">{settings.companyName}</h2>
                    <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                      <div>سجل تجاري: {settings.commercialRegister}</div>
                      <div>الرقم الضريبي: {settings.taxNumber}</div>
                      <div>{settings.address}</div>
                    </div>
                  </div>
                </div>

                <div className="text-left flex flex-col items-end">
                  <div className="bg-slate-900 text-white px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider mb-2">
                    {viewingInvoice.type === 'sale' ? 'فاتورة ضريبية' : 'فاتورة مشتريات'}
                  </div>
                  <div className="text-sm font-mono font-bold text-slate-900">
                    {viewingInvoice.invoiceNumber}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    تاريخ الإصدار: {formatDate(viewingInvoice.date)}
                  </div>
                  <div className="text-xs text-slate-500">
                    تاريخ الاستحقاق: {formatDate(viewingInvoice.dueDate)}
                  </div>
                </div>
              </div>

              {/* Customer / Party details */}
              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl text-xs">
                <div>
                  <span className="font-bold text-slate-500 block mb-1">بيانات العميل / المشتري:</span>
                  <div className="font-bold text-slate-900 text-sm">{viewingInvoice.partyName}</div>
                  <div className="text-slate-600 mt-0.5">المملكة العربية السعودية</div>
                </div>
                <div className="text-left">
                  <span className="font-bold text-slate-500 block mb-1">حالة الفاتورة:</span>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      viewingInvoice.status === 'paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : viewingInvoice.status === 'partial'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {viewingInvoice.status === 'paid'
                      ? 'مسددة بالكامل'
                      : viewingInvoice.status === 'partial'
                      ? 'مسددة جزئياً'
                      : 'مستحقة للدفع'}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-right text-xs border border-slate-200">
                <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">الوصف والبيان</th>
                    <th className="py-2.5 px-3 text-center">الكمية</th>
                    <th className="py-2.5 px-3 text-left">سعر الوحدة</th>
                    <th className="py-2.5 px-3 text-left">الخصم</th>
                    <th className="py-2.5 px-3 text-center">نسبة الضريبة</th>
                    <th className="py-2.5 px-3 text-left">مبلغ الضريبة</th>
                    <th className="py-2.5 px-3 text-left">الإجمالي شامل الضريبة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {viewingInvoice.items.map((it, idx) => (
                    <tr key={it.id}>
                      <td className="py-2.5 px-3 text-slate-500">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{it.description}</td>
                      <td className="py-2.5 px-3 text-center">{it.quantity}</td>
                      <td className="py-2.5 px-3 text-left">{formatCurrency(it.unitPrice, settings.currency)}</td>
                      <td className="py-2.5 px-3 text-left text-rose-600">
                        {it.discount > 0 ? `-${formatCurrency(it.discount, settings.currency)}` : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold">%{it.taxRate}</td>
                      <td className="py-2.5 px-3 text-left">{formatCurrency(it.taxAmount, settings.currency)}</td>
                      <td className="py-2.5 px-3 text-left font-bold text-slate-900">
                        {formatCurrency(it.total, settings.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary and QR Code Section */}
              <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pt-4">
                {/* QR Code compliance stamp */}
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="w-20 h-20 bg-white p-2 border border-slate-300 rounded-lg flex items-center justify-center">
                    <QrCode className="w-16 h-16 text-slate-900" />
                  </div>
                  <div className="text-[11px] text-slate-600 space-y-1">
                    <div className="font-bold text-slate-800">رمز الاستجابة السريعة (ZATCA QR)</div>
                    <div>مؤسسة: {settings.companyName}</div>
                    <div>الرقم الضريبي: {settings.taxNumber}</div>
                    <div>قيمة الضريبة: {formatCurrency(viewingInvoice.taxTotal, settings.currency)}</div>
                  </div>
                </div>

                {/* Final Calculations */}
                <div className="w-full sm:w-72 space-y-2 text-xs text-left">
                  <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                    <span>المجموع قبل الضريبة:</span>
                    <span className="font-semibold text-slate-800">
                      {formatCurrency(viewingInvoice.subtotal, settings.currency)}
                    </span>
                  </div>
                  {viewingInvoice.discountTotal > 0 && (
                    <div className="flex justify-between py-1 border-b border-slate-100 text-rose-600">
                      <span>إجمالي الخصم:</span>
                      <span className="font-semibold">
                        -{formatCurrency(viewingInvoice.discountTotal, settings.currency)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                    <span>ضريبة القيمة المضافة (15%):</span>
                    <span className="font-semibold text-slate-800">
                      {formatCurrency(viewingInvoice.taxTotal, settings.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b-2 border-slate-900 text-sm font-black text-slate-900">
                    <span>الإجمالي المستحق (SAR):</span>
                    <span className="text-emerald-700">
                      {formatCurrency(viewingInvoice.grandTotal, 'SAR')}
                    </span>
                  </div>
                  {/* Ethiopian Birr Converted Amount Box */}
                  <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-lg text-emerald-950 font-bold space-y-0.5">
                    <div className="flex justify-between text-xs">
                      <span>المعادل بالبر الإثيوبي (ETB):</span>
                      <span className="font-extrabold text-emerald-800">
                        {formatCurrency(
                          viewingInvoice.grandTotal * (viewingInvoice.exchangeRate || exchangeRateSarToEtb),
                          'ETB'
                        )}
                      </span>
                    </div>
                    <div className="text-[10px] text-emerald-700">
                      سعر الصرف المعتمد: 1 ر.س = {viewingInvoice.exchangeRate || exchangeRateSarToEtb} بر إثيوبي
                    </div>
                  </div>
                  <div className="flex justify-between py-1 text-slate-600">
                    <span>المبلغ المسدد:</span>
                    <span className="font-bold text-emerald-600">
                      {formatCurrency(viewingInvoice.paidAmount, settings.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 font-bold text-slate-900">
                    <span>الرصيد المتبقي:</span>
                    <span className="text-rose-600">
                      {formatCurrency(viewingInvoice.grandTotal - viewingInvoice.paidAmount, settings.currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {viewingInvoice.notes && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                  <span className="font-bold block text-slate-800 mb-0.5">ملاحظات وتعليمات:</span>
                  {viewingInvoice.notes}
                </div>
              )}

              {/* Invoice Footer */}
              <div className="pt-6 border-t border-slate-200 text-center text-[11px] text-slate-400">
                تم إصدار هذه الفاتورة إلكترونياً بواسطة نظام جهاد أحمد للمحاسبة والمالية · شكراً لتعاملكم معنا
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
