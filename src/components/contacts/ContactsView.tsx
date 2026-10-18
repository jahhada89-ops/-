import React, { useState } from 'react';
import { useAccounting } from '../../context/AccountingContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Contact } from '../../types/accounting';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Building,
  CreditCard,
  FileText,
  X,
  ExternalLink,
} from 'lucide-react';

export const ContactsView: React.FC = () => {
  const { contacts, addContact, updateContact, invoices, settings } = useAccounting();

  const [activeTab, setActiveTab] = useState<'all' | 'client' | 'vendor'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [statementContact, setStatementContact] = useState<Contact | null>(null);

  // New Contact form
  const [name, setName] = useState('');
  const [type, setType] = useState<'client' | 'vendor'>('client');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [commercialNumber, setCommercialNumber] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('يرجى إدخال اسم العميل أو المورد');
      return;
    }

    addContact({
      name: name.trim(),
      type,
      phone: phone.trim(),
      email: email.trim(),
      taxNumber: taxNumber.trim() || undefined,
      commercialNumber: commercialNumber.trim() || undefined,
      city: city.trim() || undefined,
      address: address.trim() || undefined,
    });

    setIsAddOpen(false);
    setName('');
    setPhone('');
    setEmail('');
    setTaxNumber('');
    setCommercialNumber('');
    setCity('');
    setAddress('');
  };

  const filteredContacts = contacts.filter((c) => {
    const matchType = activeTab === 'all' || c.type === activeTab || c.type === 'both';
    const matchSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.city && c.city.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchType && matchSearch;
  });

  // Invoices for statement
  const contactInvoices = statementContact
    ? invoices.filter((i) => i.partyId === statementContact.id)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>العملاء والموردون (كشوف الحسابات)</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            إدارة بيانات العملاء والموردين ومتابعة المستحقات والمديونيات وكشوف الحسابات التفصيلية
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة عميل / مورد جديد</span>
        </button>
      </div>

      {/* Toolbar & Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الكل ({contacts.length})
          </button>
          <button
            onClick={() => setActiveTab('client')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'client' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            العملاء (مدينون)
          </button>
          <button
            onClick={() => setActiveTab('vendor')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'vendor' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الموردون (دائنون)
          </button>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث بالاسم، الجوال، المدينة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Contacts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.map((contact) => {
          const isClient = contact.type === 'client' || contact.type === 'both';
          const isDebtor = contact.currentBalance > 0;
          return (
            <div
              key={contact.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                        isClient ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {contact.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{contact.name}</h3>
                      <span className="text-[11px] text-slate-500">
                        {isClient ? 'عميل' : 'مورد'} {contact.city ? `· ${contact.city}` : ''}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isClient ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {isClient ? 'عميل' : 'مورد'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 my-3 pr-1">
                  {contact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span dir="ltr">{contact.phone}</span>
                    </div>
                  )}
                  {contact.taxNumber && (
                    <div className="flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>الرقم الضريبي: {contact.taxNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Balance & Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">الرصيد الحالي</span>
                  <span
                    className={`font-black text-sm ${
                      contact.currentBalance > 0
                        ? 'text-emerald-700'
                        : contact.currentBalance < 0
                        ? 'text-rose-700'
                        : 'text-slate-600'
                    }`}
                  >
                    {formatCurrency(Math.abs(contact.currentBalance), settings.currency)}
                    <span className="text-[10px] font-normal mr-1">
                      {contact.currentBalance > 0
                        ? '(لنا - مدين)'
                        : contact.currentBalance < 0
                        ? '(علينا - دائن)'
                        : '(خالص)'}
                    </span>
                  </span>
                </div>

                <button
                  onClick={() => setStatementContact(contact)}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-emerald-700 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>كشف حساب</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: Add Contact */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">إضافة عميل أو مورد جديد</h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  الاسم التجاري أو الشخصي *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: شركة التطوير الحديثة"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">النوع</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="client">عميل (مبيعات)</option>
                    <option value="vendor">مورد (مشتريات)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">المدينة</label>
                  <input
                    type="text"
                    placeholder="الرياض، جدة، الدمام..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    رقم الهاتف / الجوال
                  </label>
                  <input
                    type="text"
                    placeholder="05XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    placeholder="info@company.sa"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  الرقم الضريبي (اختياري)
                </label>
                <input
                  type="text"
                  placeholder="3XXXXXXXXXXXXXX"
                  value={taxNumber}
                  onChange={(e) => setTaxNumber(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                >
                  حفظ البيانات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Statement of Account (كشف حساب) */}
      {statementContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  كشف حساب: {statementContact.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  الرصيد الإجمالي الحالي:{' '}
                  <strong className="text-slate-900">
                    {formatCurrency(statementContact.currentBalance, settings.currency)}
                  </strong>
                </p>
              </div>
              <button
                onClick={() => setStatementContact(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {contactInvoices.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  لا توجد فواتير أو حركات مالية مسجلة لهذا الطرف بعد.
                </div>
              ) : (
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">التاريخ</th>
                      <th className="py-2.5 px-3 font-semibold">رقم الفاتورة</th>
                      <th className="py-2.5 px-3 font-semibold text-left">قيمة الفاتورة</th>
                      <th className="py-2.5 px-3 font-semibold text-left">المسدد</th>
                      <th className="py-2.5 px-3 font-semibold text-left">المتبقي</th>
                      <th className="py-2.5 px-3 font-semibold text-center">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {contactInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 text-slate-500">{formatDate(inv.date)}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-2.5 px-3 text-left font-bold text-slate-900">
                          {formatCurrency(inv.grandTotal, settings.currency)}
                        </td>
                        <td className="py-2.5 px-3 text-left text-emerald-600 font-semibold">
                          {formatCurrency(inv.paidAmount, settings.currency)}
                        </td>
                        <td className="py-2.5 px-3 text-left text-rose-600 font-bold">
                          {formatCurrency(inv.grandTotal - inv.paidAmount, settings.currency)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              inv.status === 'paid'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {inv.status === 'paid' ? 'مسددة' : 'غير مسددة'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
              <button
                onClick={() => setStatementContact(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-xl"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
