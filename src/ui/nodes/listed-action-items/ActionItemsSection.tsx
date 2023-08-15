import { FC } from "react";
import {
  StoredActionItemNote,
  StoredPastActionItem,
  StoredTopic,
} from "../../../store/types";
import "./ActionItemsSection.css";
import {
  NewPastActionItemNode,
  PastActionItemNode,
} from "./PastActionItemNode";
import { SessionActionItemNode } from "./SessionActionItemNode";

export type ActionItemsSectionProps = {
  pastActionItems: readonly StoredPastActionItem[];
  topics: readonly StoredTopic[];
};

export const ActionItemsSection: FC<ActionItemsSectionProps> = ({
  pastActionItems,
  topics,
}) => {
  return (
    <div className="actionItems">
      <h3>Carried Forward Action Items</h3>
      <ul className="past">
        {pastActionItems.map((item) => (
          <PastActionItemNode key={item.id} item={item} />
        ))}
        <NewPastActionItemNode />
      </ul>
      <h3>New Action Items</h3>
      <ul>
        {topics.flatMap((topic) =>
          topic.notes
            .filter((n) => n.type === "actionItem")
            .map((item) => {
              const actionItem = item as StoredActionItemNote;
              return (
                <SessionActionItemNode
                  key={actionItem.id}
                  actionItem={actionItem}
                />
              );
            })
        )}
      </ul>
    </div>
  );
};
