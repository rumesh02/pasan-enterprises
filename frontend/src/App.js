import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ViewInventory from './pages/ViewInventory';
import SellItem from './pages/SellItem';
import PastOrders from './pages/PastOrders';
import AddInventory from './pages/AddInventory';
import Customers from './pages/Customers';
import Login from './pages/auth/Login';
import { userAPI } from './services/apiService';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add loading state for initial auth check
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const checkAuthAndFetchUser = async () => {
      // Check authentication state on mount
      const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
      const authToken = sessionStorage.getItem('authToken');
      const storedUser = sessionStorage.getItem('user');
      
      if (isLoggedIn && authToken) {
        try {
          // First, use stored user data if available
          if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
          }
          
          setIsAuthenticated(true);
          
          // Then try to fetch fresh user data from API
          try {
            const response = await userAPI.getCurrentUser();
            if (response.data.success) {
              setCurrentUser(response.data.data);
            }
          } catch (apiError) {
            console.warn('Could not fetch fresh user data on startup:', apiError);
            // Keep using stored user data, don't logout unless stored data is also missing
            if (!storedUser) {
              handleLogout();
            }
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          handleLogout();
        }
      } else {
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    };
    
    checkAuthAndFetchUser();
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
    // Clear all storage items (both sessionStorage and localStorage for cleanup)
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn'); // cleanup old localStorage data
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userEmail'); // legacy cleanup
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  // Provide a function to be called by Login on success.
  const handleLoginSuccess = async () => {
    try {
      // First, try to get user data from sessionStorage (set by authService)
      const storedUser = sessionStorage.getItem('user');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
      
      setIsAuthenticated(true);
      
      // Optionally fetch fresh user data from API
      try {
        const response = await userAPI.getCurrentUser();
        if (response.data.success) {
          setCurrentUser(response.data.data);
        }
      } catch (apiError) {
        console.warn('Could not fetch fresh user data:', apiError);
        // Keep using stored user data
      }
    } catch (error) {
      console.error('Failed in login success handler:', error);
      setIsAuthenticated(true); // Still authenticate even if user setup fails
    }
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
      <Login onLogin={handleLoginSuccess} />
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
              <div className="flex items-center space-x-3">
                {currentUser && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm text-slate-600 font-medium">
                       {currentUser.fullName || currentUser.username}
                    </span>
                  </div>
                )}
                
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-sm font-medium transition-colors"
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
