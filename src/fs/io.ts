import { Session } from "minutes-model";
import { useEffect, useState } from "react";
import { exportSessionToDocx } from "./doc";
import { getIdb, initializeIdb, setIdb } from "./idb";
import { upgradeSerializedSession } from "../util/upgrade";
import { LocalFilePicker } from "./local-file-manager";
import { IFileHandle } from "./file-manager.interface";

const saveContext: {
  handle?: IFileHandle;
} = {
  handle: undefined,
};

export const initializeIndexedDbBackup = async (): Promise<void> => {
  await initializeIdb();
  if (!saveContext.handle) {
    saveContext.handle = await getIdb<IFileHandle>();
  }
};

const syncHandleToIndexedDb = async () => {
  if (saveContext.handle) {
    await initializeIdb();
    await setIdb(saveContext.handle);
  }
};

export const saveSession: (
  session: Session,
  reuseHandle: boolean
) => Promise<void> = async (session, reuseHandle) => {
  if (!saveContext.handle || !reuseHandle) {
    const filename = `${session.metadata.organization}-${
      session.metadata.title
    }-${session.metadata.startTime.toDateString()}.json`;

    saveContext.handle = await LocalFilePicker.save("JSON", filename);
    await syncHandleToIndexedDb();
  }

  const json = JSON.stringify(session, undefined, 2);

  await saveContext.handle.write(json);
};

export const saveSessionAsDocx: (session: Session) => Promise<void> = async (
  session
) => {
  const filename = `${session.metadata.organization}-${
    session.metadata.title
  }-${session.metadata.startTime.toDateString()}.docx`;
  const blob = await exportSessionToDocx(session);

  const handle = await LocalFilePicker.save("Word", filename);

  await handle.write(blob);
};

export const loadSession: () => Promise<Session> = async () => {
  const handle = await LocalFilePicker.open("JSON");

  const json = await handle.read();
  const session = JSON.parse(json, dateTimeReviver);
  upgradeSerializedSession(session);
  saveContext.handle = handle;
  await syncHandleToIndexedDb();
  return session;
};

export const getContextFilename: () => string | undefined = () => {
  return saveContext.handle?.filename;
};

export const useContextFilename: () => string | undefined = () => {
  const [contextFilename, setContextFilename] = useState<string | undefined>(
    undefined
  );

  // poll to keep contextFilename up to date
  useEffect(() => {
    const intervalHandle = setInterval(() => {
      const currentContextFilename = getContextFilename();
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

export const resetSaveContext = () => {
  saveContext.handle = undefined;
};
