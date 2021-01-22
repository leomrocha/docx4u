import { makeStyles, Paper } from "@material-ui/core";
import React from "react";
import { VirtualizedList } from "./VirtualizedList";

import { useDropzone } from "react-dropzone";
import fse from "fs-extra";
import path from "path";

import { useActiveFolderPath, useActiveTemplate } from "../state/Templates";
import FileMenu from "./FileMenu";

const useStyles = makeStyles({
  conatiner: {
    height: "100%",
    width: "100%",
    overflowY: "scroll",
    willChange: "transform",
  },
  dropZone: {
    display: "flex",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    height: "100px",
    border: "solid 2px lightgray",
    margin: 10,
    borderRadius: 10,
  },

  paper: { margin: 10 },
});

interface EntryProps {
  key: string;
  fileName: string;
}

export const Entry = React.forwardRef<HTMLTableRowElement, EntryProps>(
  (props, ref) => {
    const styles = useStyles();
    return (
      <div ref={ref} className={styles.paper}>
        <Paper>
          <FileMenu fileName={props.fileName}></FileMenu>
        </Paper>
      </div>
    );
  }
);

function Placeholder(props: { height: number }) {
  return <div style={{ height: props.height }}> </div>;
}

export default function Files() {
  const activeFolderPath = useActiveFolderPath();
  const docxFiles = useActiveTemplate()?.docxFiles;

  const [dropZoneError, setDropZoneError] = React.useState("");

  const styles = useStyles();

  const scrollableContainerRef = React.useRef(null);

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
    <div className={styles.conatiner} ref={scrollableContainerRef}>
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
        }))}
        ItemComponent={Entry}
        PlaceholderComponent={Placeholder}
        scrollableContainerRef={scrollableContainerRef}
        defaultHeight={80}
      />
    </div>
  );
}
