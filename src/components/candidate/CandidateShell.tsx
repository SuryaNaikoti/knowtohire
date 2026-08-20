import React, { useState } from 'react';
import { CandidateHeader } from './CandidateHeader';
import { CandidateSidebar } from './CandidateSidebar';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { Drawer } from '@/components/ui/Drawer';

export interface CandidateShellProps {
  title?: string;
  currentPath?: string;
  children: React.ReactNode;
}

export const CandidateShell: React.FC<CandidateShellProps> = ({
  title = "Candidate Dashboard",
  currentPath = "/candidate",
  children,
}) => {
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-kth-slate-50 flex flex-col font-sans">
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden xl:block shrink-0">
          <CandidateSidebar currentPath={currentPath} />
        </div>

        {/* Main Product Stream */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <CandidateHeader
            title={title}
            onSearchClick={() => setIsCommandOpen(true)}
            onMobileMenuToggle={() => setMobileDrawerOpen(true)}
          />
          <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-6xl mx-auto w-full">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <Drawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        title="Candidate Menu"
      >
        <CandidateSidebar currentPath={currentPath} className="w-full border-r-0 p-0" />
      </Drawer>

      {/* Global Cmd + K Command Palette */}
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
    </div>
  );
};
