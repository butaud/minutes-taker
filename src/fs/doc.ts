import { Document, Packer, Paragraph, TextRun } from "docx";
import { Session } from "minutes-model";

export const exportSessionToDocx: (session: Session) => Promise<Blob> = (
  session
) => {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [new TextRun(session.metadata.title)],
          }),
          ...session.topics.map((topic) => {
            return new Paragraph({
              children: [new TextRun(topic.title)],
            });
          }),
        ],
      },
    ],
  });
  return Packer.toBlob(doc);
};
