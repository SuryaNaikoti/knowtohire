import React, { useState } from 'react';
import { EmployerHeader } from './EmployerHeader';
import { EmployerSidebar } from './EmployerSidebar';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { Drawer } from '@/components/ui/Drawer';

export interface EmployerShellProps {
  title?: string;
  currentPath?: string;
  children: React.ReactNode;
}

export const EmployerShell: React.FC<EmployerShellProps> = ({
  title = "Employer Dashboard",
  currentPath = "/employer",
  children,
}) => {
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-kth-slate-50 flex flex-col font-sans">
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden xl:block shrink-0">
          <EmployerSidebar currentPath={currentPath} />
        </div>

        {/* Main Content Stream */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <EmployerHeader
            title={title}
            onSearchClick={() => setIsCommandOpen(true)}
            onMobileMenuToggle={() => setMobileDrawerOpen(true)}
          />
          <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <Drawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        title="Employer Navigation"
      >
        <EmployerSidebar currentPath={currentPath} className="w-full border-r-0 p-0" />
      </Drawer>

      {/* Global Cmd + K Command Palette */}
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
    </div>
  );
};
