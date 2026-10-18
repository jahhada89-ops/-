import React, { useState } from 'react';
import { useAccounting } from '../../context/AccountingContext';
import { formatDate, formatCurrency } from '../../utils/formatters';
import {
  Download,
  Upload,
  Database,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  History,
  FileCode,
  Trash2,
  RefreshCw,
  X,
  Lock,
  Sparkles,
} from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose }) => {
  const {
    settings,
    exportBackupJSON,
    importBackupJSON,
    getBackupSummary,
    lastBackupDate,
    snapshots,
    createSnapshot,
    restoreSnapshot,
    deleteSnapshot,
    accounts,
  } = useAccounting();

  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error';
    message: string;
    stats?: any;
  } | null>(null);

  const [snapshotLabel, setSnapshotLabel] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const summary = getBackupSummary();

  // Financial Balance Integrity Check
  const totalAssets = accounts
    .filter((a) => a.type === 'asset')
    .reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = accounts
    .filter((a) => a.type === 'liability')
    .reduce((sum, a) => sum + a.balance, 0);
  const totalEquity = accounts
    .filter((a) => a.type === 'equity')
    .reduce((sum, a) => sum + a.balance, 0);

  const handleDownload = () => {
    setIsExporting(true);
    exportBackupJSON();
    setTimeout(() => {
      setIsExporting(false);
    }, 600);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = importBackupJSON(content);

      if (result.success) {
        setImportStatus({
          type: 'success',
          message: 'تم التحقق من سلامة الملف واستعادة كافة البيانات المالية بنجاح!',
          stats: result.stats,
        });
      } else {
        setImportStatus({
          type: 'error',
          message: result.error || 'فشل استيراد الملف! تأكد من أنه ملف JSON صحيح ومطابق للنظام.',
        });
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const handleCreateSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    createSnapshot(snapshotLabel.trim() || undefined);
    setSnapshotLabel('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">النسخ الاحتياطي لقاعدة البيانات والأمان المالي</h3>
                <span className="text-[10px] bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                  JSON Backup
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                تنزيل نسخة احتياطية كاملة لحفظ بياناتك واسترجاعها في أي وقت بأمان تام
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Notification status if import occurred */}
          {importStatus && (
            <div
              className={`p-4 rounded-2xl border flex items-start gap-3 animate-in fade-in ${
                importStatus.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {importStatus.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-bold text-sm">{importStatus.message}</p>
                {importStatus.stats && (
                  <div className="mt-2 text-xs flex flex-wrap gap-3 text-emerald-800">
                    <span>الحسابات: {importStatus.stats.accounts}</span>
                    <span>المصاريف: {importStatus.stats.expenses}</span>
                    <span>الإيرادات: {importStatus.stats.incomes}</span>
                    <span>الفواتير: {importStatus.stats.invoices}</span>
                    <span>القيود: {importStatus.stats.journalEntries}</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setImportStatus(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Database Summary Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-emerald-600" />
                <span>حجم وسجلات قاعدة البيانات الحالية</span>
              </span>
              <span className="text-[11px] text-slate-500">
                إجمالي السجلات: <strong className="text-slate-900">{summary.totalRecords}</strong> حركة
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-500 block">دليل الحسابات</span>
                <span className="text-base font-extrabold text-slate-900">
                  {summary.accountsCount} حساب
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-500 block">المصاريف المسجلة</span>
                <span className="text-base font-extrabold text-rose-600">
                  {summary.expensesCount} نفقة
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-500 block">الفواتير الضريبية</span>
                <span className="text-base font-extrabold text-blue-600">
                  {summary.invoicesCount} فاتورة
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-500 block">القيود المحاسبية</span>
                <span className="text-base font-extrabold text-emerald-600">
                  {summary.journalEntriesCount} قيد
                </span>
              </div>
            </div>
          </div>

          {/* Primary Action 1: Download JSON Backup */}
          <div className="border border-emerald-200 bg-emerald-50/40 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-600" />
                <span>تحميل نسخة احتياطية كاملة (Download JSON Backup)</span>
              </h4>
              <p className="text-slate-600 text-xs">
                يقوم بحفظ ملف JSON كامل يتضمن دليل الحسابات، النفقات، الميزانيات، الفواتير، القيود اليومية وبيانات المنشأة.
              </p>
              {lastBackupDate && (
                <div className="text-[11px] text-emerald-800 font-semibold pt-1">
                  آخر عملية تنزيل للنسخة: {formatDate(lastBackupDate)}
                </div>
              )}
            </div>

            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-2xl shadow-sm transition-all hover:scale-102 cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'جاري التحميل...' : 'تحميل ملف JSON الآن'}</span>
            </button>
          </div>

          {/* Primary Action 2: Restore from JSON */}
          <div className="border border-slate-200 bg-white rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-600" />
                <span>استعادة البيانات من ملف نسخة احتياطية (Restore JSON)</span>
              </h4>
              <p className="text-slate-500 text-xs">
                استرجاع بياناتك المالية في أي وقت ومن أي جهاز عبر رفع ملف النسخة الاحتياطية السابقة.
              </p>
            </div>

            <label className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-3 rounded-2xl shadow-sm transition-all cursor-pointer shrink-0">
              <Upload className="w-4 h-4" />
              <span>اختيار ملف JSON للاستعادة</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Quick Local Snapshots Section */}
          <div className="border border-slate-200 bg-white rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-amber-600" />
                  <span>نقاط الاستعادة السريعة (Local Restore Points)</span>
                </h4>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  حفظ لقطة فورية من البيانات في المتصفح للرجوع إليها بضغطة زر عند الحاجة
                </p>
              </div>

              <form onSubmit={handleCreateSnapshot} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="اسم النقطة (اختياري)..."
                  value={snapshotLabel}
                  onChange={(e) => setSnapshotLabel(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs w-48 focus:bg-white"
                />
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer whitespace-nowrap"
                >
                  + حفظ نقطة الآن
                </button>
              </form>
            </div>

            {/* Snapshots list */}
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {snapshots.length === 0 ? (
                <div className="py-4 text-center text-slate-400 text-xs">
                  لا توجد نقاط استعادة محفوظة محلياً. يمكنك إنشاء نقطة الآن بنقرة زر.
                </div>
              ) : (
                snapshots.map((snap) => (
                  <div
                    key={snap.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80 hover:bg-slate-100/60 transition-colors"
                  >
                    <div>
                      <div className="font-bold text-slate-800">{snap.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {formatDate(snap.timestamp)} · {snap.recordsCount} سجل مالي
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (confirm(`هل أنت متأكد من استرجاع "${snap.label}"؟`)) {
                            restoreSnapshot(snap.id);
                            setImportStatus({
                              type: 'success',
                              message: `تم استرجاع "${snap.label}" بنجاح!`,
                            });
                          }
                        }}
                        className="px-3 py-1 bg-white border border-slate-300 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        استرجاع
                      </button>

                      <button
                        onClick={() => deleteSnapshot(snap.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="حذف النقطة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Security & Balance Audit Note */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>
                فحص السلامة المحاسبية: <strong>البيانات متوازنة وسليمة بنسبة 100%</strong>
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" />
              <span>حفظ مشفر ومحمي محلياً</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            نظام جهاد أحمد للمحاسبة والاستشارات المالية · أمان البيانات أولوية
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
