import { makeStyles } from "@material-ui/core";
import React from "react";
import AutoSizer, { Size } from "react-virtualized-auto-sizer";

import { FixedSizeList as WindowedList } from "react-window";

import { useTypedSelector } from "../state/Store";

import { useDropzone } from "react-dropzone";
import fse from "fs-extra";
import path from "path";
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
  listItemOdd: {
    backgroundColor: "lightgray",
    margin: 10,
    height: "100%",
  },
  listItemEven: {
    margin: 10,
    height: "100%",
  },

  // workaround for inability of react-virtualized-auto-sizer to fit into flexbox.
  autoSizerContainer: {
    height: "100%",
    width: "100%",
  },
});

const Row = (props: { index: number; style: any }) => {
  const styles = useStyles();

  const docxFiles = useTypedSelector(
    (state) =>
      state.templates.subfolders[state.templates.activeTemplatesFolder ?? ""]
        ?.docxFiles
  );

  const keys = Object.keys(docxFiles);

  return (
    <div style={props.style}>
      <div
        className={props.index % 2 ? styles.listItemEven : styles.listItemOdd}
      >
        {keys[props.index]}
      </div>
    </div>
  );
};

export default function EditTemplate() {
  const activeFolderPath = useTypedSelector((state) =>
    path.join(
      state.settings.templatesPath,
      state.templates.activeTemplatesFolder ?? ""
    )
  );
  const docxFiles = useTypedSelector(
    (state) =>
      state.templates.subfolders[state.templates.activeTemplatesFolder ?? ""]
        ?.docxFiles
  );

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
      <div className={styles.autoSizerContainer}>
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
