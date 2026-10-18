import React, { useState } from 'react';
import { useAccounting } from '../../context/AccountingContext';
import { getTodayString } from '../../utils/formatters';
import { Plus, X } from 'lucide-react';

interface AddIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddIncomeModal: React.FC<AddIncomeModalProps> = ({ isOpen, onClose }) => {
  const { addIncome, accounts, settings } = useAccounting();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('مبيعات منتجات');
  const [date, setDate] = useState(getTodayString());
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank'>('bank');
  const [depositAccountId, setDepositAccountId] = useState(
    accounts.find((a) => a.type === 'asset')?.id || ''
  );
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!title.trim() || isNaN(numAmount) || numAmount <= 0) {
      alert('يرجى إدخال وصف ومبلغ صحيح للإيراد');
      return;
    }

    addIncome({
      title: title.trim(),
      amount: numAmount,
      category,
      date,
      paymentMethod,
      depositAccountId,
      customerName: customerName.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">تسجيل إيراد / مقبوضات مالية</h3>
              <p className="text-[11px] text-slate-500">إضافة إيراد إلى الصندوق أو الحساب البنكي</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              بيان / وصف الإيراد *
            </label>
            <input
              type="text"
              required
              placeholder="مثال: دفعة عقد توريد، مبيعات نقدية، أتعاب استشارة..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                المبلغ ({settings.currency}) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">التاريخ *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">نوع الإيراد</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              <option value="مبيعات منتجات">مبيعات منتجات وبضائع</option>
              <option value="استشارات وخدمات">استشارات وخدمات مهنية</option>
              <option value="اشتراكات وخدمات">اشتراكات دورية وعقود صيانة</option>
              <option value="إيرادات أخرى">إيرادات أخرى متفرقة</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">طريقة القبض</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="bank">تحويل بنكي</option>
                <option value="cash">نقدي بالصندوق (كاش)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">إيداع في حساب</label>
              <select
                value={depositAccountId}
                onChange={(e) => setDepositAccountId(e.target.value)}
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              اسم العميل / الجهة الدافعة (اختياري)
            </label>
            <input
              type="text"
              placeholder="اسم العميل أو الشركة"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
            >
              حفظ الإيراد
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
