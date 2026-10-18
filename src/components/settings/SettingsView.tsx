import React, { useState } from 'react';
import { useAccounting } from '../../context/AccountingContext';
import { AppLogo } from '../common/AppLogo';
import {
  Settings,
  Building,
  Save,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  FileText,
  CreditCard,
  Image as ImageIcon,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    accounts,
    exportBackupJSON,
    importBackupJSON,
    resetToDefaultData,
  } = useAccounting();

  const [formSettings, setFormSettings] = useState(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importBackupJSON(content);
      if (success) {
        setImportStatus('تم استيراد واستعادة البيانات بنجاح!');
      } else {
        setImportStatus('فشل استيراد الملف! يرجى التأكد من صحة ملف JSON.');
      }
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>إعدادات النظام والهوية المالية</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          ضبط بيانات المنشأة، شعار التطبيق والفواتير، العملة، الضريبة، والنسخ الاحتياطي
        </p>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>تم حفظ الإعدادات بنجاح!</span>
        </div>
      )}

      {importStatus && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-blue-600" />
          <span>{importStatus}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Brand & Logo Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-emerald-600" />
            <span>شعار التطبيق والفواتير (Logo Identity)</span>
          </h3>

          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="shrink-0 flex flex-col items-center gap-2">
              <AppLogo size="xl" showText={false} logoUrl={formSettings.logoUrl || '/logo.jpg'} />
              <span className="text-[11px] text-slate-500 font-semibold">شعار النظام المعتمد</span>
            </div>

            <div className="space-y-2 flex-1 w-full text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  مسار أو رابط الشعار
                </label>
                <input
                  type="text"
                  value={formSettings.logoUrl || '/logo.jpg'}
                  onChange={(e) => setFormSettings({ ...formSettings, logoUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono"
                  placeholder="/logo.jpg"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                هذا الشعار يظهر في الترويسة الرئيسية للتطبيق، وفي أعلى فواتير المبيعات والمشتريات الرسمية وسندات الصرف والقبض.
              </p>
            </div>
          </div>
        </div>

        {/* Company Info */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-4 h-4 text-emerald-600" />
            <span>بيانات المنشأة الرسمية</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                اسم المنشأة / المكتب المحاسبي *
              </label>
              <input
                type="text"
                required
                value={formSettings.companyName}
                onChange={(e) => setFormSettings({ ...formSettings, companyName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                رقم السجل التجاري
              </label>
              <input
                type="text"
                value={formSettings.commercialRegister}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, commercialRegister: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                الرقم الضريبي (VAT Number)
              </label>
              <input
                type="text"
                value={formSettings.taxNumber}
                onChange={(e) => setFormSettings({ ...formSettings, taxNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                رقم الهاتف / الاتصال
              </label>
              <input
                type="text"
                value={formSettings.phone}
                onChange={(e) => setFormSettings({ ...formSettings, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">العنوان الوطني</label>
              <input
                type="text"
                value={formSettings.address}
                onChange={(e) => setFormSettings({ ...formSettings, address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Currency & Tax Defaults */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>التعامل بالعملات وحساب سعر وفارق الصرف (SAR / ETB)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">العملة الأساسية</label>
              <select
                value={formSettings.currency}
                onChange={(e) => setFormSettings({ ...formSettings, currency: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                <option value="SAR">🇸🇦 ريال سعودي (SAR - ر.س)</option>
                <option value="ETB">🇪🇹 بر إثيوبي (ETB)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                سعر صرف الريال مقابل البير الإثيوبي
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formSettings.exchangeRateSarToEtb || 34.50}
                  onChange={(e) =>
                    setFormSettings({
                      ...formSettings,
                      exchangeRateSarToEtb: parseFloat(e.target.value) || 34.50,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                />
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 font-bold">
                  ETB / 1 SAR
                </span>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                نسبة ضريبة القيمة المضافة الافتراضية (%)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                value={formSettings.defaultTaxRate}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, defaultTaxRate: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <span className="font-bold text-slate-800">طريقة الاحتساب الآلي:</span>
            <p>
              يتم تحويل أي مبالغ أو فواتير مدخلة بالبر الإثيوبي إلى الريال السعودي تلقائياً بناءً على سعر الصرف، مع رصد وتسجيل أي فارق بين سعر الصرف المعتمد وسعر العملية الفعلي في حساب فروق أسعار الصرف.
            </p>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>حفظ التعديلات</span>
          </button>
        </div>
      </form>

      {/* Backup and Data Management */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-emerald-600" />
          <span>النسخ الاحتياطي وإدارة البيانات</span>
        </h3>
        <p className="text-xs text-slate-500">
          تصدير قاعدة البيانات المحاسبية كاملة كملف احتياطي مشفر، أو استيرادها لاستعادة القيود والحسابات.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={exportBackupJSON}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>تنزيل نسخة احتياطية (JSON Backup)</span>
          </button>

          <label className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer">
            <Upload className="w-4 h-4 text-slate-500" />
            <span>استيراد واستعادة نسخة احتياطية</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={() => {
              if (confirm('هل أنت متأكد من إعادة ضبط البيانات للبيانات الافتراضية النموذجية؟')) {
                resetToDefaultData();
              }
            }}
            className="flex items-center gap-2 text-rose-600 hover:bg-rose-50 border border-rose-200 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer mr-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>إعادة ضبط البيانات النموذجية</span>
          </button>
        </div>
      </div>
    </div>
  );
};
