import { Session } from "minutes-model";
import { exportSessionToDocx } from "./doc";

const saveContext: { handle?: FileSystemFileHandle } = {
  handle: undefined,
};

export const saveSession: (
  session: Session,
  reuseHandle: boolean
) => Promise<void> = async (session, reuseHandle) => {
  if (!saveContext.handle || !reuseHandle) {
    const filename = `${session.metadata.organization}-${
      session.metadata.title
    }-${session.metadata.startTime.toDateString()}.json`;

    saveContext.handle = await window.showSaveFilePicker({
      types: [
        {
          description: "JSON File",
          accept: {
            "application/json": [".json"],
          },
        },
      ],
      suggestedName: filename,
    });
  }

  const json = JSON.stringify(session, undefined, 2);

  const writable = await saveContext.handle.createWritable();
  await writable.write(json);
  await writable.close();
};

export const saveSessionAsDocx: (session: Session) => Promise<void> = async (
  session
) => {
  const filename = `${session.metadata.organization}-${
    session.metadata.title
  }-${session.metadata.startTime.toDateString()}.docx`;
  const blob = await exportSessionToDocx(session);

  const handle = await window.showSaveFilePicker({
    types: [
      {
        description: "Word Document",
        accept: {
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            [".docx"],
        },
      },
    ],
    suggestedName: filename,
  });

  const writable = await handle.createWritable();
  await writable.write(blob);
  await writable.close();
};

export const loadSession: () => Promise<Session> = async () => {
  const handle = await window.showOpenFilePicker({
    types: [
      {
        description: "JSON File",
        accept: {
          "application/json": [".json"],
        },
      },
    ],
  });

  const file = await handle[0].getFile();
  const json = await file.text();
  const session = JSON.parse(json, dateTimeReviver);
  return session;
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
