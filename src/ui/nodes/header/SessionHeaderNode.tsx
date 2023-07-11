import React, { useState } from "react";
import { StoredSessionMetadata } from "../../../store/SessionStore";
import { NodeControls } from "../../controls/NodeControls";
import { useSessionStore } from "../../context/SessionStoreContext";

export const SessionHeaderNode: React.FC<{
  metadata: StoredSessionMetadata;
}> = ({ metadata }) => {
  const [editing, setEditing] = useState(false);
  const [organization, setOrganization] = useState(metadata.organization);
  const [title, setTitle] = useState(metadata.title);
  const [location, setLocation] = useState(metadata.location);
  const [startTime, setStartTime] = useState(metadata.startTime);

  const sessionStore = useSessionStore();

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = () => {
    setEditing(false);
    sessionStore.updateMetadata({
      ...metadata,
      organization,
      title,
      location,
      startTime,
    });
  };

  const handleCancel = () => {
    setEditing(false);
    setOrganization(metadata.organization);
    setTitle(metadata.title);
    setLocation(metadata.location);
    setStartTime(metadata.startTime);
  };

  const handleOrganizationChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setOrganization(event.target.value);
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(event.target.value);
  };

  const handleStartTimeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setStartTime(new Date(event.target.value));
  };

  return (
    <NodeControls
      isEditing={editing}
      onEdit={handleEdit}
      onSave={handleSave}
      onCancel={handleCancel}
    >
      <h1>
        {editing ? (
          <input
            type="text"
            aria-label="Organization"
            value={organization}
            onChange={handleOrganizationChange}
          />
        ) : (
          metadata.organization
        )}
      </h1>
      <h2>
        {editing ? (
          <>
            <input
              type="text"
              aria-label="Title"
              value={title}
              onChange={handleTitleChange}
            />{" "}
            <input
              type="text"
              aria-label="Location"
              value={location}
              onChange={handleLocationChange}
            />{" "}
            <input
              type="datetime-local"
              aria-label="Start time"
              value={startTime.toISOString().slice(0, -8)}
              onChange={handleStartTimeChange}
            />
          </>
        ) : (
          <>
            {metadata.title}: {metadata.location},{" "}
            {metadata.startTime.toLocaleString(navigator.language, {
              timeStyle: "short",
              dateStyle: "short",
            })}
          </>
        )}
      </h2>
    </NodeControls>
  );
};
