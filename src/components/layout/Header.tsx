import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { User, UserPlus, Briefcase, Menu, X, ChevronDown, LogOut } from 'lucide-react';

export const Header: React.FC = () => {
  const { profile, isAuthenticated, logout, setRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setProfileDropdownOpen(false);
    navigate('/');
  };

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Jobs', path: '/jobs' },
    { name: 'Study Hub', path: '/resources' },
    { name: 'Templates', path: '/templates' },
    { name: 'Employers', path: '/coming-soon?feature=Employers' },
    { name: 'Blog', path: '/blog' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact Us', path: '/contact' }
  ];

  const getDashboardPath = (userRole: UserRole) => {
    switch (userRole) {
      case 'admin':
      case 'super_admin':
        return '/dashboard/admin';
      case 'employer':
        return '/dashboard/employer';
      case 'candidate':
      default:
        return '/dashboard/candidate';
    }
  };

  // Logo Component
  const Logo = () => (
    <Link to="/" className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg py-1 shrink-0">
      <div className="bg-emerald-600 text-white w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-sm md:text-base font-black shadow-md shadow-emerald-600/20 select-none">
        K
      </div>
      <div className="flex flex-col justify-center select-none">
        <span className="text-lg md:text-xl font-black font-heading text-white tracking-tight leading-none">
          Know<span className="text-emerald-500">To</span>Hire
        </span>
        <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 leading-none mt-1">
          Career Intelligence Platform
        </span>
      </div>
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 w-full flex flex-col shadow-sm">
      
    {/* LAYER 1: TOP BAR */}
      <div className="bg-[#111827] text-white w-full border-b border-slate-800">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 h-14 flex items-center justify-between gap-4">
          <Logo />

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Quick role switcher for testing */}
            {isAuthenticated && profile && (
              <select
                value={profile.role}
                onChange={(e) => {
                  const newRole = e.target.value as UserRole;
                  setRole(newRole);
                  navigate(newRole === 'candidate' ? '/dashboard/candidate' : newRole === 'employer' ? '/dashboard/employer' : '/dashboard/admin');
                }}
                className="text-xs font-semibold bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer hover:bg-slate-700"
                aria-label="Quick Role Selector"
              >
                <option value="candidate">Candidate</option>
                <option value="employer">Employer</option>
                <option value="admin">Admin</option>
              </select>
            )}

            {isAuthenticated && profile ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 text-sm font-semibold hover:text-emerald-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg py-1 px-2 cursor-pointer"
                  id="user-menu-button"
                  aria-expanded={profileDropdownOpen}
                  aria-haspopup="true"
                >
                  <img className="h-8 w-8 rounded-full border border-slate-700" src={profile.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${profile.first_name || 'User'}`} alt={profile.first_name || 'User'} />
                  <span className="hidden sm:inline">{profile.first_name || 'User'}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-56 rounded-xl shadow-lg py-1 bg-white border border-gray-100 focus:outline-none animate-fade-in-up"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                  >
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-900 leading-tight">{profile.first_name} {profile.last_name}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{profile.email}</p>
                    </div>
                    <Link
                      to={getDashboardPath(profile.role)}
                      className="block px-4 py-2 text-xs font-bold text-gray-700 hover:bg-slate-50 transition-colors"
                      role="menuitem"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      Go to Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                      role="menuitem"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="flex items-center justify-center gap-2 text-white hover:text-emerald-500 hover:bg-slate-800 h-10 px-5 rounded-xl font-bold text-sm bg-transparent">
                    <User className="w-4 h-4 shrink-0" />
                    <span>Login</span>
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm" className="flex items-center justify-center gap-2 bg-emerald-650 hover:bg-emerald-700 text-white shadow-md h-10 px-5 rounded-xl font-bold text-sm">
                    <UserPlus className="w-4 h-4 shrink-0" />
                    <span>Register</span>
                  </Button>
                </Link>
                <Link to="/coming-soon?feature=PostJob">
                  <Button variant="secondary" size="sm" className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md h-10 px-5 rounded-xl font-bold text-sm">
                    <Briefcase className="w-4 h-4 shrink-0" />
                    <span>Post a Job</span>
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile hamburger icon */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex sm:hidden items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none cursor-pointer"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* LAYER 2: PRIMARY NAVIGATION BAR */}
      <div className="bg-white border-b border-slate-100 w-full hidden md:block">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
          <nav className="flex items-center gap-6 lg:gap-8 h-full">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center h-full px-1 text-sm font-semibold border-b-2 transition-all duration-200 select-none whitespace-nowrap cursor-pointer kth-inline-icon ${
                    isActive
                      ? 'border-emerald-600 text-emerald-600'
                      : 'border-transparent text-slate-600 hover:text-emerald-600'
                  }`
                }
              >
                <span>{item.name}</span>
                {['Jobs', 'Study Hub', 'Templates'].includes(item.name) && (
                  <ChevronDown className="w-3.5 h-3.5 opacity-70 shrink-0" />
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* LAYER 3: QUICK CATEGORY NAVIGATION */}
      <div className="bg-slate-50 w-full border-b border-slate-200/60 hidden md:block py-2">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 flex items-center flex-wrap gap-2">
          {[
            { name: 'AP', title: 'Andhra Pradesh' },
            { name: 'TS', title: 'Telangana' },
            { name: 'KA', title: 'Karnataka' },
            { name: 'TN', title: 'Tamil Nadu' },
            { name: 'MH', title: 'Maharashtra' },
            { name: 'DL', title: 'Delhi' },
            { name: 'WB', title: 'West Bengal' },
            { name: 'ESG', title: 'ESG' },
            { name: 'Engineering', title: 'Engineering' },
            { name: 'Climate', title: 'Climate' },
            { name: 'Sustainability', title: 'Sustainability' },
            { name: 'Remote Jobs', title: 'Remote Jobs' }
          ].map((item) => (
            <button
              key={item.name}
              title={item.title}
              onClick={() => navigate(`/jobs?search=${encodeURIComponent(item.title)}`)}
              className="bg-white hover:bg-emerald-50 hover:text-emerald-700 text-slate-650 text-xs font-bold px-3 py-1.5 rounded-full border border-slate-200/80 hover:border-emerald-200 transition-all cursor-pointer shadow-xs whitespace-nowrap"
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-4 animate-fade-in-up">
          
          {/* Main Links */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Navigation</span>
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-xs font-semibold text-center transition-colors cursor-pointer ${
                      isActive ? 'bg-emerald-50 text-emerald-700 font-bold' : 'bg-slate-50 text-slate-650 hover:bg-slate-100'
                    }`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Category Links */}
          <div className="flex flex-col gap-2 border-t border-slate-100 pt-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">States & Sectors</span>
            <div className="flex flex-wrap gap-1.5">
              {['AP', 'TS', 'KA', 'TN', 'MH', 'DL', 'WB', 'ESG', 'Engineering', 'Climate', 'Sustainability', 'Remote'].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate(`/jobs?search=${encodeURIComponent(item)}`);
                  }}
                  className="bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-650 text-[10px] font-bold px-2.5 py-1 rounded-full border border-slate-200"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Auth Actions */}
          <div className="border-t border-slate-100 pt-3">
            {isAuthenticated && profile ? (
              <div className="flex flex-col space-y-3">
                <div className="flex items-center space-x-3">
                  <img className="h-10 w-10 rounded-full border border-slate-200" src={profile.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${profile.first_name || 'User'}`} alt={profile.first_name || 'User'} />
                  <div>
                    <p className="text-sm font-bold text-slate-900 leading-tight">{profile.first_name} {profile.last_name}</p>
                    <p className="text-xs text-slate-500">{profile.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link to={getDashboardPath(profile.role)} onClick={() => setMobileMenuOpen(false)} className="w-full">
                    <Button variant="outline" size="sm" className="w-full text-xs font-bold">Dashboard</Button>
                  </Link>
                  <Button variant="danger" size="sm" onClick={handleLogout} className="w-full text-xs font-bold flex items-center justify-center gap-1.5 bg-red-50 text-red-650 hover:bg-red-100">
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign out</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full text-xs font-bold flex items-center justify-center gap-1.5 h-10 rounded-xl">
                      <User className="w-4 h-4 shrink-0" />
                      <span>Log in</span>
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" size="sm" className="w-full text-xs font-bold flex items-center justify-center gap-1.5 h-10 rounded-xl bg-emerald-650 hover:bg-emerald-700 text-white">
                      <UserPlus className="w-4 h-4 shrink-0" />
                      <span>Register</span>
                    </Button>
                  </Link>
                </div>
                <Link to="/coming-soon?feature=PostJob" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" size="sm" className="w-full text-xs font-bold flex items-center justify-center gap-1.5 h-10 rounded-xl bg-blue-600 hover:bg-blue-750 text-white">
                    <Briefcase className="w-4 h-4 shrink-0" />
                    <span>Post a Job</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
export default Header;
