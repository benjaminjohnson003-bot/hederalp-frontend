import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ResponsiveLayoutProps {
  sidebar: React.ReactNode;
  main: React.ReactNode;
  className?: string;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ sidebar, main, className = '' }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Auto-close sidebar on mobile when window resizes
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && isSidebarOpen) {
        const sidebar = document.getElementById('responsive-sidebar');
        const toggle = document.getElementById('sidebar-toggle');
        
        if (
          sidebar && 
          !sidebar.contains(event.target as Node) && 
          toggle && 
          !toggle.contains(event.target as Node)
        ) {
          setIsSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isSidebarOpen]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, isSidebarOpen]);

  return (
    <div className={`flex h-screen bg-gray-50 ${className}`}>
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        id="responsive-sidebar"
        className={`
          ${isMobile ? 'fixed' : 'relative'} 
          ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
          ${!isMobile && isCollapsed ? 'w-16' : isMobile ? 'w-80' : 'w-96'}
          ${isMobile ? 'z-50' : 'z-10'}
          h-full bg-white border-r border-gray-200 transition-all duration-300 ease-in-out
          flex flex-col overflow-hidden
        `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-gray-900 truncate">
              LP Strategy
            </h2>
          )}
          
          {/* Desktop Collapse Button */}
          {!isMobile && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-gray-500" />
              )}
            </button>
          )}

          {/* Mobile Close Button */}
          {isMobile && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto">
          {!isCollapsed ? (
            <div className="p-4">
              {sidebar}
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {/* Collapsed sidebar content - just icons */}
              <div className="text-center text-xs text-gray-500 mt-4">
                Collapsed
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            id="sidebar-toggle"
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          
          <h1 className="text-lg font-semibold text-gray-900">
            LP Strategy Analyzer
          </h1>
          
          <div className="w-9" /> {/* Spacer for centering */}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 max-w-full">
            {main}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveLayout;

