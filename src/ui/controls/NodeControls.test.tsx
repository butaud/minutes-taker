import { NodeControls } from "./NodeControls";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

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
});
