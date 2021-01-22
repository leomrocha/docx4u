import {
  Button,
  createStyles,
  fade,
  makeStyles,
  Theme,
  Typography,
  withStyles,
} from "@material-ui/core";

import FolderIcon from "@material-ui/icons/Folder";
import FolderOpenIcon from "@material-ui/icons/FolderOpen";

import { useConfirm } from "material-ui-confirm";

import { AppDispatch, useTypedSelector } from "../state/Store";
import { setActiveSubfolder } from "../state/Templates";

import path from "path";
import { useDispatch } from "react-redux";
import React from "react";

import fse from "fs-extra";
import RenameDialog from "./RenameDialog";
import { TreeItem, TreeItemProps, TreeView } from "@material-ui/lab";

import FileList from "./FileList";

const useStyles = makeStyles((theme) => ({
  conatiner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  buttons: {
    display: "flex",
    "& button": {
      margin: 3,
    },
  },

  fileTreeScrallableContainer: {
    height: "100%",
    overflowY: "scroll",
  },
}));

const StyledTreeItem = withStyles((theme: Theme) =>
  createStyles({
    iconContainer: {
      "& .close": {
        opacity: 0.3,
      },
    },
    content: {
      textAlign: "left",
    },
    root: {
      paddingLeft: 20,
    },

    group: {
      marginLeft: 7,
      paddingLeft: 5,
      borderLeft: `1px dashed ${fade(theme.palette.text.primary, 0.4)}`,
    },
  })
)((props: TreeItemProps) => <TreeItem {...props} />);

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

  const scrollableContainerRef = React.useRef(null);

  if (!templates) return null;
  const folders = Object.keys(templates.subfolders);

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
        existingItems={folders}
        open={dialogOpen !== false}
        initialName={
          dialogOpen === "new" ? "My Folder" : templates.activeFolder ?? ""
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

      <div
        ref={scrollableContainerRef}
        className={styles.fileTreeScrallableContainer}
      >
        <TreeView expanded={[templates.activeFolder ?? ""]}>
          {folders.map((folder) => (
            <StyledTreeItem
              icon={
                folder === templates.activeFolder ? (
                  <FolderOpenIcon></FolderOpenIcon>
                ) : (
                  <FolderIcon></FolderIcon>
                )
              }
              nodeId={folder}
              label={folder}
              onClick={() => {
                dispatch(setActiveSubfolder({ folderName: folder }));
              }}
            >
              <FileList
                scrollableContainerRef={scrollableContainerRef}
                folderName={folder}
              ></FileList>
            </StyledTreeItem>
          ))}
        </TreeView>
      </div>
    </div>
  );
}
