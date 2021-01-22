import { fade, makeStyles, Paper, Theme } from "@material-ui/core";
import React from "react";
import { VirtualizedList } from "./VirtualizedList";

import { useDropzone } from "react-dropzone";
import fse from "fs-extra";
import path from "path";

import File from "./File";
import { useTypedSelector } from "../state/Store";

const useStyles = makeStyles((theme: Theme) => ({
  conatiner: {
    height: "100%",
    width: "100%",
  },
  dropZone: {
    display: "flex",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    height: "100px",
    border: "solid 2px",
    borderColor: theme.palette.secondary.main,
    margin: 10,
    marginBottom: 30,
    borderRadius: 10,
  },

  fileContainer: {
    marginLeft: 0,
    paddingLeft: 10,
    marginBottom: 20,
    marginRight: 10,
    borderTop: `2px solid ${fade(theme.palette.text.primary, 0.4)}`,
  },

  paper: {
    top: -25,
    position: "relative",
  },
}));

interface EntryProps {
  key: string;
  fileName: string;
  folderName: string;
}

export const Entry = React.forwardRef<HTMLTableRowElement, EntryProps>(
  (props, ref) => {
    const styles = useStyles();
    return (
      <div ref={ref} className={styles.fileContainer}>
        <Paper elevation={4} classes={{ root: styles.paper }}>
          <File fileName={props.fileName} folder={props.folderName}></File>
        </Paper>
      </div>
    );
  }
);

function Placeholder(props: { height: number }) {
  return <div style={{ height: props.height }}> </div>;
}

interface FileListProps {
  scrollableContainerRef: React.MutableRefObject<null>;
  folderName: string;
}

export default function FileList(props: FileListProps) {
  const templates = useTypedSelector((state) => state.templates);
  const parentFolder = useTypedSelector(
    (state) => state.settings.templatesPath
  );

  const docxFiles = templates.subfolders[props.folderName]?.docxFiles;

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
        fse.copyFile(
          srcFullPath,
          path.join(parentFolder, props.folderName, dstName)
        );
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

      <VirtualizedList
        entries={Object.keys(docxFiles).map((x) => ({
          key: x,
          fileName: x,
          folderName: props.folderName,
        }))}
        ItemComponent={Entry}
        PlaceholderComponent={Placeholder}
        scrollableContainerRef={props.scrollableContainerRef}
        defaultHeight={80}
      />
    </div>
  );
}
