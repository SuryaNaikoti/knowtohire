import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { employerService } from '../lib/services/employerService';
import type { Company } from '../types/employer.types';

export interface TenantContextType {
  tenantId: string | null;
  tenantName: string | null;
  subdomain: string | null;
  customDomain: string | null;
  themeConfig: {
    primaryColor: string;
    themeMode: 'light' | 'dark';
  };
  settings: {
    allowJobMatching: boolean;
    enableNotifications: boolean;
  };
  logoUrl: string | null;
  bannerUrl: string | null;
  loading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [tenantName, setTenantName] = useState<string | null>(null);
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [customDomain, setCustomDomain] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [themeConfig, setThemeConfig] = useState<{
    primaryColor: string;
    themeMode: 'light' | 'dark';
  }>({
    primaryColor: '#0F52BA',
    themeMode: 'light',
  });

  const [settings, setSettings] = useState<{
    allowJobMatching: boolean;
    enableNotifications: boolean;
  }>({
    allowJobMatching: true,
    enableNotifications: true,
  });

  useEffect(() => {
    let active = true;

    const resolveTenant = async () => {
      try {
        if (active) setLoading(true);
        const hostname = window.location.hostname;
        let resolvedSubdomain: string | null = null;
        let resolvedCustomDomain: string | null = null;

        // Dev, staging, and production resolution
        if (
          hostname !== 'localhost' &&
          hostname !== '127.0.0.1' &&
          !hostname.endsWith('.gitpod.io')
        ) {
          const parts = hostname.split('.');
          if (parts.length > 2) {
            resolvedSubdomain = parts[0];
          } else {
            resolvedCustomDomain = hostname;
          }
        }

        if (active) {
          setSubdomain(resolvedSubdomain);
          setCustomDomain(resolvedCustomDomain);
        }

        // Fetch company profile based on subdomain or custom domain mapping
        let company: Company | null = null;
        
        if (resolvedSubdomain || resolvedCustomDomain) {
          company = await employerService.getCompany('comp-1');
        }

        if (company && active) {
          setTenantId(company.id);
          setTenantName(company.name);
          setLogoUrl(company.logo_url || null);
          setBannerUrl(company.banner_url || null);
          
          if (company.theme_config) {
            setThemeConfig({
              primaryColor: company.theme_config.primaryColor,
              themeMode: company.theme_config.themeMode || 'light',
            });
          }

          if (company.settings) {
            setSettings({
              allowJobMatching: company.settings.allowJobMatching !== false,
              enableNotifications: company.settings.enableNotifications !== false,
            });
          }
        }
      } catch (err) {
        console.error('[TenantContext] Resolution failed:', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    resolveTenant();

    return () => {
      active = false;
    };
  }, []);

  // Dynamically inject tenant branding colors as CSS Variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--tenant-primary', themeConfig.primaryColor);
  }, [themeConfig]);

  // Memoize value to prevent unnecessary re-renders in children consuming Context
  const contextValue = useMemo(() => ({
    tenantId,
    tenantName,
    subdomain,
    customDomain,
    themeConfig,
    settings,
    logoUrl,
    bannerUrl,
    loading
  }), [tenantId, tenantName, subdomain, customDomain, themeConfig, settings, logoUrl, bannerUrl, loading]);

  return (
    <TenantContext.Provider value={contextValue}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
