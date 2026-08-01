import { DraftStorageProviderRegistry } from './DraftStorageProvider';
import { analyticsService } from './analyticsService';

export interface IProfileDraftService {
  saveDraft(moduleName: string, candidateId: string, data: any): void;
  getDraft(moduleName: string, candidateId: string): any | null;
  clearDraft(moduleName: string, candidateId: string): void;
}

export class ProfileDraftService {
  private static STORAGE_PREFIX = 'kth_profile_draft';

  static saveDraft(moduleName: string, candidateId: string, data: any): void {
    try {
      const key = `${this.STORAGE_PREFIX}_${moduleName}_${candidateId}`;
      const provider = DraftStorageProviderRegistry.getProvider();
      provider.setItem(key, JSON.stringify({
        data,
        timestamp: new Date().toISOString()
      }));
      
      analyticsService.track({
        event_type: 'click',
        event_category: 'auth',
        properties: { action: 'Draft Saved', moduleName }
      });
    } catch (err) {
      console.error(`Failed to save draft for ${moduleName}:`, err);
    }
  }

  static getDraft(moduleName: string, candidateId: string): any | null {
    try {
      const key = `${this.STORAGE_PREFIX}_${moduleName}_${candidateId}`;
      const provider = DraftStorageProviderRegistry.getProvider();
      const saved = provider.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        
        analyticsService.track({
          event_type: 'click',
          event_category: 'auth',
          properties: { action: 'Draft Restored', moduleName }
        });
        
        return parsed.data;
      }
    } catch (err) {
      console.error(`Failed to get draft for ${moduleName}:`, err);
    }
    return null;
  }

  static clearDraft(moduleName: string, candidateId: string): void {
    try {
      const key = `${this.STORAGE_PREFIX}_${moduleName}_${candidateId}`;
      const provider = DraftStorageProviderRegistry.getProvider();
      provider.removeItem(key);
    } catch (err) {
      console.error(`Failed to clear draft for ${moduleName}:`, err);
    }
  }
}
