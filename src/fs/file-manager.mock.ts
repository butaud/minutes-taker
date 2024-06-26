import { allowPropagation } from "../util/test";
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
  resolveOpen: ((handle: IMockFileHandle) => void) | undefined;
  resolveSave: ((handle: IMockFileHandle) => void) | undefined;
};

export class MockFilePicker implements IMockFilePicker {
  private _resolveOpen: ((handle: IMockFileHandle) => void) | undefined;
  private _resolveSave: ((handle: IMockFileHandle) => void) | undefined;

  public async resolveOpen(handle: IMockFileHandle) {
    await allowPropagation();
    this._resolveOpen?.(handle);
    await allowPropagation();
  }

  public async resolveSave(handle: IMockFileHandle) {
    await allowPropagation();
    this._resolveSave?.(handle);
    await allowPropagation();
  }

  reset = () => {
    mockData.filename = "";
  };

  open = (_type: FileType): Promise<IFileHandle> => {
    return new Promise<IMockFileHandle>((resolve) => {
      this._resolveOpen = resolve;
    });
  };

  save = (_type: FileType, _suggestedName: string): Promise<IFileHandle> => {
    return new Promise<IMockFileHandle>((resolve) => {
      this._resolveSave = resolve;
    });
  };
}

export const mockFilePicker = new MockFilePicker();
