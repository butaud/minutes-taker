import React, { useState } from "react";
import { StoredSessionMetadata } from "../../../store/types";
import { FormNodeControls, NodeControls } from "../../controls/NodeControls";
import { useSessionStore } from "../../context/SessionStoreContext";

export const SessionHeaderNode: React.FC<{
  metadata: StoredSessionMetadata;
}> = ({ metadata }) => {
  const [editing, setEditing] = useState(false);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleStopEditing = () => {
    setEditing(false);
  };

  if (editing) {
    return (
      <SessionHeaderEditor
        metadata={metadata}
        stopEditing={handleStopEditing}
      />
    );
  } else {
    return <SessionHeaderDisplay metadata={metadata} onEdit={handleEdit} />;
  }
};

export const SessionHeaderDisplay: React.FC<{
  metadata: StoredSessionMetadata;
  onEdit: () => void;
}> = ({ metadata, onEdit }) => {
  return (
    <>
      <NodeControls as="h1" onEdit={onEdit}>
        {metadata.organization}
      </NodeControls>
      <NodeControls as="h2" onEdit={onEdit}>
        {metadata.title} - {metadata.subtitle}: {metadata.location},{" "}
        {metadata.startTime.toLocaleString(undefined, {
          timeStyle: "short",
          dateStyle: "short",
          timeZone: "UTC",
        })}
      </NodeControls>
    </>
  );
};

type SessionHeaderEditorProps = {
  metadata: StoredSessionMetadata;
  stopEditing: () => void;
};

type SessionHeaderDraft = Partial<StoredSessionMetadata>;

export const SessionHeaderEditor: React.FC<SessionHeaderEditorProps> = ({
  metadata,
  stopEditing,
}) => {
  const [sessionHeaderDraft, setSessionHeaderDraft] =
    useState<SessionHeaderDraft>({ ...metadata });
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const sessionStore = useSessionStore();

  const handleSubmit = () => {
    if (!sessionHeaderDraft.organization) {
      setErrorMessage("Organization cannot be empty.");
      return;
    }
    if (!sessionHeaderDraft.title) {
      setErrorMessage("Title cannot be empty.");
      return;
    }
    if (!sessionHeaderDraft.subtitle) {
      setErrorMessage("Subtitle cannot be empty.");
      return;
    }
    if (!sessionHeaderDraft.location) {
      setErrorMessage("Location cannot be empty.");
      return;
    }
    if (!sessionHeaderDraft.startTime) {
      setErrorMessage("Start time cannot be empty.");
      return;
    }
    setErrorMessage(undefined);
    sessionStore.updateMetadata({
      organization: sessionHeaderDraft.organization,
      title: sessionHeaderDraft.title,
      subtitle: sessionHeaderDraft.subtitle,
      location: sessionHeaderDraft.location,
      startTime: sessionHeaderDraft.startTime,
    });
    stopEditing();
  };

  const handleCancel = () => {
    setSessionHeaderDraft({ ...metadata });
    stopEditing();
  };

  const handleOrganizationChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSessionHeaderDraft({
      ...sessionHeaderDraft,
      organization: event.target.value,
    });
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSessionHeaderDraft({ ...sessionHeaderDraft, title: event.target.value });
  };

  const handleSubtitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSessionHeaderDraft({
      ...sessionHeaderDraft,
      subtitle: event.target.value,
    });
  };

  const handleLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSessionHeaderDraft({
      ...sessionHeaderDraft,
      location: event.target.value,
    });
  };

  const handleStartTimeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const timestamp = Date.parse(event.target.value + "Z");
    if (!isNaN(timestamp)) {
      const startTime = new Date(timestamp);
      setSessionHeaderDraft({
        ...sessionHeaderDraft,
        startTime: startTime,
      });
    }
  };

  return (
    <FormNodeControls onCancel={handleCancel} onSubmit={handleSubmit}>
      {errorMessage && <p role="alert">{errorMessage}</p>}
      <h1>
        <input
          type="text"
          aria-label="Organization"
          value={sessionHeaderDraft.organization}
          onChange={handleOrganizationChange}
        />
      </h1>
      <h2>
        <input
          type="text"
          aria-label="Title"
          value={sessionHeaderDraft.title}
          onChange={handleTitleChange}
        />{" "}
        <input
          type="text"
          aria-label="Subtitle"
          value={sessionHeaderDraft.subtitle}
          onChange={handleSubtitleChange}
        />{" "}
        <input
          type="text"
          aria-label="Location"
          value={sessionHeaderDraft.location}
          onChange={handleLocationChange}
        />{" "}
        <input
          type="datetime-local"
          aria-label="Start time"
          value={sessionHeaderDraft.startTime?.toISOString().slice(0, -8) ?? ""}
          onChange={handleStartTimeChange}
        />
      </h2>
    </FormNodeControls>
  );
};
