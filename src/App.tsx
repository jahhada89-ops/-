import React, { useState } from 'react';
import { AccountingProvider } from './context/AccountingContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { FinancialDashboard } from './components/dashboard/FinancialDashboard';
import { ExpensesView } from './components/expenses/ExpensesView';
import { FinancialReportsView } from './components/reports/FinancialReportsView';
import { InvoicesView } from './components/invoices/InvoicesView';
import { JournalView } from './components/journal/JournalView';
import { ChartOfAccountsView } from './components/accounts/ChartOfAccountsView';
import { ContactsView } from './components/contacts/ContactsView';
import { SettingsView } from './components/settings/SettingsView';
import { AddIncomeModal } from './components/income/AddIncomeModal';
import { BackupModal } from './components/backup/BackupModal';
import { CurrencyConverterModal } from './components/common/CurrencyConverterModal';

const MainContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isCurrencyConverterOpen, setIsCurrencyConverterOpen] = useState(false);

  const handleOpenAddExpense = () => {
    setCurrentTab('expenses');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans" dir="rtl">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenBackup={() => setIsBackupOpen(true)}
        onOpenCurrencyConverter={() => setIsCurrencyConverterOpen(true)}
      />

      {/* Main Content Area */}
      <div className="lg:pr-72 flex-1 flex flex-col min-w-0">
        <Navbar
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onNavigate={setCurrentTab}
          onOpenAddExpense={handleOpenAddExpense}
          onOpenAddIncome={() => setIsAddIncomeOpen(true)}
          onOpenBackup={() => setIsBackupOpen(true)}
          onOpenCurrencyConverter={() => setIsCurrencyConverterOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <FinancialDashboard
              onNavigate={setCurrentTab}
              onOpenAddExpense={handleOpenAddExpense}
              onOpenAddIncome={() => setIsAddIncomeOpen(true)}
            />
          )}

          {currentTab === 'expenses' && <ExpensesView />}

          {currentTab === 'reports' && <FinancialReportsView />}

          {currentTab === 'invoices' && <InvoicesView />}

          {currentTab === 'journal' && <JournalView />}

          {currentTab === 'accounts' && <ChartOfAccountsView />}

          {currentTab === 'contacts' && <ContactsView />}

          {currentTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Quick Add Income Modal */}
      <AddIncomeModal
        isOpen={isAddIncomeOpen}
        onClose={() => setIsAddIncomeOpen(false)}
      />

      {/* Database JSON Backup & Recovery Modal */}
      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
      />

      {/* SAR / ETB Currency Converter & Exchange Difference Modal */}
      <CurrencyConverterModal
        isOpen={isCurrencyConverterOpen}
        onClose={() => setIsCurrencyConverterOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AccountingProvider>
      <MainContent />
    </AccountingProvider>
  );
}
