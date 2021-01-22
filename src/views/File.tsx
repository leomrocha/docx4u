import AddTagsToDocx from "./AddTagsToDocx";
import RenameDialog from "./RenameDialog";
import { shell } from "electron";
import { useConfirm } from "material-ui-confirm";
import { TransitionProps } from "@material-ui/core/transitions/transition";
import fse from "fs-extra";
import path from "path";

import {
  Backdrop,
  Chip,
  CircularProgress,
  Dialog,
  makeStyles,
  Slide,
  Typography,
} from "@material-ui/core";

import {
  Alert,
  AlertTitle,
  SpeedDial,
  SpeedDialAction,
} from "@material-ui/lab";
import React from "react";
import { useTypedSelector } from "../state/Store";
import { Delete, Edit, FormatItalic, Menu } from "@material-ui/icons";

const useStyles = makeStyles({
  fileContainer: {
    display: "flex",
    flexDirection: "column",
    margin: 3,
    padding: 3,
    alignItems: "flex-start",
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
    alignSelf: "stretch",
    // Place for SpeedDial
    justifyContent: "space-between",
    marginRight: 46,
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

  relative: {
    position: "relative",
  },

  speedDialRoot: {
    position: "absolute",
    zIndex: (props: { buttonsVisible: boolean }) => {
      return props.buttonsVisible ? 3 : 1;
    },
    "& button": {
      width: 36,
      height: 36,
    },
  },

  skeleton: {
    height: 100,
    width: "100%",
  },
  backdrop: {
    zIndex: 2,
    color: "#fff",
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
  const [addTagsOpen, setAddTagsOpen] = React.useState(false);
  // const [renameOpen, setRenameOpen] = React.useState(false);
  const confirm = useConfirm();

  // So the path is already set for the templates path
  console.log("Props: " + JSON.stringify(props, null, 2))

  const docxFiles = useTypedSelector(
    (state) => state.templates.subfolders[props.folder].docxFiles
  );

  // FIXME
  // Here there is a bug, it sets the template path as the file path
  // but the original template file is not in that path, so the Edit fails when clicking it
  // it should use the original directory and original file to avoid any issue
  // (for example, the user modifies the original template but this does not get propagated to the copies)
  const folderPath = path.join(
    useTypedSelector((state) => state.settings.templatesPath),
    props.folder
  );

  const fileNames = Object.keys(docxFiles);

  const fileName = props.fileName;

  const fileData = docxFiles[fileName];

  const [buttonsVisible, setButtonsVisible] = React.useState(false);

  const styles = useStyles({ buttonsVisible });

  const buttons = [
    {
      name: "Edit",
      icon: <Edit />,
      onClick: () => {
        // separating file name creation to be able to log it
        const fname = path.join(folderPath, fileName);
        console.debug("Trying to open file: "+ fname)
        shell.openExternal(fname);
      },
    },
    {
      name: "Delete",
      icon: <Delete />,
      onClick: async () => {
        try {
          await confirm({
            description:
              "This will dismiss " + fileName + " from the Template. Continue?",
            confirmationText: "Yes",
            cancellationText: "No,",
          });
          fse.unlink(path.join(folderPath, fileName));
        } catch {}
      },
    },
    // Rename is not needed 
    // {
    //   icon: <FormatItalic />,
    //   name: "Rename",
    //   onClick: () => {
    //     setRenameOpen(true);
    //   },
    // },
  ];

  // TODO: fix layout when there are too many tags.

  return (
    <div className={styles.fileContainer}>
      <div className={styles.fileInfo}>
        <Typography variant="h6" align="left">
          {fileName}
        </Typography>
        <Backdrop className={styles.backdrop} open={buttonsVisible} />
        <div className={styles.relative}>
          <SpeedDial
            classes={{ root: styles.speedDialRoot }}
            icon={<Menu fontSize="small" />}
            onClose={() => {
              setButtonsVisible(false);
            }}
            onOpen={() => {
              setButtonsVisible(true);
            }}
            open={buttonsVisible}
            direction="down"
            ariaLabel="file action"
          >
            {buttons.map((button) => (
              <SpeedDialAction
                key={button.name}
                tooltipTitle={button.name}
                tooltipOpen
                color="secondary"
                icon={button.icon}
                onClick={() => {
                  button.onClick();
                  setButtonsVisible(false);
                }}
              />
            ))}
          </SpeedDial>
        </div>
      </div>

      <div className={styles.tags}>
        {fileData.isLoading ? (
          <CircularProgress></CircularProgress>
        ) : fileData.malformed ? (
          <Alert severity="error">
            Failed reading the file. Please, strip sensitive information and
            submit the file to our team, so we can fix that. TODO: Add link
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
            <Chip color="default" size="small" key={x} label={x}></Chip>
          ))
        )}
      </div>

      {/* <RenameDialog
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
      ></RenameDialog> */}
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
  );
}
