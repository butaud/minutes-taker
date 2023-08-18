// exposes a simple Promise-based single-value lookup indexedDB interface

const INDEXEDDB_NAME = "Database";
const OBJECT_STORE_NAME = "ObjectStore";

const idbContext: { db?: IDBDatabase } = { db: undefined };
export const initializeIdb = async (): Promise<void> => {
  if (idbContext.db) {
    return Promise.resolve();
  } else {
    return new Promise<void>((resolve, reject) => {
      const open = indexedDB.open(INDEXEDDB_NAME, 2);
      open.onupgradeneeded = () => {
        open.result.deleteObjectStore(OBJECT_STORE_NAME);
        open.result.createObjectStore(OBJECT_STORE_NAME);
      };

      open.onsuccess = () => {
        idbContext.db = open.result;
        resolve();
      };

      open.onerror = () => {
        reject(open.error);
      };
    });
  }
};

export const getIdb = async <T>(): Promise<T | undefined> => {
  await initializeIdb();
  return new Promise<T | undefined>((resolve, reject) => {
    const tx = idbContext.db!.transaction(OBJECT_STORE_NAME, "readonly");
    const store = tx.objectStore(OBJECT_STORE_NAME);
    const getHandle = store.get(0);
    getHandle.onsuccess = () => {
      resolve(getHandle.result);
    };
    tx.onerror = () => {
      reject(tx.error);
    };
  });
};

export const setIdb = async <T>(value: T): Promise<void> => {
  await initializeIdb();
  return new Promise<void>((resolve, reject) => {
    const tx = idbContext.db!.transaction(OBJECT_STORE_NAME, "readwrite");
    const store = tx.objectStore(OBJECT_STORE_NAME);
    const putHandle = store.put(value, 0);
    putHandle.onsuccess = () => {
      resolve();
    };
    tx.onerror = () => {
      reject(tx.error);
    };
  });
};
