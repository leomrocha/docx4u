import { useActiveFolderPath, useActiveTemplate } from "../state/Templates";
import AddTagsToDocx from "./AddTagsToDocx";
import RenameDialog from "./RenameDialog";
import { shell } from "electron";
import { useConfirm } from "material-ui-confirm";
import { TransitionProps } from "@material-ui/core/transitions/transition";
import fse from "fs-extra";
import path from "path";

import {
  Button,
  Chip,
  Dialog,
  makeStyles,
  Slide,
  Typography,
} from "@material-ui/core";

import { Alert, AlertTitle, Skeleton } from "@material-ui/lab";
import React from "react";
import { useTypedSelector } from "../state/Store";

const useStyles = makeStyles({
  fileMenu: {
    display: "flex",
    margin: 10,
    padding: 10,
    height: "100%",
    alignItems: "center",
    justifyContent: "space-around",
    borderRadius: 10,
  },

  buttons: {
    display: "flex",
    flex: 1,
    flexWrap: "wrap",
    justifyContent: "flex-end",
    "& button": {
      margin: 3,
    },
  },

  fileInfo: {
    margin: 3,
    flex: 3,
    display: "flex",
    flexDirection: "column",
    alignSelf: "stretch",
  },

  tags: {
    display: "flex",
    flexWrap: "wrap",
    borderRadius: 10,
    margin: "auto",
    "& > *": {
      margin: 5,
    },
  },

  skeleton: {
    height: 100,
    width: "100%",
  },
});

interface FileMenuProps {
  fileName: string;
  folder: string;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function File(props: FileMenuProps) {
  const styles = useStyles();
  const [addTagsOpen, setAddTagsOpen] = React.useState(false);
  const [renameOpen, setRenameOpen] = React.useState(false);
  const confirm = useConfirm();

  const docxFiles = useTypedSelector(
    (state) => state.templates.subfolders[props.folder].docxFiles
  );

  const folderPath = path.join(
    useTypedSelector((state) => state.settings.templatesPath),
    props.folder
  );

  const fileNames = Object.keys(docxFiles);

  const fileName = props.fileName;

  const fileData = docxFiles[fileName];

  // TODO: fix layout when there are too many tags.

  return (
    <div className={styles.fileMenu}>
      {fileData.isLoading ? (
        <Skeleton variant="rect" className={styles.skeleton}></Skeleton>
      ) : (
        <React.Fragment>
          <div className={styles.fileInfo}>
            <Typography color="primary">{fileName}</Typography>
            <div className={styles.tags}>
              {fileData.malformed ? (
                <Alert severity="error">
                  Failed reading the file. Please, strip sensitive information
                  and submit the file to our team, so we can fix that. TODO: Add
                  link
                </Alert>
              ) : fileData.tags.length === 0 ? (
                <React.Fragment>
                  <Alert severity="warning">
                    <AlertTitle>No tags found!</AlertTitle>
                    Click edit and insert tags using this format:
                    <br></br>
                    <b> {`{%Tag Name%}`}</b>
                  </Alert>
                </React.Fragment>
              ) : (
                fileData.tags.map((x) => (
                  <Chip key={x} label={x} color="primary"></Chip>
                ))
              )}
            </div>
          </div>

          <div className={styles.buttons}>
            <Button
              onClick={() => {
                console.log(path.join(folderPath, fileName));

                shell.openExternal(path.join(folderPath, fileName));
              }}
              variant="outlined"
            >
              Edit
            </Button>
            {/* 
      <Button
        onClick={() => {
          setAddTagsOpen(true);
        }}
        variant="outlined"
      >
        Add Tags
      </Button> */}
            <Button
              onClick={async () => {
                try {
                  await confirm({
                    description:
                      "This will irreversably delete " +
                      fileName +
                      ". Continue?",
                    confirmationText: "Yes",
                    cancellationText: "No,",
                  });
                  fse.unlink(path.join(folderPath, fileName));
                } catch {}
              }}
              variant="outlined"
            >
              Delete
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setRenameOpen(true);
              }}
            >
              Rename
            </Button>
            <RenameDialog
              open={renameOpen}
              onClose={() => {
                setRenameOpen(false);
              }}
              initialName={path.basename(fileName, ".docx")}
              confirmButtonText="Rename"
              onRenamed={(newName) => {
                fse.move(
                  path.join(folderPath, fileName),
                  path.join(folderPath, newName + ".docx")
                );
                setRenameOpen(false);
              }}
              existingItems={fileNames.map((x) => path.basename(x, ".docx"))}
            ></RenameDialog>
            <Dialog
              fullScreen
              open={addTagsOpen}
              onClose={() => {
                setAddTagsOpen(false);
              }}
              TransitionComponent={Transition}
            >
              <AddTagsToDocx
                fullPath={path.join(folderPath, fileName)}
                base64Content={fileData.contentBase64 ?? ""}
              ></AddTagsToDocx>
            </Dialog>
          </div>
        </React.Fragment>
      )}
    </div>
  );
}
