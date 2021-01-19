import {
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContentText,
  DialogActions,
  TextField,
  DialogContent,
  makeStyles,
  Typography,
} from "@material-ui/core";

import { useConfirm } from "material-ui-confirm";

import { AppDispatch, useTypedSelector } from "../state/Store";
import { setActiveSubfolder } from "../state/Templates";

import path from "path";
import { useDispatch } from "react-redux";
import React from "react";

import fse from "fs-extra";

const useStyles = makeStyles({
  conatiner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  buttons: {
    display: "flex",
  },
  tabs: {
    alignSelf: "flex-end",
  },
});

export default function TemplatesSelectionPanel() {
  const styles = useStyles();

  const confirm = useConfirm();

  const templates = useTypedSelector((state) => state.templates);
  const parentDirectory = useTypedSelector(
    (state) => state.settings.templatesPath
  );

  const templateFolders = Object.keys(templates.subfolders);
  const activeTemplateIndex = templateFolders.indexOf(
    templates.activeTemplatesFolder ?? ""
  );

  const [dialogOpen, setDialogOpen] = React.useState<"new" | "rename" | false>(
    false
  );
  const [newTeplateName, setNewTemplateName] = React.useState("My Template");

  const dispatch: AppDispatch = useDispatch();

  const isNameUnique = (name: string): boolean => {
    return !templateFolders.includes(newTeplateName);
  };

  const hasUnsupportedSymbols = (name: string): boolean => {
    return Array.from(name).some((char) =>
      ["/", "\\", "?", "*", ":", "?", '"', "<", ">", "|"].includes(char)
    );
  };

  return (
    <div className={styles.conatiner}>
      <Typography variant="h6">Templates</Typography>
      <div className={styles.buttons}>
        <Button
          color={
            templates.activeTemplatesFolder === undefined
              ? "secondary"
              : "default"
          }
          variant={
            templates.activeTemplatesFolder === undefined
              ? "contained"
              : "outlined"
          }
          size="small"
          onClick={() => {
            setDialogOpen("new");
            setNewTemplateName("My Template");
          }}
        >
          Add
        </Button>
        <Button
          size="small"
          variant="outlined"
          disabled={templates.activeTemplatesFolder === undefined}
          onClick={() => {
            setDialogOpen("rename");
            setNewTemplateName(
              path.basename(templates.activeTemplatesFolder ?? "")
            );
          }}
        >
          Rename
        </Button>
        <Button
          size="small"
          variant="outlined"
          disabled={templates.activeTemplatesFolder === undefined}
          onClick={async () => {
            try {
              if (!templates.activeTemplatesFolder) return;
              await confirm({
                description: `This will irreversibly delete "${path.basename(
                  templates.activeTemplatesFolder.toUpperCase()
                )}". Sure?`,
              });

              if (!templates.activeTemplatesFolder) return;
              await fse.remove(
                path.join(parentDirectory, templates.activeTemplatesFolder)
              );
            } catch (e) {
              console.error(e);
            }
          }}
        >
          Delete
        </Button>
      </div>

      <Dialog
        open={dialogOpen !== false}
        onClose={() => {
          setDialogOpen(false);
        }}
        aria-labelledby="dialog-title"
      >
        <DialogTitle id="dialog-title">New Template Name</DialogTitle>
        <DialogContent>
          <DialogContentText hidden={isNameUnique(newTeplateName)}>
            Template name should be unique.
          </DialogContentText>

          <DialogContentText hidden={!hasUnsupportedSymbols(newTeplateName)}>
            {`Template name cannot contain any of the following characters: \\ / : * ? " < > |`}
          </DialogContentText>

          <DialogContentText hidden={newTeplateName.length > 0}>
            Empty names are not allowed.
          </DialogContentText>

          <TextField
            autoFocus
            margin="dense"
            value={newTeplateName}
            onChange={(event: { target: { value: string } }) => {
              setNewTemplateName(event.target.value);
            }}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (dialogOpen === "rename") {
                if (!templates.activeTemplatesFolder) return;
                fse.move(
                  path.join(parentDirectory, templates.activeTemplatesFolder),
                  path.join(parentDirectory, newTeplateName)
                );
              } else if (dialogOpen === "new") {
                fse.ensureDir(path.join(parentDirectory, newTeplateName));
              }

              setDialogOpen(false);
            }}
            disabled={
              hasUnsupportedSymbols(newTeplateName) ||
              !isNameUnique(newTeplateName) ||
              newTeplateName.length === 0
            }
            color="secondary"
          >
            {dialogOpen === "new" ? "Create" : "Rename"}
          </Button>
        </DialogActions>
      </Dialog>
      <Tabs
        className={styles.tabs}
        orientation="vertical"
        variant="scrollable"
        value={activeTemplateIndex}
        onChange={(event: React.ChangeEvent<{}>, newValue: number) => {
          dispatch(
            setActiveSubfolder({ folderName: templateFolders[newValue] })
          );
        }}
        aria-label="Active Template Selector"
      >
        {templateFolders.map((template) => (
          <Tab key={template} label={path.basename(template)}></Tab>
        ))}
      </Tabs>
    </div>
  );
}
