import React, { useState } from 'react';
import { useAccounting } from '../../context/AccountingContext';
import { formatCurrency } from '../../utils/formatters';
import {
  ArrowRightLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Percent,
  CheckCircle,
  X,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface CurrencyConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CurrencyConverterModal: React.FC<CurrencyConverterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    exchangeRateSarToEtb,
    setExchangeRateSarToEtb,
    displayCurrencyMode,
    setDisplayCurrencyMode,
    convertSarToEtb,
    convertEtbToSar,
  } = useAccounting();

  // Exchange Rate Setting
  const [rateInput, setRateInput] = useState(String(exchangeRateSarToEtb));
  const [rateSaved, setRateSaved] = useState(false);

  // Conversion inputs
  const [sarInput, setSarInput] = useState<string>('1000');
  const [etbInput, setEtbInput] = useState<string>(String(1000 * exchangeRateSarToEtb));

  // Difference calculator
  const [baseAmount, setBaseAmount] = useState<string>('5000');
  const [actualRate, setActualRate] = useState<string>(String(exchangeRateSarToEtb + 1.2));

  if (!isOpen) return null;

  const handleSarChange = (val: string) => {
    setSarInput(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setEtbInput((num * exchangeRateSarToEtb).toFixed(2));
    } else {
      setEtbInput('');
    }
  };

  const handleEtbChange = (val: string) => {
    setEtbInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && exchangeRateSarToEtb > 0) {
      setSarInput((num / exchangeRateSarToEtb).toFixed(2));
    } else {
      setSarInput('');
    }
  };

  const handleSaveRate = (e: React.FormEvent) => {
    e.preventDefault();
    const newR = parseFloat(rateInput);
    if (!isNaN(newR) && newR > 0) {
      setExchangeRateSarToEtb(newR);
      setRateSaved(true);
      if (sarInput) {
        setEtbInput((parseFloat(sarInput) * newR).toFixed(2));
      }
      setTimeout(() => setRateSaved(false), 2500);
    }
  };

  // Exchange difference calculations
  const parsedBase = parseFloat(baseAmount) || 0;
  const parsedActualRate = parseFloat(actualRate) || exchangeRateSarToEtb;
  const standardEtb = parsedBase * exchangeRateSarToEtb;
  const actualEtb = parsedBase * parsedActualRate;
  const diffInEtb = actualEtb - standardEtb;
  const diffInSar = exchangeRateSarToEtb > 0 ? diffInEtb / exchangeRateSarToEtb : 0;
  const isGain = diffInEtb >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">الريال السعودي والبير الإثيوبي (SAR / ETB)</h3>
                <span className="text-[10px] bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                  حساب الصرف التلقائي
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                ضبط سعر الصرف وتحويل العملات وحساب فروق أسعار الصرف آلياً
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs">
          {/* Section 1: Display Mode Switcher */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <span className="font-bold text-slate-800 block">طريقة عرض العملات في النظام:</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setDisplayCurrencyMode('SAR')}
                className={`py-2 px-3 rounded-xl font-bold transition-all cursor-pointer text-center ${
                  displayCurrencyMode === 'SAR'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                🇸🇦 ريال سعودي (SAR)
              </button>
              <button
                onClick={() => setDisplayCurrencyMode('ETB')}
                className={`py-2 px-3 rounded-xl font-bold transition-all cursor-pointer text-center ${
                  displayCurrencyMode === 'ETB'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                🇪🇹 بير إثيوبي (ETB)
              </button>
              <button
                onClick={() => setDisplayCurrencyMode('dual')}
                className={`py-2 px-3 rounded-xl font-bold transition-all cursor-pointer text-center ${
                  displayCurrencyMode === 'dual'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                🔄 العملتان معاً (Dual)
              </button>
            </div>
          </div>

          {/* Section 2: Set Exchange Rate */}
          <form onSubmit={handleSaveRate} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <span>سعر الصرف المعتمد (1 ريال سعودي = بر إثيوبي)</span>
              </span>
              {rateSaved && (
                <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 animate-in fade-in">
                  <CheckCircle className="w-3.5 h-3.5" />
                  تم تحديث السعر
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={rateInput}
                  onChange={(e) => setRateInput(e.target.value)}
                  className="w-full font-bold text-base px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                  ETB
                </span>
              </div>
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-bold transition-colors cursor-pointer shrink-0"
              >
                حفظ سعر الصرف
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              يُطبق هذا السعر في التحويل التلقائي في كافة الفواتير والقيود والمصاريف والتقارير المالية.
            </p>
          </form>

          {/* Section 3: Interactive Live Converter */}
          <div className="border border-emerald-200 bg-emerald-50/40 rounded-2xl p-4 space-y-3">
            <span className="font-bold text-slate-900 block">محول العملات الفوري السريع:</span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  المبلغ بالريال السعودي (SAR)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={sarInput}
                    onChange={(e) => handleSarChange(e.target.value)}
                    className="w-full font-bold text-slate-900 text-sm px-3.5 py-2 bg-white border border-slate-200 rounded-xl"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                    ر.س
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  المعادل بالبر الإثيوبي (ETB)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={etbInput}
                    onChange={(e) => handleEtbChange(e.target.value)}
                    className="w-full font-bold text-emerald-700 text-sm px-3.5 py-2 bg-white border border-slate-200 rounded-xl"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                    ETB
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Exchange Rate Difference & Variance Calculator */}
          <div className="border border-slate-200 bg-white rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-blue-600" />
                <span>حساب فارق سعر الصرف (Exchange Rate Variance)</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">
                  مبلغ العملية بالريال (SAR)
                </label>
                <input
                  type="number"
                  value={baseAmount}
                  onChange={(e) => setBaseAmount(e.target.value)}
                  className="w-full font-semibold px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 mb-1">
                  سعر الصرف الفعلي للعملية
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={actualRate}
                  onChange={(e) => setActualRate(e.target.value)}
                  className="w-full font-semibold px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>
            </div>

            {/* Calculated Difference Results */}
            <div className="bg-slate-50 p-3 rounded-xl space-y-1.5 border border-slate-100">
              <div className="flex justify-between text-slate-600">
                <span>القيمة بالسعر المعتمد ({exchangeRateSarToEtb} ETB):</span>
                <span className="font-bold">{formatCurrency(standardEtb, 'ETB')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>القيمة بسعر العملية الفعلي ({parsedActualRate} ETB):</span>
                <span className="font-bold text-slate-900">{formatCurrency(actualEtb, 'ETB')}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold">
                <span className="flex items-center gap-1">
                  {isGain ? (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                  )}
                  <span>فارق الصرف الناتج:</span>
                </span>
                <span className={isGain ? 'text-emerald-700' : 'text-rose-700'}>
                  {formatCurrency(Math.abs(diffInEtb), 'ETB')} (يعادل {formatCurrency(Math.abs(diffInSar), 'SAR')})
                  <span className="mr-1 text-[10px]">{isGain ? 'فارق إيجابي' : 'فارق سالب'}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 cursor-pointer"
          >
            تم وإغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
