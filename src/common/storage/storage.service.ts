export class StorageSingleton {
    private static instance: StorageSingleton;
    private storage = new Map<string, any>();
  
    private constructor() {}
  
    public static getInstance(): StorageSingleton {
      if (!StorageSingleton.instance) {
        StorageSingleton.instance = new StorageSingleton();
      }
      return StorageSingleton.instance;
    }
  
    store(data: any): string {
      const id = crypto.randomUUID();
      this.storage.set(id, data);
      return id;
    }
  
    retrieve(id: string) {
      const data = this.storage.get(id);
      if (!data) throw new Error(`Data not found for ID: ${id}`);
      return data;
    }
  }