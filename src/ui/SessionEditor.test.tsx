import { SessionEditor } from "./SessionEditor";
import { StoredSession } from "../store/SessionStore";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import * as SessionStoreContext from "./context/SessionStoreContext";

describe("SessionEditor", () => {
  describe("metadata", () => {
    it.todo("shows the organization name");
    it.todo("shows the meeting title");
    it.todo("shows the meeting location");
    it.todo("shows the meeting date and time");
    it.todo("allows editing the organization name");
    it.todo("allows editing the meeting title");
    it.todo("allows editing the meeting location");
    it.todo("allows editing the meeting date and time");
    it.todo("does not apply changes if cancel is clicked");
  });

  describe("attendance", () => {
    it.todo("shows the list of members in attendance");
    it.todo("shows the list of members not in attendance");
    it.todo("shows the administrators in attendance");

    it.todo("allows adding members to attendance");
    it.todo(
      "shows an error message if new member does not have first and last name"
    );
    it.todo("allows removing members from attendance");
    it.todo(
      "doesn't allow removing members from attendance if they are referenced in a note"
    );
    it.todo("allows adding members to not in attendance");
    it.todo("allows removing members from not in attendance");
    it.todo(
      "doesn't allow removing members from not in attendance if they are referenced in a note"
    );
    it.todo("allows adding administrators to attendance");
    it.todo("allows removing administrators from attendance");
    it.todo(
      "doesn't allow removing administrators from attendance if they are referenced in a note"
    );
  });

  describe("topics", () => {
    it.todo("shows the list of topics");
    it.todo("shows the topic title");
    it.todo("shows the topic start time");
    it.todo("shows the topic duration");
    it.todo("allows editing the topic title");
    it.todo("allows editing the topic start time");
    it.todo("allows editing the topic duration");
    it.todo("does not apply changes if cancel is clicked");
    it.todo("allows adding a topic");
    it.todo("automatically sets a new topic's start time to the current time");
    it.todo("automatically sets the previous topic's duration");
    it.todo("allows deleting a topic");
    it.todo("allows reordering topics");
  });

  describe("notes", () => {
    it.todo("shows the list of notes under a topic");
    it.todo("allows adding a note");
    it.todo("allows deleting a note");
    it.todo("allows reordering notes");
  });

  describe("text notes", () => {
    it.todo("shows the text of the note");
    it.todo("allows editing the text of the note");
    it.todo("does not apply changes if cancel is clicked");
    it.todo("allows adding a new text note");
    it.todo("allows cancelling a new text note");
  });

  describe("action items", () => {
    it.todo("shows the assignee of the action item");
    it.todo("shows the text of the action item");
    it.todo("shows the due date of the action item if it has one");
    it.todo("allows editing the assignee of the action item");
    it.todo("allows editing the text of the action item");
    it.todo("allows editing the due date of the action item");
    it.todo("does not apply changes if cancel is clicked");
    it.todo("allows adding a new action item");
    it.todo("shows an error message if the new action item does not have text");
    it.todo(
      "shows an error message if the new action item does not have an assignee"
    );
    it.todo("allows cancelling a new action item");
  });

  describe("motions", () => {
    it.todo("shows the mover of the motion");
    it.todo("shows the seconder of the motion");
    it.todo("shows the text of the motion");
    it.todo("shows the status of the motion");
    it.todo("shows the vote counts of the motion if it is passed or failed");
    it.todo("allows editing the mover of the motion");
    it.todo("allows editing the seconder of the motion");
    it.todo("allows editing the text of the motion");
    it.todo("allows editing the status of the motion");
    it.todo(
      "allows editing the vote counts of the motion if it is passed or failed"
    );
    it.todo("does not apply changes if cancel is clicked");
    it.todo("allows adding a new motion");
    it.todo("shows an error message if the new motion does not have text");
    it.todo("shows an error message if the new motion does not have a mover");
    it.todo(
      "shows an error message if the new motion does not have a seconder"
    );
    it.todo("allows cancelling a new motion");
  });
  describe("overall", () => {
    it.todo("allows undoing changes");
    it.todo("allows redoing undone changes");
    it.todo("clears redo history when a new change is made");
  });
});
