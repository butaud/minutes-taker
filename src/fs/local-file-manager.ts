import { FileType, IFileHandle, IFilePicker } from "./file-manager.interface";

class LocalFileHandle implements IFileHandle {
  handle: FileSystemFileHandle;
  constructor(
    public type: FileType,
    handle: FileSystemFileHandle
  ) {
    this.handle = handle;
  }

  get filename(): string {
    return this.handle.name;
  }

  async read(): Promise<string> {
    const file = await this.handle.getFile();
    return await file.text();
  }

  async write(content: string | Blob): Promise<void> {
    const writable = await this.handle.createWritable();
    await writable.write(content);
    await writable.close();
  }
}

const localFileTypes: Record<FileType, FilePickerAcceptType[]> = {
  Word: [
    {
      description: "Word Document",
      accept: {
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          [".docx"],
      },
    },
  ],
  JSON: [
    {
      description: "JSON File",
      accept: {
        "application/json": [".json"],
      },
    },
  ],
};

export const LocalFilePicker: IFilePicker = {
  open: async (type: FileType): Promise<IFileHandle> => {
    const handle = await window.showOpenFilePicker({
      types: localFileTypes[type],
    });
    return new LocalFileHandle(type, handle[0]);
  },

  save: async (type: FileType, suggestedName: string): Promise<IFileHandle> => {
    const handle = await window.showSaveFilePicker({
      types: localFileTypes[type],
      suggestedName: suggestedName,
    });
    return new LocalFileHandle(type, handle);
  },
};
