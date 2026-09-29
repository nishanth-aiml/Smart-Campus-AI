import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import NewRequestPage from './pages/NewRequestPage';
import AISuggestionsPage from './pages/AISuggestionsPage';
import AnalyticsPage from './pages/AnalyticsPage';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [evaluatedRequest, setEvaluatedRequest] = useState(null);

  const tabTitles = {
    'dashboard': 'Campus Facility Dashboard',
    'new-request': 'New Allocation Request',
    'suggestions': 'AI Facility Allocation Suggestions',
    'analytics': 'Resource & Demand Analytics'
  };

  const handleRequestSubmitSuccess = (data) => {
    setEvaluatedRequest(data);
    setCurrentTab('suggestions');
  };

  const handleAllocationSuccess = () => {
    setCurrentTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Collapsible Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        pendingCount={evaluatedRequest ? 1 : 0}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header
          setIsSidebarOpen={setIsSidebarOpen}
          onNewRequestClick={() => setCurrentTab('new-request')}
          activeTabTitle={tabTitles[currentTab] || 'Smart Campus'}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardPage onNavigateToNewRequest={() => setCurrentTab('new-request')} />
          )}

          {currentTab === 'new-request' && (
            <NewRequestPage onSubmitSuccess={handleRequestSubmitSuccess} />
          )}

          {currentTab === 'suggestions' && (
            <AISuggestionsPage
              requestData={evaluatedRequest}
              suggestions={evaluatedRequest?.analysisResult?.suggestions}
              audit={evaluatedRequest?.analysisResult?.audit}
              onEditRequest={() => setCurrentTab('new-request')}
              onAllocationSuccess={handleAllocationSuccess}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsPage />
          )}
        </main>
      </div>
    </div>
  );
}
