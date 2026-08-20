import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';

export interface UserMenuDropdownProps {
  name: string;
  roleLabel: string;
  avatarText: string;
  profilePath: string;
  settingsPath: string;
  avatarBgColor?: string;
  avatarTextColor?: string;
}

export const UserMenuDropdown: React.FC<UserMenuDropdownProps> = ({
  name,
  roleLabel,
  avatarText,
  profilePath,
  settingsPath,
  avatarBgColor = 'bg-kth-primary-100',
  avatarTextColor = 'text-kth-primary-700',
}) => {
  const { logout, profile, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayName = profile?.full_name || name || 'User';
  const displayEmail = profile?.email || user?.email || '';

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  };

  const handleSignOutClick = () => {
    setIsOpen(false);
    setIsConfirmOpen(true);
  };

  const handleConfirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      handleNavigate('/login');
    } catch (err) {
      console.error('[UserMenuDropdown] Logout error:', err);
    } finally {
      setIsLoggingOut(false);
      setIsConfirmOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="User account menu"
        className="flex items-center gap-2.5 p-1 -m-1 rounded-lg hover:bg-kth-slate-100 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-kth-primary-600 select-none cursor-pointer group"
      >
        <div
          className={`w-8 h-8 rounded-full ${avatarBgColor} ${avatarTextColor} font-extrabold text-xs flex items-center justify-center border border-kth-slate-200/80 shadow-xs shrink-0`}
        >
          {avatarText}
        </div>
        <div className="hidden md:flex flex-col text-left min-w-0">
          <span className="text-xs font-bold text-kth-slate-900 leading-none truncate max-w-[130px]">
            {displayName}
          </span>
          <span className="text-[10px] text-kth-slate-500 font-medium mt-0.5 capitalize">
            {roleLabel}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-kth-slate-400 group-hover:text-kth-slate-600 transition-transform duration-150 shrink-0 ${
            isOpen ? 'rotate-180 text-kth-primary-600' : ''
          }`}
        />
      </button>

      {/* Account Popover Menu */}
      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-60 bg-white rounded-xl border border-kth-slate-200 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 focus:outline-none"
        >
          {/* User Header Summary */}
          <div className="px-3.5 py-2.5 border-b border-kth-slate-100">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-full ${avatarBgColor} ${avatarTextColor} font-extrabold text-xs flex items-center justify-center border border-kth-slate-200 shrink-0`}
              >
                {avatarText}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-kth-slate-900 truncate">
                  {displayName}
                </span>
                {displayEmail && (
                  <span className="text-[11px] text-kth-slate-500 truncate" title={displayEmail}>
                    {displayEmail}
                  </span>
                )}
                <span className="text-[10px] font-semibold text-kth-primary-600 capitalize mt-0.5">
                  {roleLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="py-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => handleNavigate(profilePath)}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-kth-slate-700 hover:text-kth-slate-900 hover:bg-kth-slate-50 transition-colors text-left"
            >
              <User className="w-4 h-4 text-kth-slate-400 shrink-0" />
              <span>My Profile</span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => handleNavigate(settingsPath)}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-kth-slate-700 hover:text-kth-slate-900 hover:bg-kth-slate-50 transition-colors text-left"
            >
              <Settings className="w-4 h-4 text-kth-slate-400 shrink-0" />
              <span>Settings</span>
            </button>
          </div>

          {/* Sign Out Action */}
          <div className="pt-1 border-t border-kth-slate-100">
            <button
              type="button"
              role="menuitem"
              onClick={handleSignOutClick}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors text-left"
            >
              <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Sign Out Confirmation Dialog */}
      <Dialog
        isOpen={isConfirmOpen}
        onClose={() => !isLoggingOut && setIsConfirmOpen(false)}
        title="Sign out of KnowToHire?"
        description="You'll need to sign in again to access your portal."
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-kth-slate-600">
            Are you sure you want to end your current session? Any unsaved changes in progress may be lost.
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-kth-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isLoggingOut}
              onClick={() => setIsConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              isLoading={isLoggingOut}
              onClick={handleConfirmLogout}
              leftIcon={<LogOut className="w-3.5 h-3.5" />}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
