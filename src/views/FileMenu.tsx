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
  Dialog,
  makeStyles,
  Slide,
  Typography,
} from "@material-ui/core";

import { Skeleton } from "@material-ui/lab";
import React from "react";

const useStyles = makeStyles({
  listItem: {
    display: "flex",
    margin: 10,
    height: "100%",
    alignItems: "center",
    justifyContent: "space-around",
    borderRadius: 10,
  },

  buttons: {
    display: "flex",
    flexDirection: "column",
    "& button": {
      margin: 3,
    },
  },

  fileInfo: {
    margin: 3,
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignSelf: "stretch",
  },

  tags: {
    display: "flex",
    borderRadius: 10,
    border: "1px solid lightGray",
    "& div": {
      backgroundColor: "lightGray",
      margin: 2,
      padding: 2,
      borderRadius: 4,
    },
  },

  skeleton: {
    height: 100,
    width: "100%",
  },
});

interface FileMenuProps {
  fileName: string;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function FileMenu(props: FileMenuProps) {
  const styles = useStyles();
  const activeFolderPath = useActiveFolderPath();
  const [addTagsOpen, setAddTagsOpen] = React.useState(false);
  const [renameOpen, setRenameOpen] = React.useState(false);
  const confirm = useConfirm();

  const docxFiles = useActiveTemplate().docxFiles;
  const fileNames = Object.keys(docxFiles);

  const fileName = props.fileName;

  const fileData = docxFiles[fileName];

  // TODO: fix layout when there are too many tags.

  return (
    <div className={styles.listItem}>
      {fileData.isLoading ? (
        <Skeleton variant="rect" className={styles.skeleton}></Skeleton>
      ) : (
        <React.Fragment>
          <div className={styles.fileInfo}>
            <Typography>{fileName}</Typography>
            <div className={styles.tags}>
              {fileData.malformed ? (
                <div style={{ color: "red" }}>
                  Failed reading the file. Please, strip sensitive information
                  and submit the file to our team, so we can fix that. TODO: Add
                  link
                </div>
              ) : fileData.tags.length === 0 ? (
                <React.Fragment>
                  <div style={{ color: "red" }}>
                    {" "}
                    This file doesn't contain tags!
                  </div>
                  <br />
                  <div>
                    Click edit and insert tags using this format:{" "}
                    {`{%Tag Name%}`}
                  </div>
                </React.Fragment>
              ) : (
                fileData.tags.map((x) => <div key={x}>{x}</div>)
              )}
            </div>
          </div>

          <div className={styles.buttons}>
            <Button
              onClick={() => {
                console.log(path.join(activeFolderPath, fileName));

                shell.openExternal(path.join(activeFolderPath, fileName));
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
                  fse.unlink(path.join(activeFolderPath, fileName));
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
                  path.join(activeFolderPath, fileName),
                  path.join(activeFolderPath, newName + ".docx")
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
                fullPath={path.join(activeFolderPath, fileName)}
                base64Content={fileData.contentBase64 ?? ""}
              ></AddTagsToDocx>
            </Dialog>
          </div>
        </React.Fragment>
      )}
    </div>
  );
}
