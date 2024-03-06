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
  setMockFilename: (filename: string) => void;
  openCallback: ((type: FileType) => IMockFileHandle) | undefined;
  reset: () => void;
  handles: IMockFileHandle[];
};

export const MockFilePicker: IMockFilePicker = {
  handles: [],
  openCallback: undefined,

  reset: () => {
    MockFilePicker.handles.splice(0, MockFilePicker.handles.length);
    MockFilePicker.openCallback = undefined;
    mockData.filename = "";
  },

  open: async (type: FileType): Promise<IFileHandle> => {
    if (MockFilePicker.openCallback) {
      return MockFilePicker.openCallback(type);
    } else {
      const newHandle = new MockFileHandle(type, mockData.filename);
      MockFilePicker.handles.push(newHandle);
      return newHandle;
    }
  },

  save: async (type: FileType, suggestedName: string): Promise<IFileHandle> => {
    const newHandle = new MockFileHandle(type, mockData.filename);
    MockFilePicker.handles.push(newHandle);
    return newHandle;
  },

  setMockFilename: (filename: string) => {
    mockData.filename = filename;
  },
};
