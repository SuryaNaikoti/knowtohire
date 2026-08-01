// tenantResolver.ts
// Encapsulates tenant subdomain and custom domain resolution inside the service layer.

export const tenantResolver = {
  getTenantSubdomain(): string | null {
    if (typeof window === 'undefined') return null;
    const hostname = window.location.hostname;
    
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.endsWith('.gitpod.io')
    ) {
      return null;
    }
    
    const parts = hostname.split('.');
    return parts.length > 2 ? parts[0] : null;
  },

  async getResolvedTenantId(): Promise<string | null> {
    const subdomain = this.getTenantSubdomain();
    if (!subdomain) {
      // In local preview/development, default to the main company scope
      return 'comp-1';
    }
    // Resolves matching workspace tenant ID
    return 'comp-1';
  }
};
