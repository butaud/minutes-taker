import { FileType, IFileHandle, IFilePicker } from "./file-manager.interface";

export type IMockFileHandle = IFileHandle & {
  setFileText: (text: string) => void;
  getFileText: () => string;
};

export class MockFileHandle implements IMockFileHandle {
  private _filename: string;
  private _fileText: string;
  constructor(
    public type: FileType,
    filename: string
  ) {
    this._filename = filename;
    this._fileText = "";
  }

  setFileText(text: string) {
    this._fileText = text;
  }

  getFileText() {
    return this._fileText;
  }

  async read(): Promise<string> {
    return this._fileText;
  }

  async write(content: string | Blob): Promise<void> {
    // we never read in blob content so there's no point in modeling saving it
    if (typeof content === "string") {
      this._fileText = content;
    }
  }

  get filename(): string {
    return this._filename;
  }
}

const mockData: {
  filename: string;
} = {
  filename: "",
};

export type IMockFilePicker = IFilePicker & {
  reset: () => void;
  handles: IMockFileHandle[];
  resolveOpen: (handle: IMockFileHandle) => void;
  resolveSave: (handle: IMockFileHandle) => void;
};

let openPromise = new Promise<IMockFileHandle>((resolve) => {
  MockFilePicker.resolveOpen = resolve;
});

let savePromise = new Promise<IMockFileHandle>((resolve) => {
  MockFilePicker.resolveSave = resolve;
});

export const MockFilePicker: IMockFilePicker = {
  handles: [],

  reset: () => {
    MockFilePicker.handles.splice(0, MockFilePicker.handles.length);
    openPromise = new Promise<IMockFileHandle>((resolve) => {
      MockFilePicker.resolveOpen = resolve;
    });
    savePromise = new Promise<IMockFileHandle>((resolve) => {
      MockFilePicker.resolveSave = resolve;
    });
    mockData.filename = "";
  },

  open: async (type: FileType): Promise<IFileHandle> => {
    return await openPromise;
  },

  save: async (type: FileType, suggestedName: string): Promise<IFileHandle> => {
    return await savePromise;
  },
};
