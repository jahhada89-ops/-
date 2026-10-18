import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';

interface BarChartItem {
  label: string;
  income: number;
  expense: number;
  net?: number;
}

interface BarChartProps {
  data: BarChartItem[];
  currency?: string;
  height?: number;
}

export const BarChart: React.FC<BarChartProps> = ({ data, currency = 'SAR', height = 260 }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-slate-400">
        لا توجد بيانات كافية لعرض الرسم البياني
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => Math.max(d.income, d.expense)), 100);
  const chartHeight = height - 60;

  return (
    <div className="w-full">
      <div className="relative pt-6 pb-2" style={{ height }}>
        {/* Tooltip */}
        {hoveredIdx !== null && data[hoveredIdx] && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-xl pointer-events-none">
            <span className="font-semibold">{data[hoveredIdx].label}</span>
            <span className="text-emerald-400">
              الدخل: {formatCurrency(data[hoveredIdx].income, currency)}
            </span>
            <span className="text-rose-400">
              المصروف: {formatCurrency(data[hoveredIdx].expense, currency)}
            </span>
          </div>
        )}

        {/* Grid lines */}
        <div className="absolute inset-x-0 bottom-10 top-8 flex flex-col justify-between pointer-events-none opacity-20">
          <div className="border-b border-dashed border-slate-400 w-full" />
          <div className="border-b border-dashed border-slate-400 w-full" />
          <div className="border-b border-dashed border-slate-400 w-full" />
        </div>

        {/* Bars Container */}
        <div className="relative flex items-end justify-between gap-2 sm:gap-4 h-[calc(100%-40px)] px-2">
          {data.map((item, idx) => {
            const incomeHeight = Math.max(4, (item.income / maxVal) * chartHeight);
            const expenseHeight = Math.max(4, (item.expense / maxVal) * chartHeight);
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="group flex-1 flex flex-col items-center justify-end h-full cursor-pointer transition-all"
              >
                <div className="flex items-end justify-center gap-1 sm:gap-2 w-full max-w-[64px] h-full">
                  {/* Income bar */}
                  <div
                    style={{ height: `${incomeHeight}px` }}
                    className={`w-1/2 rounded-t-md transition-all duration-300 ${
                      isHovered ? 'bg-emerald-600 shadow-lg shadow-emerald-500/20' : 'bg-emerald-500 hover:bg-emerald-600'
                    }`}
                  />
                  {/* Expense bar */}
                  <div
                    style={{ height: `${expenseHeight}px` }}
                    className={`w-1/2 rounded-t-md transition-all duration-300 ${
                      isHovered ? 'bg-rose-600 shadow-lg shadow-rose-500/20' : 'bg-rose-500 hover:bg-rose-600'
                    }`}
                  />
                </div>

                {/* X-axis label */}
                <span
                  className={`mt-2 text-[11px] truncate max-w-full text-center transition-colors ${
                    isHovered ? 'text-slate-900 font-semibold' : 'text-slate-500'
                  }`}
                  title={item.label}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-1 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-emerald-500" />
          <span>إجمالي الدخل</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-rose-500" />
          <span>إجمالي النفقات والمصاريف</span>
        </div>
      </div>
    </div>
  );
};

interface DonutChartItem {
  categoryName: string;
  color: string;
  amount: number;
  percentage: number;
}

interface DonutChartProps {
  data: DonutChartItem[];
  currency?: string;
  totalAmount: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({ data, currency = 'SAR', totalAmount }) => {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  if (!data || data.length === 0 || totalAmount === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-slate-400">
        لا توجد مصاريف مسجلة في هذه الفترة
      </div>
    );
  }

  // Calculate SVG stroke dashes for circle
  const size = 180;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativeOffset = 0;
  const segments = data.map((item) => {
    const fraction = item.amount / totalAmount;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -cumulativeOffset;
    cumulativeOffset += fraction * circumference;
    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const activeItem = activeIdx !== null ? data[activeIdx] : null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
      {/* Circle SVG */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90 transition-transform duration-500"
        >
          {/* Base circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          {segments.map((seg, i) => (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={seg.color}
              strokeWidth={activeIdx === i ? strokeWidth + 4 : strokeWidth}
              strokeDasharray={seg.strokeDasharray}
              strokeDashoffset={seg.strokeDashoffset}
              strokeLinecap="round"
              className="cursor-pointer transition-all duration-300"
              onMouseEnter={() => setActiveIdx(i)}
              onMouseLeave={() => setActiveIdx(null)}
            />
          ))}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          <span className="text-[11px] text-slate-500 font-medium">
            {activeItem ? activeItem.categoryName : 'إجمالي المصاريف'}
          </span>
          <span className="text-sm font-bold text-slate-900 tracking-tight">
            {activeItem
              ? formatCurrency(activeItem.amount, currency)
              : formatCurrency(totalAmount, currency)}
          </span>
          {activeItem && (
            <span className="text-[11px] font-semibold text-emerald-600">
              {activeItem.percentage}%
            </span>
          )}
        </div>
      </div>

      {/* Legend list */}
      <div className="flex-1 w-full space-y-2 max-h-56 overflow-y-auto pr-1">
        {data.map((item, idx) => (
          <div
            key={idx}
            onMouseEnter={() => setActiveIdx(idx)}
            onMouseLeave={() => setActiveIdx(null)}
            className={`flex items-center justify-between p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
              activeIdx === idx ? 'bg-slate-100 font-semibold' : 'hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate">{item.categoryName}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-slate-900 font-medium">
                {formatCurrency(item.amount, currency)}
              </span>
              <span className="text-slate-400 text-[10px] w-8 text-left">
                {item.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface BudgetProgressBarProps {
  spent: number;
  budget: number;
  currency?: string;
  categoryName: string;
  color?: string;
  onEditBudget?: () => void;
}

export const BudgetProgressBar: React.FC<BudgetProgressBarProps> = ({
  spent,
  budget,
  currency = 'SAR',
  categoryName,
  color = '#3B82F6',
  onEditBudget,
}) => {
  const percentage = budget > 0 ? Math.round((spent / budget) * 100) : 0;
  const isOver = spent > budget;
  const isNear = percentage >= 80 && !isOver;

  let progressColor = color;
  if (isOver) {
    progressColor = '#EF4444'; // Red
  } else if (isNear) {
    progressColor = '#F59E0B'; // Amber
  }

  const remaining = budget - spent;

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: color }}
          />
          <h4 className="text-sm font-bold text-slate-800">{categoryName}</h4>
        </div>
        {onEditBudget && (
          <button
            onClick={onEditBudget}
            className="text-xs text-slate-500 hover:text-slate-800 underline decoration-slate-300 hover:decoration-slate-800 transition-colors"
          >
            تعديل الميزانية
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(percentage, 100)}%`,
            backgroundColor: progressColor,
          }}
        />
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between text-xs text-slate-600">
        <div>
          <span>المصروف: </span>
          <span className="font-semibold text-slate-900">{formatCurrency(spent, currency)}</span>
          <span className="text-slate-400 mx-1">/</span>
          <span>الميزانية: </span>
          <span className="font-medium text-slate-700">{formatCurrency(budget, currency)}</span>
        </div>

        <div className="text-left font-medium">
          {isOver ? (
            <span className="text-rose-600 font-bold">
              تجاوز بـ {formatCurrency(Math.abs(remaining), currency)} ({percentage}%)
            </span>
          ) : (
            <span className={isNear ? 'text-amber-600' : 'text-emerald-600'}>
              متبقي: {formatCurrency(remaining, currency)} ({100 - percentage}%)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
