let stored: any = undefined;
export const initializeIdb = () => {
  return;
};

export const getIdb = async <T>(): Promise<T | undefined> => {
  return Promise.resolve(stored as T);
};

export const setIdb = async <T>(value: T): Promise<void> => {
  stored = value;
};

export const clearIdb = (): void => {
  stored = undefined;
};
