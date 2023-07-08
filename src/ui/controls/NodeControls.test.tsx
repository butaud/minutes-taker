import { NodeControls } from "./NodeControls";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

describe("NodeControls", () => {
  it("renders without crashing", () => {
    render(
      <NodeControls isEditing={false} onEdit={() => {}}>
        <div>Test</div>
      </NodeControls>
    );
    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  describe("showing and hiding controls when not editing", () => {
    it("shows no controls when not hovering", () => {
      render(
        <NodeControls isEditing={false} onEdit={() => {}}>
          <div>Test</div>
        </NodeControls>
      );
      expect(screen.queryByText("Edit")).not.toBeInTheDocument();
      expect(screen.queryByText("Delete")).not.toBeInTheDocument();
    });

    it("shows edit when hovering", async () => {
      const user = userEvent.setup();

      render(
        <NodeControls isEditing={false} onEdit={() => {}}>
          <div>Test</div>
        </NodeControls>
      );

      await user.hover(screen.getByText("Test"));
      expect(screen.getByText("Edit")).toBeInTheDocument();
    });

    it("does not show delete when onDelete is not provided", async () => {
      const user = userEvent.setup();

      render(
        <NodeControls isEditing={false} onEdit={() => {}}>
          <div>Test</div>
        </NodeControls>
      );

      await user.hover(screen.getByText("Test"));
      expect(screen.queryByText("Delete")).not.toBeInTheDocument();
    });

    it("shows delete when onDelete is provided", async () => {
      const user = userEvent.setup();

      render(
        <NodeControls isEditing={false} onEdit={() => {}} onDelete={() => {}}>
          <div>Test</div>
        </NodeControls>
      );

      await user.hover(screen.getByText("Test"));
      expect(screen.getByText("Delete")).toBeInTheDocument();
    });
  });

  describe("showing and hiding controls when editing", () => {
    it("shows no controls when not hovering", () => {
      render(
        <NodeControls isEditing={true} onEdit={() => {}}>
          <div>Test</div>
        </NodeControls>
      );
      expect(screen.queryByText("Save")).not.toBeInTheDocument();
      expect(screen.queryByText("Cancel")).not.toBeInTheDocument();
      expect(screen.queryByText("Stop Editing")).not.toBeInTheDocument();
    });

    it("shows save and cancel when hovering if onSave and onCancel are provided", async () => {
      const user = userEvent.setup();

      render(
        <NodeControls
          isEditing={true}
          onEdit={() => {}}
          onSave={() => {}}
          onCancel={() => {}}
        >
          <div>Test</div>
        </NodeControls>
      );

      await user.hover(screen.getByText("Test"));
      expect(screen.getByText("Save")).toBeInTheDocument();
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });

    it("does not show save and cancel when hovering if onSave and onCancel are not provided", async () => {
      const user = userEvent.setup();

      render(
        <NodeControls isEditing={true} onEdit={() => {}}>
          <div>Test</div>
        </NodeControls>
      );

      await user.hover(screen.getByText("Test"));
      expect(screen.queryByText("Save")).not.toBeInTheDocument();
      expect(screen.queryByText("Cancel")).not.toBeInTheDocument();
    });

    it("shows stop editing when hovering if onStopEditing is provided", async () => {
      const user = userEvent.setup();

      render(
        <NodeControls
          isEditing={true}
          onEdit={() => {}}
          onStopEditing={() => {}}
        >
          <div>Test</div>
        </NodeControls>
      );

      await user.hover(screen.getByText("Test"));
      expect(screen.getByText("Stop Editing")).toBeInTheDocument();
    });

    it("does not show stop editing when hovering if onStopEditing is not provided", async () => {
      const user = userEvent.setup();

      render(
        <NodeControls isEditing={true} onEdit={() => {}}>
          <div>Test</div>
        </NodeControls>
      );

      await user.hover(screen.getByText("Test"));
      expect(screen.queryByText("Stop Editing")).not.toBeInTheDocument();
    });
  });

  describe("button callbacks", () => {
    it("calls onEdit when edit is clicked", async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();

      render(
        <NodeControls isEditing={false} onEdit={onEdit}>
          <div>Test</div>
        </NodeControls>
      );

      await user.hover(screen.getByText("Test"));
      fireEvent.click(screen.getByText("Edit"));

      expect(onEdit).toHaveBeenCalled();
    });

    it("calls onDelete when delete is clicked", async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();

      render(
        <NodeControls isEditing={false} onEdit={() => {}} onDelete={onDelete}>
          <div>Test</div>
        </NodeControls>
      );

      await user.hover(screen.getByText("Test"));
      fireEvent.click(screen.getByText("Delete"));

      expect(onDelete).toHaveBeenCalled();
    });

    it("calls onSave when save is clicked", async () => {
      const user = userEvent.setup();
      const onSave = vi.fn();

      render(
        <NodeControls isEditing={true} onEdit={() => {}} onSave={onSave}>
          <div>Test</div>
        </NodeControls>
      );

      await user.hover(screen.getByText("Test"));
      fireEvent.click(screen.getByText("Save"));

      expect(onSave).toHaveBeenCalled();
    });

    it("calls onCancel when cancel is clicked", async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();

      render(
        <NodeControls isEditing={true} onEdit={() => {}} onCancel={onCancel}>
          <div>Test</div>
        </NodeControls>
      );

      await user.hover(screen.getByText("Test"));
      fireEvent.click(screen.getByText("Cancel"));

      expect(onCancel).toHaveBeenCalled();
    });

    it("calls onStopEditing when stop editing is clicked", async () => {
      const user = userEvent.setup();
      const onStopEditing = vi.fn();

      render(
        <NodeControls
          isEditing={true}
          onEdit={() => {}}
          onStopEditing={onStopEditing}
        >
          <div>Test</div>
        </NodeControls>
      );

      await user.hover(screen.getByText("Test"));
      fireEvent.click(screen.getByText("Stop Editing"));

      expect(onStopEditing).toHaveBeenCalled();
    });
  });
});
