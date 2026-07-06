import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { CLERK_PUBLISHABLE_KEY, isClerkConfigured } from './lib/clerk';
import './index.css';
import App from './App.tsx';

import { ErrorBoundary } from './components/ErrorBoundary.tsx';

const RootApp = () => {
  if (isClerkConfigured) {
    return (
      <ErrorBoundary>
        <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
          <App />
        </ClerkProvider>
      </ErrorBoundary>
    );
  }
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootApp />
  </StrictMode>
);
