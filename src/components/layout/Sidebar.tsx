import React from 'react';
import { useAccounting } from '../../context/AccountingContext';
import { AppLogo } from '../common/AppLogo';
import {
  LayoutDashboard,
  Wallet,
  BarChart3,
  FileText,
  BookOpen,
  ListTree,
  Users,
  Settings,
  ShieldCheck,
  X,
  Database,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenBackup: () => void;
  onOpenCurrencyConverter: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
  onOpenBackup,
  onOpenCurrencyConverter,
}) => {
  const { settings, exchangeRateSarToEtb } = useAccounting();

  const navItems = [
    {
      id: 'dashboard',
      label: 'لوحة التحكم المالية',
      icon: LayoutDashboard,
      badge: undefined,
    },
    {
      id: 'expenses',
      label: 'تتبع المصاريف والميزانيات',
      icon: Wallet,
      badge: 'الجديد',
    },
    {
      id: 'reports',
      label: 'التقارير المالية والرسوم البيانية',
      icon: BarChart3,
      badge: 'يومي/أسبوعي/شهري',
    },
    {
      id: 'invoices',
      label: 'الفواتير والمبيعات (ضريبة 15%)',
      icon: FileText,
      badge: undefined,
    },
    {
      id: 'journal',
      label: 'دفتر اليومية والقيود',
      icon: BookOpen,
      badge: undefined,
    },
    {
      id: 'accounts',
      label: 'دليل الحسابات والأستاذ',
      icon: ListTree,
      badge: undefined,
    },
    {
      id: 'contacts',
      label: 'العملاء والموردون',
      icon: Users,
      badge: undefined,
    },
    {
      id: 'settings',
      label: 'الإعدادات وهوية الشعار',
      icon: Settings,
      badge: undefined,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden no-print"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 right-0 z-50 w-72 bg-white border-l border-slate-200/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 no-print ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Top Header & Logo */}
        <div>
          <div className="p-5 border-b border-slate-200/80 flex items-center justify-between">
            <AppLogo size="md" showText={true} logoUrl={settings.logoUrl || '/logo.jpg'} />
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Currency SAR/ETB Callout in Sidebar */}
        <div className="px-3 pb-2 space-y-2">
          <button
            onClick={() => {
              onOpenCurrencyConverter();
              onClose();
            }}
            className="w-full flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl text-slate-800 transition-colors cursor-pointer text-xs"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">🇸🇦🇪🇹</span>
              <div className="text-right">
                <div className="font-bold text-[11px]">تحويل العملات وفارق الصرف</div>
                <div className="text-[10px] text-slate-500 font-mono">1 ر.س = {exchangeRateSarToEtb} ETB</div>
              </div>
            </div>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
              تعديل
            </span>
          </button>

          {/* Backup Callout in Sidebar */}
          <button
            onClick={() => {
              onOpenBackup();
              onClose();
            }}
            className="w-full flex items-center justify-between p-3 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 rounded-2xl text-emerald-900 transition-colors cursor-pointer text-xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                <Database className="w-3.5 h-3.5" />
              </div>
              <div className="text-right">
                <div className="font-bold">النسخ الاحتياطي (JSON)</div>
                <div className="text-[10px] text-emerald-700">تنزيل واستعادة البيانات</div>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded-md">
              حفظ
            </span>
          </button>
        </div>

        {/* Bottom Profile Footer */}
        <div className="p-4 border-t border-slate-200/80 bg-slate-50/50 m-3 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 p-0.5 overflow-hidden shrink-0 flex items-center justify-center">
              <img
                src={settings.logoUrl || '/logo.jpg'}
                alt="شعار جهاد أحمد"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-slate-900 truncate">
                {settings.companyName}
              </div>
              <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>نظام محاسبي معتمد</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
