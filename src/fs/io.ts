import { Session } from "minutes-model";
import { useEffect, useState } from "react";
import { exportSessionToDocx } from "./doc";
import { getIdb, initializeIdb, setIdb } from "./idb";
import { upgradeSerializedSession } from "../util/upgrade";
import { localFilePicker } from "./local-file-manager";
import { IFileHandle } from "./file-manager.interface";
class SaveContext {
  private _handle: IFileHandle | undefined;
  private _callbacks: (() => void)[];
  private _initialized = false;
  constructor() {
    this._handle = undefined;
    this._callbacks = [];
  }

  public async ensureInitialized(): Promise<void> {
    if (!this._initialized) {
      await initializeIdb();
      this._handle = await getIdb<IFileHandle>();
      this._initialized = true;
    }
  }

  public async getHandle(): Promise<IFileHandle | undefined> {
    await this.ensureInitialized();
    return this._handle;
  }

  public async setHandle(handle: IFileHandle | undefined): Promise<void> {
    await this.ensureInitialized();
    this._handle = handle;
    await setIdb(handle);
    this._callbacks.forEach((callback) => callback());
  }

  public get currentFilename(): string | undefined {
    return this._handle?.filename;
  }

  public addCallback(callback: () => void): number {
    this._callbacks.push(callback);
    return this._callbacks.length - 1;
  }

  public removeCallback(index: number): void {
    this._callbacks.splice(index, 1);
  }
}

const saveContext = new SaveContext();

export const initializeIndexedDbBackup = async (): Promise<void> => {
  await saveContext.ensureInitialized();
};

export const unsetHandle = async () => {
  await saveContext.setHandle(undefined);
};

export const saveSession: (
  session: Session,
  reuseHandle: boolean
) => Promise<void> = async (session, reuseHandle) => {
  let eventuallyGuaranteedHandle = await saveContext.getHandle();
  if (!reuseHandle || !eventuallyGuaranteedHandle) {
    const filename = `${session.metadata.organization}-${
      session.metadata.title
    }-${session.metadata.startTime.toDateString()}.json`;

    eventuallyGuaranteedHandle = await localFilePicker.save("JSON", filename);
    await saveContext.setHandle(eventuallyGuaranteedHandle);
  }

  const json = JSON.stringify(session, undefined, 2);
  eventuallyGuaranteedHandle.write(json);
};

export const saveSessionAsDocx: (session: Session) => Promise<void> = async (
  session
) => {
  const filename = `${session.metadata.organization}-${
    session.metadata.title
  }-${session.metadata.startTime.toDateString()}.docx`;
  const blob = await exportSessionToDocx(session);

  const handle = await localFilePicker.save("Word", filename);

  await handle.write(blob);
};

export const loadSession: () => Promise<Session> = async () => {
  const newHandle = await localFilePicker.open("JSON");

  const json = await newHandle.read();
  const session = JSON.parse(json, dateTimeReviver);
  upgradeSerializedSession(session);
  await saveContext.setHandle(newHandle);
  return session;
};

export const useContextFilename: () => string | undefined = () => {
  const [contextFilename, setContextFilename] = useState<string | undefined>(
    undefined
  );

  // poll to keep contextFilename up to date
  useEffect(() => {
    const intervalHandle = setInterval(() => {
      const currentContextFilename = saveContext.currentFilename;
      if (contextFilename != currentContextFilename) {
        setContextFilename(currentContextFilename);
      }
    }, 500);
    return () => {
      clearInterval(intervalHandle);
    };
  }, [contextFilename]);
  return contextFilename;
};

export const dateTimeReviver = (_: string, value: string) => {
  if (typeof value === "string") {
    const match =
      /[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z/.exec(
        value
      );
    if (match) {
      return new Date(match[0]);
    }
  }
  return value;
};
