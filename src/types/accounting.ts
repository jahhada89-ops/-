export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';

export type AccountCategory = 
  | 'current_asset'        // أصول متداولة (صندوق، بنك، عملاء، مخزون)
  | 'fixed_asset'          // أصول ثابتة (معدات، سيارات، أثاث)
  | 'current_liability'    // التزامات متداولة (موردون، ضرائب مستحقة)
  | 'long_term_liability'  // التزامات طويلة الأجل (قروض)
  | 'equity'               // حقوق ملكية (رأس مال، أرباح مرحلة)
  | 'operating_revenue'    // إيرادات تشغيلية (مبيعات، خدمات)
  | 'other_revenue'        // إيرادات أخرى
  | 'operating_expense'    // مصروفات تشغيلية (إيجار، رواتب، مرافق)
  | 'cost_of_sales';       // تكلفة المبيعات / بضاعة

export interface Account {
  id: string;
  code: string;            // رمز الحساب (101, 102, ...)
  name: string;            // اسم الحساب بالعربية
  nameEn?: string;
  type: AccountType;
  category: AccountCategory;
  categoryNameAr: string;
  balance: number;         // الرصيد الحالي
  description?: string;
  isSystem?: boolean;      // حساب أساسي
  parentId?: string;
}

export type CashFundType = 'main_treasury' | 'petty_cash' | 'branch_fund' | 'pos_counter' | 'emergency_fund' | 'foreign_currency';

export interface CashFund {
  id: string;
  accountId: string;          // الحساب المحاسبي المقابل في شجرة الحسابات
  code: string;               // كود الصندوق (مثلاً: 1011، 1012)
  name: string;               // اسم الصندوق المالي
  fundType: CashFundType;     // نوع الصندوق
  fundTypeNameAr: string;
  custodianName: string;      // أمين الصندوق / العهدة
  custodianPhone?: string;    // هاتف المسؤول
  branch: string;             // الفرع أو المقر
  currency: CurrencyCode;     // SAR أو ETB
  balance: number;            // الرصيد الفعلي الحالي بالريال السعودي
  minThreshold?: number;      // الحد الأدنى للسيولة للتنبيه عند نقص النقدية
  maxLimit?: number;          // الحد الأقصى لسقف النقدية المسموح به
  status: 'active' | 'suspended';
  description?: string;
  createdAt: string;
}

export interface FundTransfer {
  id: string;
  transferNumber: string;     // TR-2026-001
  date: string;               // YYYY-MM-DD
  fromFundId: string;
  fromFundName: string;
  toFundId: string;
  toFundName: string;
  amount: number;             // المبلغ بالريال السعودي
  amountEtb?: number;         // المعادل بالبر الإثيوبي
  notes?: string;
  recordedBy?: string;
  createdAt: string;
}

export interface FundVoucher {
  id: string;
  voucherNumber: string;      // VOU-2026-001
  type: 'receipt' | 'payment'; // سند قبض (توريد) أم سند صرف
  fundId: string;
  fundName: string;
  amount: number;
  amountEtb?: number;
  partyName: string;          // المستلم أو المورد
  reason: string;             // البيان / سبب الصرف أو التوريد
  date: string;
  receivedBy: string;         // المستلم / أمين الصندوق
  createdAt: string;
}

export interface JournalLine {
  id: string;
  accountId: string;
  accountName: string;
  accountCode: string;
  debit: number;           // مدين
  credit: number;          // دائن
  memo?: string;           // بيان السطر
}

export interface JournalEntry {
  id: string;
  entryNumber: string;     // رقم القيد مثل JE-001
  date: string;            // تاريخ القيد YYYY-MM-DD
  description: string;     // البيان العام للقيد
  reference?: string;      // رقم مرجعي أو رقم الفاتورة المرتبطة
  lines: JournalLine[];
  totalDebit: number;
  totalCredit: number;
  status: 'posted' | 'draft';
  createdAt: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;            // اسم الفئة مثل: الطعام، النقل، الترفيه، الإيجار...
  icon: string;            // اسم الأيقونة في Lucide
  color: string;           // كود لون الفئة للرسوم البيانية
  monthlyBudget: number;   // مبلغ الميزانية المحدد لهذه الفئة
}

export interface Expense {
  id: string;
  title: string;           // وصف أو عنوان النفقة
  amount: number;          // المبلغ بالريال السعودي (العملة الأساسية)
  currency?: CurrencyCode; // العملة المسجلة بها (SAR أو ETB)
  originalAmount?: number; // المبلغ بالعملة الأصلية إذا كانت بر إثيوبي
  exchangeRate?: number;   // سعر الصرف المستخدم وقت العملية
  exchangeDiff?: number;   // فارق الصرف
  categoryId: string;      // تصنيف النفقة (طعام، نقل، ترفيه، ...)
  categoryName: string;
  date: string;            // تاريخ النفقة YYYY-MM-DD
  paymentMethod: 'cash' | 'bank' | 'card'; // طريقة الدفع
  paidFromAccountId: string; // الحساب المدفوع منه (الصندوق، البنك)
  vendorName?: string;     // الجهة / المورد
  receiptNumber?: string;  // رقم الإيصال / الفاتورة
  notes?: string;          // ملاحظات
  createdAt: string;
}

export interface Income {
  id: string;
  title: string;           // عنوان الإيراد
  amount: number;          // المبلغ بالريال السعودي
  currency?: CurrencyCode; // العملة المسجلة بها (SAR أو ETB)
  originalAmount?: number; // المبلغ بالعملة الأصلية إذا كانت بر إثيوبي
  exchangeRate?: number;   // سعر الصرف وقت الإيداع
  exchangeDiff?: number;   // فارق الصرف
  category: string;        // مبيعات، استشارات، خدمات، إيرادات أخرى
  date: string;            // YYYY-MM-DD
  paymentMethod: 'cash' | 'bank';
  depositAccountId: string;
  customerName?: string;
  notes?: string;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;        // مبلغ الخصم
  taxRate: number;         // نسبة الضريبة المئوية مثلاً 15
  taxAmount: number;       // مبلغ الضريبة
  subtotal: number;        // المجموع قبل الضريبة
  total: number;           // المجموع الكلي مع الضريبة
}

export type InvoiceType = 'sale' | 'purchase'; // فاتورة مبيعات أو فاتورة مشتريات
export type InvoiceStatus = 'paid' | 'partial' | 'unpaid' | 'overdue';

export interface InvoicePayment {
  id: string;
  invoiceId: string;
  date: string;
  amount: number;
  paymentMethod: 'cash' | 'bank';
  paymentAccountId: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  type: InvoiceType;
  currency?: CurrencyCode; // العملة الأساسية للفاتورة (SAR أو ETB)
  exchangeRate?: number;   // سعر الصرف المستخدم (SAR to ETB)
  grandTotalEtb?: number;  // الإجمالي المعادل بالبر الإثيوبي
  partyId: string;
  partyName: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  paidAmount: number;
  status: InvoiceStatus;
  notes?: string;
  paymentMethod: 'cash' | 'bank' | 'credit';
  paymentAccountId?: string;
  payments: InvoicePayment[];
  createdAt: string;
  remindersCount?: number;     // عدد التذكيرات المرسلة
  lastReminderDate?: string;   // تاريخ آخر تذكير تم إرساله
  snoozeUntil?: string;        // تمديد أو تأجيل الاستحقاق حتى تاريخ
  reminderNotes?: string;      // ملاحظات التذكير والتواصل
}

export type ReminderUrgency = 'overdue' | 'due_today' | 'due_soon';

export interface InvoiceReminderAlert {
  invoice: Invoice;
  partyName: string;
  partyType: 'client' | 'vendor';
  contactPhone?: string;
  contactEmail?: string;
  daysDiff: number;            // سالب = متأخر بعدد الأيام، صفر = مستحق اليوم، موجب = يستحق خلال أيام
  urgency: ReminderUrgency;
  remainingSar: number;
  remainingEtb: number;
  statusLabel: string;
  actionType: 'collect' | 'pay'; // تحصيل من العميل أم سداد للمورد
}

export interface Contact {
  id: string;
  name: string;
  type: 'client' | 'vendor' | 'both';
  phone: string;
  email: string;
  taxNumber?: string;
  commercialNumber?: string;
  address?: string;
  city?: string;
  currentBalance: number;  // رصيد الحساب (مدين موجب / دائن سالب)
  createdAt: string;
}

export type CurrencyCode = 'SAR' | 'ETB';
export type DisplayCurrencyMode = 'SAR' | 'ETB' | 'dual';

export interface BusinessSettings {
  companyName: string;
  commercialRegister: string;
  taxNumber: string;
  currency: string;
  currencySymbol: string;
  exchangeRateSarToEtb: number; // سعر الصرف: كم بر إثيوبي لكل 1 ريال سعودي
  displayCurrencyMode: DisplayCurrencyMode;
  defaultTaxRate: number;
  phone: string;
  email: string;
  address: string;
  logoUrl?: string;
  fiscalYearStart: string;
  defaultCashAccountId: string;
  defaultBankAccountId: string;
}

export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export interface FinancialSummaryPeriod {
  periodLabel: string;
  startDate: string;
  endDate: string;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  expenseByCategory: { [categoryId: string]: number };
}
