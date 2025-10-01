import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ViewInventory from './pages/ViewInventory';
import SellItem from './pages/SellItem';
import PastOrders from './pages/PastOrders';
import AddInventory from './pages/AddInventory';
import Customers from './pages/Customers';
import Login from './pages/auth/Login';
import authService from './services/authService';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add loading state for initial auth check

  useEffect(() => {
    // Check authentication state on mount
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsAuthenticated(isLoggedIn);
    setIsLoading(false);
  }, []);

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'view-inventory':
        return <ViewInventory />;
      case 'sell-item':
        return <SellItem />;
      case 'past-orders':
        return <PastOrders />;
      case 'add-inventory':
        return <AddInventory />;
      case 'customers':
        return <Customers />;
      default:
        return <Dashboard />;
    }
  };

  const handleLogout = () => {
    // Clear localStorage items
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    setIsAuthenticated(false);
    setActiveTab('dashboard');
  };

  // Provide a function to be called by Login on success.
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-xl text-slate-600">Loading...</div>
      </div>
    );
  }

  // If not authenticated, show Login centered on the screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Pass onLogin prop — your Login component should call props.onLogin() after successful authentication */}
        <Login onLogin={handleLoginSuccess} />
      </div>
    );
  }

  // Authenticated app layout
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200/50 px-8 py-5">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Inventory Management System
            </h1>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-slate-600 font-medium">Online</span>
              </div>

              <div className="flex items-center space-x-3">
                {/* You can replace with avatar / user name */}
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
