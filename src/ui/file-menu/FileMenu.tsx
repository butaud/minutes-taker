import { FC, useState } from "react";
import "./FileMenu.css";

export type FileMenuProps = {
  onLoadFakeData: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onLoad: () => void;
  onExport: () => void;
  onInsert: () => void;
  onUndo: () => void;
  onRedo: () => void;
};

export const FileMenu: FC<FileMenuProps> = ({
  onLoadFakeData,
  onSave,
  onSaveAs,
  onLoad,
  onExport,
  onInsert,
  onUndo,
  onRedo,
}) => {
  const [expanded, setExpanded] = useState(false);
  const fileButtons = [
    { label: "Save", action: onSave },
    { label: "Save as", action: onSaveAs },
    { label: "Load", action: onLoad },
    { label: "Export", action: onExport },
    { label: "Load Fake Data", action: onLoadFakeData },
  ];
  const editButtons = [
    { label: "Insert", action: onInsert },
    { label: "Undo", action: onUndo },
    { label: "Redo", action: onRedo },
  ];

  const closeMenu = () => {
    setExpanded(false);
  };

  return (
    <div className={"menu " + (expanded ? "expanded" : "")}>
      <i className="material-icons" onClick={() => setExpanded(!expanded)}>
        menu
      </i>
      {expanded && (
        <ul>
          {fileButtons.map((button) => (
            <MenuButton
              key={button.label}
              action={button.action}
              label={button.label}
              closeMenu={closeMenu}
            />
          ))}
          <hr />
          {editButtons.map((button) => (
            <MenuButton
              key={button.label}
              action={button.action}
              label={button.label}
              closeMenu={closeMenu}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

type MenuButtonProps = {
  action: () => void;
  label: string;
  closeMenu: () => void;
};

export const MenuButton: FC<MenuButtonProps> = ({
  action,
  label,
  closeMenu,
}) => {
  return (
    <li>
      <button
        onClick={() => {
          action();
          closeMenu();
        }}
      >
        {label}
      </button>
    </li>
  );
};
