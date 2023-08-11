import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableCell,
  TableRow,
  WidthType,
  ExternalHyperlink,
} from "docx";
import {
  ActionItemNote,
  Calendar,
  CalendarMonthEntry,
  Committee,
  MotionNote,
  Person,
  Session,
  SessionMetadata,
  TextNote,
  Topic,
} from "minutes-model";
import {
  CalendarCellMargins,
  Styles,
  TopicHeaderCellMargins,
  TopicHeaderCellShading,
} from "./style";
import { isActionItemNote, isTextNote } from "../util/types";

const makeSpeakerReference = (person: Person): TextRun => {
  return new TextRun({
    text: `${person.title} ${person.lastName}`,
    style: "SpeakerReference",
  });
};

const sessionHeader = (metadata: SessionMetadata): Paragraph[] => {
  const titleLine = `${metadata.title} - ${metadata.subtitle}: ${
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
        new TextRun({ text: "DRAFT", style: "MinuteStateDraft" }),
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

const makeMonthTableRow = (monthEntry: CalendarMonthEntry): TableRow => {
  return new TableRow({
    children: [
      new TableCell({
        children: [new Paragraph(monthEntry.month)],
        width: {
          size: 15,
          type: WidthType.PERCENTAGE,
        },
        margins: CalendarCellMargins,
      }),
      new TableCell({
        children: monthEntry.items.map((item) => {
          return new Paragraph({
            children: [
              new TextRun({
                text: item.text,
                strike: item.completed,
              }),
            ],
          });
        }),
        width: {
          size: 85,
          type: WidthType.PERCENTAGE,
        },
        margins: CalendarCellMargins,
      }),
    ],
  });
};

const makeCalendar = (calendar: Calendar): (Paragraph | Table)[] => {
  return [
    new Paragraph({
      children: [new TextRun("Board Calendar Items")],
      style: "CalendarHeader",
    }),
    new Table({
      rows: calendar.map(makeMonthTableRow),
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
    }),
  ];
};

const makeCallToOrderParagraph = (session: Session): Paragraph[] => {
  const actualStartTime = session.topics[0].startTime;
  const formattedStartTime = actualStartTime.toLocaleTimeString(undefined, {
    timeStyle: "short",
  });
  const locationTextRun = new TextRun({
    text: `The meeting was held at the ${session.metadata.location}. `,
  });
  const paragraphTitle = new Paragraph({
    children: [
      new TextRun({
        text: session.metadata.subtitle,
      }),
    ],
    heading: HeadingLevel.HEADING_1,
  });
  const paragraphText = session.metadata.caller
    ? new Paragraph({
        children: [
          new TextRun({
            text: `The meeting was called by ${session.metadata.caller.role}. `,
          }),
          locationTextRun,
          makeSpeakerReference(session.metadata.caller.person),
          new TextRun({
            text: ` called the session to order at ${formattedStartTime}.`,
          }),
        ],
      })
    : new Paragraph({
        children: [
          locationTextRun,
          new TextRun({
            text: `The session was called to order at ${formattedStartTime}.`,
          }),
        ],
      });

  return [paragraphTitle, paragraphText];
};

const makeTopicHeader = (topic: Topic): Table => {
  const cells: TableCell[] = [
    new TableCell({
      children: [
        new Paragraph(
          topic.startTime.toLocaleTimeString(undefined, { timeStyle: "short" })
        ),
      ],
      shading: TopicHeaderCellShading,
      width: {
        size: 15,
        type: WidthType.PERCENTAGE,
      },
      margins: TopicHeaderCellMargins,
    }),
  ];
  if (topic.durationMinutes) {
    cells.push(
      new TableCell({
        children: [new Paragraph(topic.durationMinutes.toString())],
        shading: TopicHeaderCellShading,
        width: {
          size: 5,
          type: WidthType.PERCENTAGE,
        },
        margins: TopicHeaderCellMargins,
      })
    );
  }
  cells.push(
    new TableCell({
      children: [new Paragraph(topic.title)],
      shading: TopicHeaderCellShading,
      margins: TopicHeaderCellMargins,
    })
  );
  return new Table({
    rows: [
      new TableRow({
        children: cells,
      }),
    ],
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
  });
};

const makeTextNoteParagraphs = (note: TextNote): Paragraph[] => [
  new Paragraph({
    children: [new TextRun(note.text)],
    style: "NoteFinalLine",
  }),
];

const makeActionItemParagraphs = (note: ActionItemNote): Paragraph[] => [
  new Paragraph({
    children: [
      new TextRun({
        text: "Action item: ",
        style: "ActionItemPrefix",
      }),
      makeSpeakerReference(note.assignee),
      new TextRun({
        text: ` ${note.text}`,
      }),
    ],
    style: "NoteFinalLine",
  }),
];

const makeMoverParagraph = (note: MotionNote): Paragraph =>
  new Paragraph({
    children: [
      makeSpeakerReference(note.mover),
      new TextRun({
        text: ` moved ${note.text}`,
      }),
    ],
    style: "MotionInternal",
  });

const makeSeconderParagraph = (note: MotionNote): Paragraph =>
  new Paragraph({
    children: [
      makeSpeakerReference(note.seconder),
      new TextRun({
        text: " seconded.",
      }),
    ],
    style: "MotionInternal",
  });

const makeVoteParagraph = (note: MotionNote): Paragraph => {
  const voteTallies = [];
  if (note.inFavorCount) {
    voteTallies.push(`${note.inFavorCount} in favor`);
  }
  if (note.opposedCount) {
    voteTallies.push(`${note.opposedCount} opposed`);
  }
  if (note.abstainedCount) {
    voteTallies.push(`${note.abstainedCount} abstained`);
  }
  return new Paragraph({
    children: [
      new TextRun({
        text: "Vote:",
        style: "MotionVotePrefix",
      }),
      new TextRun({
        text: ` ${voteTallies.join(", ")}`,
      }),
    ],
    style: "MotionInternal",
  });
};

const makeOutcomeParagraph = (note: MotionNote): Paragraph => {
  let outcomeText: string;
  switch (note.outcome) {
    case "active":
      outcomeText = "Motion is under discussion.";
      break;
    case "passed":
      outcomeText = "Motion passes.";
      break;
    case "failed":
      outcomeText = "Motion fails.";
      break;
    case "withdrawn":
      outcomeText = "Motion is withdrawn.";
      break;
    case "tabled":
      outcomeText = "Motion is tabled.";
      break;
  }
  return new Paragraph({
    children: [
      new TextRun({
        text: outcomeText,
      }),
    ],
    style: "MotionOutcome",
  });
};

const makeMotionParagraphs = (note: MotionNote): Paragraph[] => {
  const motionParagraphs: Paragraph[] = [];
  motionParagraphs.push(makeMoverParagraph(note));
  motionParagraphs.push(makeSeconderParagraph(note));
  if (note.outcome === "failed" || note.outcome === "passed") {
    motionParagraphs.push(makeVoteParagraph(note));
  }
  motionParagraphs.push(makeOutcomeParagraph(note));
  return motionParagraphs;
};

const makeTopicBody = (topic: Topic): Paragraph[] =>
  topic.notes.flatMap((note) => {
    if (isTextNote(note)) {
      return makeTextNoteParagraphs(note);
    } else if (isActionItemNote(note)) {
      return makeActionItemParagraphs(note);
    } else {
      return makeMotionParagraphs(note);
    }
  });

const makeCommitteeBulletPoint = (committee: Committee): Paragraph => {
  return new Paragraph({
    children: [new TextRun(`${committee.name} (${committee.type})`)],
    bullet: {
      level: 0,
    },
  });
};

const makeCommitteesSection = (
  committees: Committee[],
  committeeDocUrl?: string
): Paragraph[] => {
  const headerChildren: (TextRun | ExternalHyperlink)[] = [
    new TextRun("Active Committees: "),
  ];
  if (committeeDocUrl) {
    headerChildren.push(
      new ExternalHyperlink({
        children: [
          new TextRun({ text: "(Committees.docx)", style: "Hyperlink" }),
        ],
        link: committeeDocUrl,
      })
    );
  }
  return [
    new Paragraph({
      children: headerChildren,
      style: "CommitteeHeader",
    }),
    ...committees.map(makeCommitteeBulletPoint),
  ];
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
          ...makeCallToOrderParagraph(session),
          ...makeCalendar(session.calendar),
          emptyLine(),
          ...session.topics.flatMap((topic) => [
            makeTopicHeader(topic),
            ...makeTopicBody(topic),
          ]),
          ...makeCommitteesSection(
            session.committees,
            session.metadata.committeeDocUrl
          ),
        ],
      },
    ],
    styles: Styles,
  });
  return Packer.toBlob(doc);
};
