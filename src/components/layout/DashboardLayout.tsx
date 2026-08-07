import React, { useState, useEffect, Suspense } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';
import { LoadingOverlay } from '../ui/Loading';
import { notificationService } from '../../lib/services/notificationService';
import { useNotifications } from '../../lib/services/notifications';
import { ToastContainer } from '../common/ToastContainer';
import { GlobalCommandSearch } from '../ui/GlobalCommandSearch';
import { Search, Sun, Moon } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { profile, setRole, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const profileDropdownRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const { unreadCount, setUnreadCount, toasts, dismissToast } = useNotifications(profile?.id);

  useEffect(() => {
    const fetchUnread = async () => {
      if (!profile) return;
      try {
        const count = await notificationService.getUnreadCount(profile.id);
        setUnreadCount(count);
      } catch (err) {
        console.error('Failed to load unread count:', err);
      }
    };
    fetchUnread();
  }, [profile, setUnreadCount]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setProfileDropdownOpen(false);
      }
    };

    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [profileDropdownOpen]);

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.HOME);
  };

  const getDashboardPath = (userRole: 'candidate' | 'employer' | 'admin' | 'super_admin') => {
    switch (userRole) {
      case 'admin':
      case 'super_admin':
        return ROUTES.DASHBOARD.ADMIN.ROOT;
      case 'employer':
        return ROUTES.DASHBOARD.EMPLOYER.ROOT;
      case 'candidate':
      default:
        return ROUTES.DASHBOARD.CANDIDATE.ROOT;
    }
  };

  // Sidebar link items based on current role
  const getSidebarItems = (userRole: 'candidate' | 'employer' | 'admin' | 'super_admin') => {
    const baseItems = [
      { name: 'Dashboard Overview', path: getDashboardPath(userRole), icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z' },
    ];

    const candidateItems = [
      ...baseItems,
      { name: 'Profile & CV Hub', path: ROUTES.DASHBOARD.CANDIDATE.PORTFOLIO, icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
      { name: 'Work Experience', path: ROUTES.DASHBOARD.CANDIDATE.EXPERIENCE, icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
      { name: 'Education History', path: ROUTES.DASHBOARD.CANDIDATE.EDUCATION, icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
      { name: 'Certifications', path: ROUTES.DASHBOARD.CANDIDATE.CERTIFICATIONS, icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
      { name: 'Portfolio Projects', path: ROUTES.DASHBOARD.CANDIDATE.PROJECTS, icon: 'M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20' },
      { name: 'Technical Skills', path: ROUTES.DASHBOARD.CANDIDATE.SKILLS, icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
      { name: 'Explore Jobs', path: ROUTES.DASHBOARD.CANDIDATE.JOBS, icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
      { name: 'Saved Jobs', path: ROUTES.DASHBOARD.CANDIDATE.SAVED, icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
      { name: 'Job Alerts', path: ROUTES.DASHBOARD.CANDIDATE.ALERTS, icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
      { name: 'Notifications', path: ROUTES.DASHBOARD.CANDIDATE.NOTIFICATIONS, icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
      { name: 'My Purchases', path: ROUTES.DASHBOARD.CANDIDATE.PURCHASES, icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
      { name: 'Billing History', path: ROUTES.DASHBOARD.CANDIDATE.BILLING, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
      { name: 'Subscriptions', path: ROUTES.DASHBOARD.CANDIDATE.SUBSCRIPTIONS, icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.286L13 21l-2.286-6.857L5 12l5.714-2.286L13 3z' },
      { name: 'Account Settings', path: `${ROUTES.DASHBOARD.CANDIDATE.ROOT}/settings`, icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
    ];

    const employerItems = [
      ...baseItems,
      { name: 'Company Profile', path: ROUTES.DASHBOARD.EMPLOYER.COMPANY, icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
      { name: 'Office Locations', path: ROUTES.DASHBOARD.EMPLOYER.LOCATIONS, icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
      { name: 'Team Directory', path: ROUTES.DASHBOARD.EMPLOYER.TEAM, icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 11-8 0 4 4 0 018 0 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75' },
      { name: 'Active Postings', path: ROUTES.DASHBOARD.EMPLOYER.JOBS, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
      { name: 'Job Applications', path: `${ROUTES.DASHBOARD.EMPLOYER.ROOT}/applications`, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2H9z' },
      { name: 'Billing & Plans', path: `${ROUTES.DASHBOARD.EMPLOYER.ROOT}/billing`, icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 003-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
      { name: 'Notifications', path: `${ROUTES.DASHBOARD.EMPLOYER.ROOT}/notifications`, icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
      { name: 'Workspace Settings', path: `${ROUTES.DASHBOARD.EMPLOYER.ROOT}/settings`, icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
    ];


    const adminItems = [
      ...baseItems,
      { name: 'User Directory', path: `${ROUTES.DASHBOARD.ADMIN.ROOT}/users`, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20H2v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
      { name: 'Candidates', path: `${ROUTES.DASHBOARD.ADMIN.ROOT}/candidates`, icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
      { name: 'Employers', path: `${ROUTES.DASHBOARD.ADMIN.ROOT}/employers`, icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
      { name: 'Job Moderation', path: ROUTES.DASHBOARD.ADMIN.MODERATION, icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
      { name: 'Applications Monitor', path: `${ROUTES.DASHBOARD.ADMIN.ROOT}/applications`, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2H9z' },
      { name: 'Resources CMS', path: `${ROUTES.DASHBOARD.ADMIN.ROOT}/resources`, icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
      { name: 'Templates Marketplace', path: `${ROUTES.DASHBOARD.ADMIN.ROOT}/templates`, icon: 'M9.663 17h4.673M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
      { name: 'Blog CMS', path: `${ROUTES.DASHBOARD.ADMIN.ROOT}/blog`, icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
      { name: 'Marketplace Orders', path: `${ROUTES.DASHBOARD.ADMIN.ROOT}/orders`, icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
      { name: 'Subscriptions', path: `${ROUTES.DASHBOARD.ADMIN.ROOT}/subscriptions`, icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 003-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
      { name: 'Audit Tracker', path: `${ROUTES.DASHBOARD.ADMIN.ROOT}/audit-logs`, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
      { name: 'Access Configuration', path: `${ROUTES.DASHBOARD.ADMIN.ROOT}/roles`, icon: 'M15 7a2 2 0 012 2m-2 4a2 2 0 012 2m-2-7a3 3 0 11-6 0 3 3 0 016 0zm-3 9a6 6 0 00-2 11.667v-3.43a2 2 0 00-1-1.732V9a2 2 0 012-2h.01' },
      { name: 'System Settings', path: `${ROUTES.DASHBOARD.ADMIN.ROOT}/settings`, icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    ];

    switch (userRole) {
      case 'admin':
      case 'super_admin':
        return adminItems;
      case 'employer':
        return employerItems;
      case 'candidate':
      default:
        return candidateItems;
    }
  };

  const userRole = profile?.role || 'candidate';
  const sidebarItems = getSidebarItems(userRole);

  // Generate dynamic breadcrumb segments
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const url = `/${pathSegments.slice(0, index + 1).join('/')}`;
    const formattedSegment = segment.replace(/-/g, ' ');
    return {
      name: formattedSegment.charAt(0).toUpperCase() + formattedSegment.slice(1),
      url,
      isLast: index === pathSegments.length - 1,
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-white border-b border-gray-200 border-solid px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <span className="font-bold text-sm text-primary flex items-center gap-1.5">
          <span className="bg-primary text-white w-6 h-6 rounded flex items-center justify-center text-xs font-black shadow-sm">K</span>
          KnowToHire
        </span>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 cursor-pointer"
          aria-label="Open Sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Sidebar Overlay on Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed inset-y-0 left-0 bg-gray-900 text-gray-300 w-64 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } transition-transform duration-200 ease-in-out z-50 md:sticky md:top-0 md:h-screen shrink-0 flex flex-col border-r border-gray-800 border-solid`}
      >
        {/* Sidebar Header */}
        <div className="h-16 px-6 border-b border-gray-800 border-solid flex items-center justify-between shrink-0">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-lg font-black font-heading text-white flex items-center gap-1.5">
              <span className="bg-emerald-650 text-white w-6 h-6 rounded flex items-center justify-center text-xs font-black shadow-sm">K</span>
              Know<span className="text-emerald-400 font-black">To</span><span className="text-gray-300 font-extrabold text-sm">Hire</span>
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-gray-400 hover:text-white cursor-pointer"
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 px-4 py-6 space-y-4 overflow-y-auto">
          {userRole === 'candidate' ? [
            {
              title: 'Career',
              items: [
                { name: 'Dashboard', path: getDashboardPath(userRole), icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z' },
                { name: 'Profile', path: ROUTES.DASHBOARD.CANDIDATE.PORTFOLIO, icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                { name: 'Resume', path: '/candidate/resume-builder', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2H9z' },
                { name: 'Experience', path: ROUTES.DASHBOARD.CANDIDATE.EXPERIENCE, icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                { name: 'Education', path: ROUTES.DASHBOARD.CANDIDATE.EDUCATION, icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253' },
                { name: 'Skills', path: ROUTES.DASHBOARD.CANDIDATE.SKILLS, icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2' },
                { name: 'Certifications', path: ROUTES.DASHBOARD.CANDIDATE.CERTIFICATIONS, icon: 'M9 12l2 2 4-4' },
                { name: 'Portfolio', path: ROUTES.DASHBOARD.CANDIDATE.PROJECTS, icon: 'M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2' }
              ]
            },
            {
              title: 'Jobs',
              items: [
                { name: 'Explore Jobs', path: ROUTES.DASHBOARD.CANDIDATE.JOBS, icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
                { name: 'Saved Jobs', path: ROUTES.DASHBOARD.CANDIDATE.SAVED, icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
                { name: 'Applications', path: ROUTES.DASHBOARD.CANDIDATE.JOBS, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5' },
                { name: 'Job Alerts', path: ROUTES.DASHBOARD.CANDIDATE.ALERTS, icon: 'M15 17h5l-1.405-1.405' }
              ]
            },
            {
              title: 'Learning',
              items: [
                { name: 'Career Roadmap', path: '/guides/career-roadmap', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894' },
                { name: 'Learning Hub', path: ROUTES.RESOURCES, icon: 'M12 6.253v13' },
                { name: 'Certifications', path: ROUTES.DASHBOARD.CANDIDATE.CERTIFICATIONS, icon: 'M5 3v4M3 5h4' },
                { name: 'AI Coach', path: '/dashboard/candidate/assistant', icon: 'M9.663 17h4.673' }
              ]
            },
            {
              title: 'Account',
              items: [
                { name: 'Notifications', path: ROUTES.DASHBOARD.CANDIDATE.NOTIFICATIONS, icon: 'M3 8l7.89 5.26a2 2 0 002.22 0' },
                { name: 'Purchases', path: ROUTES.DASHBOARD.CANDIDATE.PURCHASES, icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12' },
                { name: 'Billing', path: ROUTES.DASHBOARD.CANDIDATE.BILLING, icon: 'M9 12h6' },
                { name: 'Settings', path: `${ROUTES.DASHBOARD.CANDIDATE.ROOT}/settings`, icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0' }
              ]
            }
          ].map((section) => (
            <div key={section.title} className="space-y-1.5">
              <span className="text-[10px] font-black text-gray-500/90 uppercase tracking-widest px-3 block mb-1.5 font-mono">
                {section.title}
              </span>
              {section.items.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-200 group gap-2.5 ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 font-bold'
                        : 'text-gray-400 hover:bg-gray-800/80 hover:text-gray-100'
                    }`
                  }
                >
                  <svg
                    className="w-4 h-4 shrink-0 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                  </svg>
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </div>
          )) : (
            sidebarItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 text-xs font-bold rounded-lg transition-all duration-150 group gap-3 ${
                    isActive && !item.path.includes('coming-soon')
                      ? 'bg-primary text-white shadow-md shadow-blue-500/10'
                      : 'text-gray-400 hover:bg-gray-850 hover:text-white'
                  }`
                }
              >
                <svg
                  className="w-4 h-4 shrink-0 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                </svg>
                <span>{item.name}</span>
              </NavLink>
            ))
          )}
        </nav>

        {/* Developer Demo Role Selector in Sidebar */}
        <div className="p-4 border-t border-gray-800 border-solid bg-gray-950 shrink-0">
          <div className="flex flex-col space-y-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Simulator Switcher</span>
            <select
              value={userRole}
              onChange={(e) => {
                const newRole = e.target.value as any;
                setRole(newRole);
                navigate(getDashboardPath(newRole));
              }}
              className="w-full text-xs font-bold bg-gray-900 border border-gray-800 border-solid rounded-lg px-2.5 py-2 text-gray-300 focus:outline-none cursor-pointer focus:border-primary"
              aria-label="Sidebar Role Changer"
            >
              <option value="candidate">Role: Candidate</option>
              <option value="employer">Role: Employer</option>
              <option value="admin">Role: Admin</option>
            </select>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 border-solid h-16 flex items-center justify-between px-6 sticky top-0 z-20 shrink-0">
          {/* Breadcrumb Area (Hidden on Mobile & Tablet, Visible on Desktop lg: flex) */}
          <nav className="hidden lg:flex items-center text-xs font-semibold text-gray-500 overflow-x-auto" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-1 sm:space-x-2 whitespace-nowrap">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              </li>
              {breadcrumbs.map((crumb) => (
                <li key={crumb.url} className="flex items-center space-x-1 sm:space-x-2">
                  <span className="text-gray-300">/</span>
                  {crumb.isLast ? (
                    <span className="text-gray-900 font-bold">{crumb.name}</span>
                  ) : (
                    <Link to={crumb.url} className="hover:text-primary transition-colors">{crumb.name}</Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          {/* Right Header Actions (Hidden on Mobile md:flex, rendered in Mobile Bottom Bar on mobile) */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Global Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-solid border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 cursor-pointer text-xs font-semibold"
              aria-label="Open Command Search"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="hidden sm:inline px-1.5 py-0.5 bg-slate-100 rounded text-[9px] font-mono font-bold text-slate-500">Ctrl K</kbd>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 cursor-pointer"
              aria-label="Toggle Dark Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Notifications Button */}
            <Link
              to={ROUTES.DASHBOARD.CANDIDATE.NOTIFICATIONS}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-650 hover:bg-gray-50 cursor-pointer relative block"
              aria-label="View notifications"
            >
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white border-solid">
                  {unreadCount}
                </span>
              )}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </Link>

            {/* Profile Dropdown */}
            {profile && (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 cursor-pointer focus:outline-none"
                  id="dashboard-user-button"
                  aria-expanded={profileDropdownOpen}
                >
                  <img className="h-8 w-8 rounded-full border border-gray-200 border-solid" src={profile.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${profile.first_name || 'User'}`} alt={profile.first_name || 'User'} />
                  <span className="hidden sm:inline-block text-xs font-bold text-gray-700">{profile.first_name || 'User'}</span>
                </button>

                {profileDropdownOpen && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-52 rounded-xl shadow-lg bg-white border border-gray-100 border-solid focus:outline-none animate-fade-in-up py-1"
                    role="menu"
                  >
                    <div className="px-4 py-2 border-b border-gray-100 border-solid">
                      <p className="text-xs font-bold text-gray-900 leading-tight">{profile.first_name} {profile.last_name}</p>
                      <p className="text-[10px] text-gray-500 font-medium truncate">{profile.email}</p>
                    </div>
                    <Link
                      to="/"
                      className="block px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      Back to Website
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8 overflow-y-auto max-w-7xl w-full mx-auto relative">
          <Suspense fallback={<LoadingOverlay />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      
      {/* Mobile Bottom Fixed Quick Actions Bar (Hidden on Desktop md:hidden) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-2 px-6 flex items-center justify-around shadow-lg md:hidden">
        {/* Search */}
        <button
          onClick={() => setSearchOpen(true)}
          className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer flex flex-col items-center gap-0.5"
          aria-label="Search"
        >
          <Search className="w-5 h-5 text-slate-600" />
          <span className="text-[9px] font-bold text-slate-500">Search</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer flex flex-col items-center gap-0.5"
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-slate-600" />}
          <span className="text-[9px] font-bold text-slate-500">Theme</span>
        </button>

        {/* Notifications */}
        <Link
          to={ROUTES.DASHBOARD.CANDIDATE.NOTIFICATIONS}
          className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer relative flex flex-col items-center gap-0.5"
          aria-label="Notifications"
        >
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-2 bg-rose-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">
              {unreadCount}
            </span>
          )}
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="text-[9px] font-bold text-slate-500">Alerts</span>
        </Link>

        {/* Profile Avatar */}
        {profile && (
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="p-1 rounded-full border border-slate-200 cursor-pointer flex flex-col items-center"
            aria-label="Profile Menu"
          >
            <img
              className="h-6 w-6 rounded-full"
              src={profile.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${profile.first_name || 'User'}`}
              alt={profile.first_name || 'User'}
            />
          </button>
        )}
      </div>

      {/* Global Command Search Modal */}
      <GlobalCommandSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};
