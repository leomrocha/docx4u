import { Tabs, Tab, Button, makeStyles, Typography } from "@material-ui/core";

import { useConfirm } from "material-ui-confirm";

import { AppDispatch, useTypedSelector } from "../state/Store";
import { setActiveSubfolder } from "../state/Templates";

import path from "path";
import { useDispatch } from "react-redux";
import React from "react";

import fse from "fs-extra";
import RenameDialog from "./RenameDialog";

const useStyles = makeStyles((theme) => ({
  conatiner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  buttons: {
    display: "flex",
    "& button": {
      margin: 3,
    },
  },
  tabs: {
    alignSelf: "flex-end",
  },
}));

export default function Folders() {
  const styles = useStyles();

  const confirm = useConfirm();

  const templates = useTypedSelector((state) => state.templates);

  const parentDirectory = useTypedSelector(
    (state) => state.settings.templatesPath
  );

  const [dialogOpen, setDialogOpen] = React.useState<"new" | "rename" | false>(
    false
  );

  const dispatch: AppDispatch = useDispatch();

  if (!templates) return null;
  const templateFolders = Object.keys(templates.subfolders);
  const activeTemplateIndex = templateFolders.indexOf(
    templates.activeFolder ?? ""
  );

  return (
    <div className={styles.conatiner}>
      <Typography variant="h6">Folders</Typography>
      <div className={styles.buttons}>
        <Button
          color={templates.activeFolder === undefined ? "secondary" : "default"}
          variant={
            templates.activeFolder === undefined ? "contained" : "outlined"
          }
          size="small"
          onClick={() => {
            setDialogOpen("new");
          }}
        >
          Add
        </Button>
        <Button
          size="small"
          variant="outlined"
          disabled={templates.activeFolder === undefined}
          onClick={() => {
            setDialogOpen("rename");
          }}
        >
          Rename
        </Button>
        <Button
          size="small"
          variant="outlined"
          disabled={templates.activeFolder === undefined}
          onClick={async () => {
            try {
              if (!templates.activeFolder) return;
              await confirm({
                description: `This will irreversibly delete "${path.basename(
                  templates.activeFolder.toUpperCase()
                )}". Sure?`,
              });

              if (!templates.activeFolder) return;
              await fse.remove(
                path.join(parentDirectory, templates.activeFolder)
              );
            } catch (e) {
              console.error(e);
            }
          }}
        >
          Delete
        </Button>
      </div>

      <RenameDialog
        existingItems={templateFolders}
        open={dialogOpen !== false}
        initialName={
          dialogOpen === "new" ? "My Template" : templates.activeFolder ?? ""
        }
        onRenamed={(newTeplateName) => {
          if (dialogOpen === "rename") {
            if (!templates.activeFolder) return;
            fse.move(
              path.join(parentDirectory, templates.activeFolder),
              path.join(parentDirectory, newTeplateName)
            );
          } else if (dialogOpen === "new") {
            fse.ensureDir(path.join(parentDirectory, newTeplateName));
          }

          setDialogOpen(false);
        }}
        confirmButtonText={dialogOpen === "new" ? "Create" : "Rename"}
        onClose={() => {
          setDialogOpen(false);
        }}
      ></RenameDialog>
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
