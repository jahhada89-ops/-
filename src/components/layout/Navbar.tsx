import React, { useState } from 'react';
import { useAccounting } from '../../context/AccountingContext';
import { formatCurrency } from '../../utils/formatters';
import { AppLogo } from '../common/AppLogo';
import {
  Menu,
  Plus,
  Bell,
  Search,
  Wallet,
  Building,
  DollarSign,
  FileText,
  BookOpen,
  Database,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  onNavigate: (tab: string) => void;
  onOpenAddExpense: () => void;
  onOpenAddIncome: () => void;
  onOpenBackup: () => void;
  onOpenCurrencyConverter: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  onNavigate,
  onOpenAddExpense,
  onOpenAddIncome,
  onOpenBackup,
  onOpenCurrencyConverter,
}) => {
  const {
    settings,
    accounts,
    displayCurrencyMode,
    setDisplayCurrencyMode,
    exchangeRateSarToEtb,
    formatAmount,
  } = useAccounting();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Calculate available liquid funds in base currency (SAR)
  const liquidCashSAR = accounts
    .filter((a) => a.type === 'asset' && a.category === 'current_asset')
    .reduce((sum, a) => sum + (a.id === 'acc_101' || a.id === 'acc_102' ? a.balance : 0), 0);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 no-print">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left: Mobile Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            aria-label="القائمة"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo prominently in Header */}
          <div
            onClick={() => onNavigate('dashboard')}
            className="cursor-pointer transition-transform hover:scale-101"
          >
            <AppLogo size="md" showText={true} logoUrl={settings.logoUrl || '/logo.jpg'} />
          </div>
        </div>

        {/* Right: Currency Switcher & Liquidity & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Exchange Rate & Currency Converter Trigger */}
          <button
            onClick={onOpenCurrencyConverter}
            className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/90 text-emerald-900 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
            title="حاسبة تحويل العملات وفارق سعر الصرف"
          >
            <span className="text-sm">🇸🇦🇪🇹</span>
            <span className="hidden md:inline font-mono">
              1 ر.س = {exchangeRateSarToEtb} ETB
            </span>
            <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-md font-semibold">
              {displayCurrencyMode === 'dual' ? 'العملتان' : displayCurrencyMode === 'ETB' ? 'ETB' : 'SAR'}
            </span>
          </button>

          {/* Liquidity Pill */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-500">السيولة:</span>
            <span className="font-extrabold text-slate-900">
              {formatAmount(liquidCashSAR)}
            </span>
          </div>

          {/* Backup Button */}
          <button
            onClick={onOpenBackup}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
            title="تنزيل نسخة احتياطية للبيانات JSON"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">نسخ احتياطي JSON</span>
          </button>

          {/* Quick Actions Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 sm:px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">إجراء سريع</span>
            </button>

            {isQuickAddOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsQuickAddOpen(false)}
                />
                <div className="absolute left-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-xs animate-in fade-in zoom-in-95">
                  <button
                    onClick={() => {
                      setIsQuickAddOpen(false);
                      onOpenAddExpense();
                    }}
                    className="w-full text-right px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2.5 font-medium cursor-pointer"
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>تسجيل مصروف جديد</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsQuickAddOpen(false);
                      onOpenAddIncome();
                    }}
                    className="w-full text-right px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2.5 font-medium cursor-pointer"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>تسجيل إيراد مالي</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsQuickAddOpen(false);
                      onNavigate('invoices');
                    }}
                    className="w-full text-right px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2.5 font-medium cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-500" />
                    <span>إنشاء فاتورة ضريبية</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsQuickAddOpen(false);
                      onNavigate('journal');
                    }}
                    className="w-full text-right px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2.5 font-medium cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                    <span>قيد يومية متوازن</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
