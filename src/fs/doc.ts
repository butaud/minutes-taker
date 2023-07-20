import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableCell,
  TableRow,
} from "docx";
import { Person, Session, SessionMetadata, Topic } from "minutes-model";

const THEME = {
  warning: "c0504d",
};

const sessionHeader = (metadata: SessionMetadata): Paragraph[] => {
  const titleLine = `${metadata.title}: ${
    metadata.location
  }, ${metadata.startTime.toLocaleDateString()}`;
  return [
    new Paragraph({
      children: [new TextRun(metadata.organization)],
      heading: HeadingLevel.HEADING_1,
    }),
    new Paragraph({
      children: [new TextRun({ text: titleLine, bold: true })],
      heading: HeadingLevel.HEADING_2,
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Minutes: ", bold: true }),
        new TextRun({ text: "DRAFT", color: THEME.warning }),
      ],
      heading: HeadingLevel.HEADING_2,
    }),
  ];
};

const makeAttendanceLine = (name: string, people: Person[]): Paragraph => {
  return new Paragraph({
    children: [
      new TextRun({ text: `${name}: `, bold: true }),
      new TextRun(people.map((p) => p.lastName).join(", ")),
    ],
  });
};

const attendanceSection = (metadata: SessionMetadata): Paragraph[] => {
  return [
    makeAttendanceLine("Members in attendance", metadata.membersPresent),
    makeAttendanceLine("Members absent", metadata.membersAbsent),
    makeAttendanceLine("Administration", metadata.administrationPresent),
  ];
};

const makeTopicHeader = (topic: Topic): Table => {
  const cells: TableCell[] = [
    new TableCell({
      children: [
        new Paragraph(
          topic.startTime.toLocaleTimeString(undefined, { timeStyle: "short" })
        ),
      ],
    }),
  ];
  if (topic.durationMinutes) {
    cells.push(
      new TableCell({
        children: [new Paragraph(topic.durationMinutes.toString())],
      })
    );
  }
  cells.push(new TableCell({ children: [new Paragraph(topic.title)] }));
  return new Table({
    rows: [
      new TableRow({
        children: cells,
      }),
    ],
  });
};

const emptyLine = () => new Paragraph({ children: [new TextRun("")] });

export const exportSessionToDocx: (session: Session) => Promise<Blob> = (
  session
) => {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          ...sessionHeader(session.metadata),
          emptyLine(),
          ...attendanceSection(session.metadata),
          emptyLine(),
          ...session.topics.flatMap((topic) => [
            makeTopicHeader(topic),
            emptyLine(),
          ]),
        ],
      },
    ],
  });
  return Packer.toBlob(doc);
};
