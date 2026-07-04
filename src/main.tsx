import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { CLERK_PUBLISHABLE_KEY, isClerkConfigured } from './lib/clerk';
import './index.css';
import App from './App.tsx';

const RootApp = () => {
  if (isClerkConfigured) {
    return (
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
        <App />
      </ClerkProvider>
    );
  }
  return <App />;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootApp />
  </StrictMode>
);
