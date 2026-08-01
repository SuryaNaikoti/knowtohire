export interface DraftStorageProvider {
  setItem(key: string, value: string): void;
  getItem(key: string): string | null;
  removeItem(key: string): void;
}

export class LocalStorageDraftProvider implements DraftStorageProvider {
  setItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  getItem(key: string): string | null {
    return localStorage.getItem(key);
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }
}

export class DraftStorageProviderRegistry {
  private static provider: DraftStorageProvider = new LocalStorageDraftProvider();

  static setProvider(newProvider: DraftStorageProvider): void {
    this.provider = newProvider;
  }

  static getProvider(): DraftStorageProvider {
    return this.provider;
  }
}
