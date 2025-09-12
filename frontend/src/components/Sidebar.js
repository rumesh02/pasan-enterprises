import React, { useState } from 'react';
import { 
  ChartBarIcon, 
  EyeIcon, 
  ShoppingCartIcon, 
  ClockIcon, 
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon 
} from '@heroicons/react/24/outline';

const Sidebar = ({ isCollapsed, setIsCollapsed, activeTab, setActiveTab }) => {

  const menuItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: ChartBarIcon,
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      id: 'view-inventory',
      name: 'View Inventory',
      icon: EyeIcon,
      gradient: 'from-green-500 to-green-600',
    },
    {
      id: 'sell-item',
      name: 'Sell Item',
      icon: ShoppingCartIcon,
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      id: 'past-orders',
      name: 'Past Orders',
      icon: ClockIcon,
      gradient: 'from-orange-500 to-orange-600',
    },
    {
      id: 'add-inventory',
      name: 'Add Inventory',
      icon: PlusIcon,
      gradient: 'from-teal-500 to-teal-600',
    },
  ];

  return (
    <div className={`bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 flex flex-col h-screen shadow-2xl border-r border-slate-700/50 ${
      isCollapsed ? 'w-20' : 'w-72'
    }`}>
      {/* Header with Company Logo and Name */}
      <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src="/images/logo2.png" 
              alt="Pasan Enterprises Logo" 
              className="w-12 h-12 object-contain"
            />
            {!isCollapsed && (
              <div className="transition-opacity duration-300">
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Pasan Enterprises
                </h1>
                <p className="text-sm text-slate-400 font-medium">Inventory Management</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-200 border border-slate-600/50 hover:border-slate-500/50 backdrop-blur-sm hover:shadow-lg"
            >
              <ChevronLeftIcon className="w-5 h-5 text-slate-300" />
            </button>
          )}
        </div>
        {isCollapsed && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-200 border border-slate-600/50 hover:border-slate-500/50 backdrop-blur-sm hover:shadow-lg"
            >
              <ChevronRightIcon className="w-5 h-5 text-slate-300" />
            </button>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-3">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`group w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-4'} py-3 text-left transition-all duration-200 rounded-xl relative overflow-hidden ${
                    isActive 
                      ? 'bg-gradient-to-r ' + item.gradient + ' shadow-lg shadow-blue-500/25 scale-105' 
                      : 'hover:bg-slate-800/50 hover:scale-105 hover:shadow-md'
                  }`}
                  title={isCollapsed ? item.name : ''}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-xl"></div>
                  )}
                  <div className={`relative flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
                    <div className={`p-2 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'bg-white/20 shadow-lg' 
                        : 'group-hover:bg-slate-700/50'
                    }`}>
                      <IconComponent className={`w-5 h-5 transition-all duration-200 ${
                        isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'
                      }`} />
                    </div>
                    {!isCollapsed && (
                      <span className={`ml-4 text-sm font-medium transition-all duration-200 ${
                        isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'
                      }`}>
                        {item.name}
                      </span>
                    )}
                  </div>
                  {isActive && !isCollapsed && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-white rounded-full opacity-75"></div>
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700/50 bg-gradient-to-r from-slate-800/30 to-slate-900/30 backdrop-blur-sm">
        {!isCollapsed ? (
          <div className="text-center">
            <div className="text-xs text-slate-400 space-y-1">
              <p className="font-medium">&copy; 2025 Pasan Enterprises</p>
              <p className="text-slate-500">Version 1.0.0</p>
            </div>
            <div className="mt-3 flex justify-center space-x-1">
              <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-green-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full animate-pulse delay-100"></div>
              <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full animate-pulse delay-200"></div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
