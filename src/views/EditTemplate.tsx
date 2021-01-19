import { Button, Dialog, makeStyles, Slide } from "@material-ui/core";
import React from "react";
import AutoSizer, { Size } from "react-virtualized-auto-sizer";
import { useConfirm } from "material-ui-confirm";

import { FixedSizeList as WindowedList } from "react-window";

import { useTypedSelector } from "../state/Store";

import Skeleton from "@material-ui/lab/Skeleton";

import { useDropzone } from "react-dropzone";
import fse from "fs-extra";
import path from "path";
import { TransitionProps } from "@material-ui/core/transitions/transition";
import EditDocx from "./EditDocx";
import RenameDialog from "./RenameDialog";
const useStyles = makeStyles({
  conatiner: {
    display: "flex",
    alignItems: "flex-start",
    flexDirection: "column",
    height: "100%",
    width: "100%",
  },
  dropZone: {
    display: "flex",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    width: "95%",
    height: "100px",
    border: "solid 2px lightgray",
    marginTop: 10,
    borderRadius: 10,
  },

  listItem: {
    display: "flex",
    margin: 10,
    height: "100%",
    alignItems: "center",
    justifyContent: "space-between",
  },

  buttons: {
    "& button": {
      margin: 3,
    },
  },

  fileInfo: {
    margin: 3,
  },

  // workaround for inability of react-virtualized-auto-sizer to fit into flexbox.
  fullSize: {
    height: "100%",
    width: "100%",
  },
});

function useActiveFolderPath() {
  return useTypedSelector((state) =>
    path.join(
      state.settings.templatesPath,
      state.templates.activeTemplatesFolder ?? ""
    )
  );
}

function useDocxFiles() {
  return useTypedSelector(
    (state) =>
      state.templates.subfolders[state.templates.activeTemplatesFolder ?? ""]
        ?.docxFiles
  );
}
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const Row = (props: { index: number; style: any }) => {
  const styles = useStyles();

  const activeFolderPath = useActiveFolderPath();
  const docxFiles = useDocxFiles();
  const fileNames = Object.keys(docxFiles);
  const fileName = fileNames[props.index];
  const fileData = docxFiles[fileName];

  const [editOpen, setEditOpen] = React.useState(false);
  const [renameOpen, setRenameOpen] = React.useState(false);

  const confirm = useConfirm();

  return (
    <div style={props.style}>
      <div
        style={{ backgroundColor: props.index % 2 ? "white" : "lightblue" }}
        className={styles.listItem}
      >
        {fileData.isLoading ? (
          <Skeleton variant="rect" className={styles.fullSize}></Skeleton>
        ) : (
          <React.Fragment>
            <div className={styles.fileInfo}>{fileName}</div>

            <div className={styles.buttons}>
              <Button
                onClick={() => {
                  setEditOpen(true);
                }}
                variant="outlined"
              >
                Edit
              </Button>
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
                open={editOpen}
                onClose={() => {
                  setEditOpen(false);
                }}
                TransitionComponent={Transition}
              >
                <EditDocx
                  fullPath={path.join(activeFolderPath, fileName)}
                  base64Content={fileData.contentBase64 ?? ""}
                ></EditDocx>
              </Dialog>
            </div>
          </React.Fragment>
        )}
      </div>
    </div>
  );
};

export default function EditTemplate() {
  const activeFolderPath = useActiveFolderPath();
  const docxFiles = useDocxFiles();

  const [dropZoneError, setDropZoneError] = React.useState("");

  const styles = useStyles();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (files) => {
      setDropZoneError("");

      const pathsToCopy = new Map<
        /*destName*/ string,
        /*srcFullPath*/ string
      >();

      files.forEach((file) => {
        if (path.extname(file.name).toLowerCase() !== ".docx") {
          setDropZoneError(file.name + " is ignored. " + dropZoneError);
        }

        let duplicatesCount = 2;
        let destName = file.name;
        while (
          Object.keys(docxFiles).includes(destName) ||
          pathsToCopy.has(destName)
        ) {
          destName =
            path.basename(file.name, ".docx") +
            "_" +
            duplicatesCount++ +
            ".docx";
        }
        pathsToCopy.set(destName, file.path);
      });

      pathsToCopy.forEach((srcFullPath, dstName) => {
        fse.copyFile(srcFullPath, path.join(activeFolderPath, dstName));
      });
    },
  });

  if (!docxFiles) return null;

  return (
    <div className={styles.conatiner}>
      <div className={styles.dropZone} {...getRootProps()}>
        <input {...getInputProps()} />
        {dropZoneError ? (
          <p style={{ color: "red" }}>{dropZoneError}</p>
        ) : isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drop docx files here or click this area</p>
        )}
      </div>
      <div className={styles.fullSize}>
        <AutoSizer>
          {(size: Size): React.ReactNode => {
            return (
              <WindowedList
                className="List"
                height={size.height}
                itemCount={Object.keys(docxFiles).length}
                itemSize={200}
                width={size.width}
              >
                {Row}
              </WindowedList>
            );
          }}
        </AutoSizer>{" "}
      </div>
    </div>
  );
}
