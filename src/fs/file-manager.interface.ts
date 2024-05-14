export type FileType = "Word" | "JSON";

export type IFileHandle = {
  type: FileType;
  filename: string;
  read: () => Promise<string>;
  write: (content: string | Blob) => Promise<void>;
};

export type IFilePicker = {
  open: (type: FileType) => Promise<IFileHandle>;
  save: (type: FileType, suggestedName: string) => Promise<IFileHandle>;
};
