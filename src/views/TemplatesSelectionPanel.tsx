import { Tabs, Tab, Button, makeStyles, Typography } from "@material-ui/core";

import { useConfirm } from "material-ui-confirm";

import { AppDispatch, useTypedSelector } from "../state/Store";
import { setActiveSubfolder } from "../state/Templates";

import path from "path";
import { useDispatch } from "react-redux";
import React from "react";

import fse from "fs-extra";
import RenameDialog from "./RenameDialog";

const useStyles = makeStyles({
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

  const dispatch: AppDispatch = useDispatch();

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

      <RenameDialog
        existingItems={templateFolders}
        open={dialogOpen !== false}
        initialName={
          dialogOpen === "new"
            ? "My Template"
            : templates.activeTemplatesFolder ?? ""
        }
        onRenamed={(newTeplateName) => {
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
