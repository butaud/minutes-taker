import {
  IShadingAttributesProperties,
  IStylesOptions,
  ITableCellOptions,
  WidthType,
} from "docx";

export const Styles: IStylesOptions = {
  default: {
    heading1: {
      run: {
        size: 32,
        bold: true,
        color: "000000",
        font: "Calibri Bold",
      },
      paragraph: {
        spacing: {
          after: 120,
        },
      },
    },
    heading2: {
      run: {
        size: 24,
        bold: true,
        color: "000000",
        font: "Calibri Bold",
      },
    },
    document: {
      run: {
        size: 22,
        color: "000000",
        font: "Calibri",
      },
    },
  },
  paragraphStyles: [
    {
      id: "CalendarHeader",
      name: "Calendar Header",
      run: {
        bold: true,
      },
      paragraph: {
        spacing: {
          before: 200,
        },
      },
    },
    {
      id: "MotionInternal",
      name: "Motion Internal Line",
      paragraph: {
        spacing: {
          afterAutoSpacing: false,
        },
      },
    },
    {
      id: "NoteFinalLine",
      name: "Note Final Line",
      basedOn: "Normal",
      paragraph: {
        spacing: {
          after: 200,
        },
      },
    },
    {
      id: "MotionOutcome",
      name: "Motion Outcome Line",
      basedOn: "NoteFinalLine",
      run: {
        bold: true,
      },
    },
  ],
  characterStyles: [
    {
      id: "MinuteStateDraft",
      name: "Minute State Draft",
      basedOn: "Normal",
      quickFormat: true,
      run: {
        color: "c0504d",
      },
    },
    {
      id: "SpeakerReference",
      name: "Speaker Reference",
      basedOn: "Normal",
      quickFormat: true,
      run: {
        color: "4f81bd",
        bold: true,
      },
    },
    {
      id: "ActionItemPrefix",
      name: "Action Item Prefix",
      basedOn: "Normal",
      quickFormat: true,
      run: {
        italics: true,
      },
    },
    {
      id: "MotionVotePrefix",
      name: "Motion Vote Prefix",
      basedOn: "Normal",
      quickFormat: true,
      run: {
        bold: true,
      },
    },
  ],
};

export const TopicHeaderCellShading: IShadingAttributesProperties = {
  fill: "b8cce4",
};

export const TopicHeaderCellMargins: ITableCellOptions["margins"] = {
  marginUnitType: WidthType.DXA,
  top: 100,
  bottom: 100,
  left: 200,
  right: 200,
};

export const CalendarCellMargins: ITableCellOptions["margins"] = {
  marginUnitType: WidthType.DXA,
  top: 10,
  bottom: 10,
  left: 75,
  right: 75,
};
