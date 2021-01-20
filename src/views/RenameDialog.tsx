import React from "react";

import {
  Dialog,
  DialogTitle,
  DialogContentText,
  DialogActions,
  TextField,
  DialogContent,
  Button,
} from "@material-ui/core";

interface RenameDialogProps {
  existingItems: string[];
  open: boolean;
  onClose: () => void;
  onRenamed: (newName: string) => void;
  initialName: string;

  confirmButtonText: string;
}

export default function RenameDialog(props: RenameDialogProps) {
  const [newName, setNewName] = React.useState("");

  React.useEffect(() => {
    setNewName(props.initialName);
  }, [props.initialName]);

  const isNameUnique = (name: string): boolean => {
    return !props.existingItems.includes(newName);
  };

  const hasUnsupportedSymbols = (name: string): boolean => {
    return Array.from(name).some((char) =>
      ["/", "\\", "?", "*", ":", "?", '"', "<", ">", "|"].includes(char)
    );
  };

  return (
    <Dialog
      open={props.open !== false}
      onClose={props.onClose}
      aria-labelledby="dialog-title"
    >
      <DialogTitle id="dialog-title">New Name</DialogTitle>
      <DialogContent>
        <DialogContentText hidden={isNameUnique(newName)}>
          Name should be unique.
        </DialogContentText>

        <DialogContentText hidden={!hasUnsupportedSymbols(newName)}>
          {`Name cannot contain any of the following characters: \\ / : * ? " < > |`}
        </DialogContentText>

        <DialogContentText hidden={newName.length > 0}>
          Empty names are not allowed.
        </DialogContentText>

        <TextField
          autoFocus
          margin="dense"
          value={newName}
          onChange={(event: { target: { value: string } }) => {
            setNewName(event.target.value);
          }}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose} color="primary">
          Cancel
        </Button>
        <Button
          onClick={() => {
            props.onRenamed(newName);
          }}
          disabled={
            hasUnsupportedSymbols(newName) ||
            !isNameUnique(newName) ||
            newName.length === 0
          }
          color="secondary"
        >
          {props.confirmButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
