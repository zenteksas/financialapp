/**
 * storage.js - IndexedDB abstraction for ZenFinance
 * Persistent and asynchronous data layer.
 */

const DB_NAME = 'FinanceAppDB';
const STORE_NAME = 'app_data';
const DB_VERSION = 1;

let dbInstance = null;

const getDB = () => {
  return new Promise((resolve, reject) => {
    if (dbInstance) return resolve(dbInstance);

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      reject('IndexedDB Error: ' + event.target.errorCode);
    };
  });
};

export const storage = {
  /**
   * Retrieves a value from the database.
   */
  get: async (key) => {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  },

  /**
   * Saves a value to the database.
   */
  set: async (key, value) => {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(value, key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  /**
   * Removes a key from the database.
   */
  remove: async (key) => {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  /**
   * Clears all data (Factory Reset).
   */
  clear: async () => {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  /**
   * Migrates data from localStorage to IndexedDB if it hasn't been done.
   */
  migrateFromLocalStorage: async (keys) => {
    const migrationFlag = 'migration_complete';
    const isMigrated = await storage.get(migrationFlag);
    
    if (isMigrated) return;

    for (const key of keys) {
      const localData = localStorage.getItem(key);
      if (localData !== null) {
        try {
          const parsed = JSON.parse(localData);
          await storage.set(key, parsed);
        } catch (e) {
          // If not JSON, save as raw string (for currency etc)
          await storage.set(key, localData);
        }
      }
    }

    await storage.set(migrationFlag, true);
    console.log('Migration from localStorage complete');
  }
};
