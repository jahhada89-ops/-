import React, { useState } from 'react';
import { useAccounting } from '../../context/AccountingContext';
import { formatCurrency, formatDate, getTodayString } from '../../utils/formatters';
import { JournalLine } from '../../types/accounting';
import {
  BookOpen,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  Calendar,
  FileSpreadsheet,
} from 'lucide-react';

export const JournalView: React.FC = () => {
  const { journalEntries, addJournalEntry, deleteJournalEntry, accounts, settings } = useAccounting();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Journal Entry Form State
  const [entryDate, setEntryDate] = useState(getTodayString());
  const [description, setDescription] = useState('');
  const [reference, setReference] = useState('');
  const [lines, setLines] = useState<
    { id: string; accountId: string; debit: number; credit: number; memo: string }[]
  >([
    { id: '1', accountId: accounts[0]?.id || '', debit: 0, credit: 0, memo: '' },
    { id: '2', accountId: accounts[1]?.id || '', debit: 0, credit: 0, memo: '' },
  ]);

  const totalDebit = lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
  const isBalanced = totalDebit > 0 && Math.abs(totalDebit - totalCredit) < 0.01;
  const difference = Math.abs(totalDebit - totalCredit);

  const handleAddLine = () => {
    setLines((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        accountId: accounts[0]?.id || '',
        debit: 0,
        credit: 0,
        memo: '',
      },
    ]);
  };

  const handleRemoveLine = (idx: number) => {
    if (lines.length <= 2) {
      alert('يجب أن يحتوي القيد المحاسبي على طرفين على الأقل (مدين ودائن)');
      return;
    }
    setLines((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleLineChange = (idx: number, field: string, val: any) => {
    setLines((prev) =>
      prev.map((line, i) => {
        if (i === idx) {
          return { ...line, [field]: val };
        }
        return line;
      })
    );
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('يرجى كتابة بيان القيد المحاسبي');
      return;
    }
    if (!isBalanced) {
      alert(`القيد غير متوازن! الفارق بين المدين والدائن هو: ${formatCurrency(difference, settings.currency)}`);
      return;
    }

    const nextNumber = `JE-2026-${String(journalEntries.length + 1).padStart(3, '0')}`;

    const formattedLines: JournalLine[] = lines.map((l) => {
      const acc = accounts.find((a) => a.id === l.accountId);
      return {
        id: l.id,
        accountId: l.accountId,
        accountName: acc?.name || 'حساب غير معروف',
        accountCode: acc?.code || '000',
        debit: Number(l.debit) || 0,
        credit: Number(l.credit) || 0,
        memo: l.memo || undefined,
      };
    });

    addJournalEntry({
      entryNumber: nextNumber,
      date: entryDate,
      description: description.trim(),
      reference: reference.trim() || undefined,
      lines: formattedLines,
      totalDebit,
      totalCredit,
    });

    setIsAddModalOpen(false);
    setDescription('');
    setReference('');
  };

  const filteredEntries = journalEntries.filter(
    (j) =>
      j.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.entryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (j.reference && j.reference.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>سجل القيود اليومية (دفتر اليومية العامة)</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            تسجيل وتدقيق القيود المحاسبية المزدوجة المتوازنة (Debit = Credit) وترحيلها للحسابات
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة قيد يومية متوازن</span>
        </button>
      </div>

      {/* Toolbar / Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث برقم القيد، البيان، المرجع..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <span className="text-xs text-slate-500">
          إجمالي القيود المسجلة: <strong className="text-slate-800">{journalEntries.length}</strong> قيد
        </span>
      </div>

      {/* Entries List */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold">لا توجد قيود مسجلة تطابق البحث</p>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden hover:border-slate-300 transition-all"
            >
              {/* Entry Header */}
              <div className="p-4 bg-slate-50/70 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-slate-900 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                    {entry.entryNumber}
                  </span>
                  <span className="text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(entry.date)}
                  </span>
                  {entry.reference && (
                    <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      مرجع: {entry.reference}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    قيد متوازن ومرحل
                  </span>
                  <span className="font-bold text-slate-900">
                    الإجمالي: {formatCurrency(entry.totalDebit, settings.currency)}
                  </span>
                  <button
                    onClick={() => {
                      if (confirm(`هل أنت متأكد من حذف القيد رقم ${entry.entryNumber}؟`)) {
                        deleteJournalEntry(entry.id);
                      }
                    }}
                    className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                    title="حذف القيد"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="px-4 py-2.5 text-xs font-semibold text-slate-800 bg-white border-b border-slate-100">
                {entry.description}
              </div>

              {/* Entry Lines Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50/50 text-slate-400 border-b border-slate-100">
                    <tr>
                      <th className="py-2 px-4 font-medium">رمز الحساب</th>
                      <th className="py-2 px-4 font-medium">اسم الحساب</th>
                      <th className="py-2 px-4 font-medium">البيان الفرعي</th>
                      <th className="py-2 px-4 font-medium text-left">مدين (Debit)</th>
                      <th className="py-2 px-4 font-medium text-left">دائن (Credit)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {entry.lines.map((line) => (
                      <tr key={line.id} className="hover:bg-slate-50/40">
                        <td className="py-2 px-4 font-mono text-slate-500">{line.accountCode}</td>
                        <td className="py-2 px-4 font-medium text-slate-800">{line.accountName}</td>
                        <td className="py-2 px-4 text-slate-500">{line.memo || '-'}</td>
                        <td className="py-2 px-4 text-left font-semibold text-slate-900">
                          {line.debit > 0 ? formatCurrency(line.debit, settings.currency) : '-'}
                        </td>
                        <td className="py-2 px-4 text-left font-semibold text-slate-900">
                          {line.credit > 0 ? formatCurrency(line.credit, settings.currency) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL: Add Balanced Journal Entry */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">إنشاء قيد يومية محاسبي جديد</h3>
                  <p className="text-xs text-slate-500">
                    يجب أن يتطابق إجمالي الطرف المدين مع إجمالي الطرف الدائن تماماً
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEntry} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    تاريخ القيد *
                  </label>
                  <input
                    type="date"
                    required
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    الرقم المرجعي / الفاتورة (اختياري)
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: فاتورة 102 أو سند صرف 5"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  البيان العام للقيد *
                </label>
                <input
                  type="text"
                  required
                  placeholder="وصف واضح للعملية المحاسبية..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Journal Lines Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden mt-4">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">أطراف القيد (مدين / دائن)</span>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة طرف جديد</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-100 p-2 space-y-2">
                  {lines.map((line, idx) => (
                    <div key={line.id} className="flex flex-wrap sm:flex-nowrap items-center gap-2 text-xs">
                      <div className="w-full sm:w-2/5">
                        <select
                          value={line.accountId}
                          onChange={(e) => handleLineChange(idx, 'accountId', e.target.value)}
                          className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                        >
                          {accounts.map((acc) => (
                            <option key={acc.id} value={acc.id}>
                              {acc.code} - {acc.name} ({acc.categoryNameAr})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-full sm:w-1/4">
                        <input
                          type="text"
                          placeholder="ملاحظة الطرف..."
                          value={line.memo}
                          onChange={(e) => handleLineChange(idx, 'memo', e.target.value)}
                          className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                        />
                      </div>

                      <div className="w-1/2 sm:w-1/6">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="مدين"
                          value={line.debit || ''}
                          onChange={(e) => handleLineChange(idx, 'debit', parseFloat(e.target.value) || 0)}
                          className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-left font-bold text-slate-900"
                        />
                      </div>

                      <div className="w-1/2 sm:w-1/6">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="دائن"
                          value={line.credit || ''}
                          onChange={(e) => handleLineChange(idx, 'credit', parseFloat(e.target.value) || 0)}
                          className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-left font-bold text-slate-900"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveLine(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1.5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Balance validation Footer */}
                <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4">
                    <span>
                      إجمالي المدين: <strong className="text-slate-900">{formatCurrency(totalDebit, settings.currency)}</strong>
                    </span>
                    <span>
                      إجمالي الدائن: <strong className="text-slate-900">{formatCurrency(totalCredit, settings.currency)}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isBalanced ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        القيد متوازن وجاهز للترحيل
                      </span>
                    ) : (
                      <span className="text-rose-600 font-bold flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        غير متوازن! الفارق: {formatCurrency(difference, settings.currency)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={!isBalanced}
                  className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-colors cursor-pointer ${
                    isBalanced
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  ترحيل وحفظ القيد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
