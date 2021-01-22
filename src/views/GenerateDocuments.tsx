import { Button, makeStyles, TextField, Typography } from "@material-ui/core";
import React from "react";
import { useDispatch } from "react-redux";
import { AppDispatch, useTypedSelector } from "../state/Store";
import {
  setTagValue,
  useActiveFolderPath,
  useActiveTemplate,
} from "../state/Templates";
import path from "path";
import { generateZip } from "../utils/template2form";

const useStyles = makeStyles((theme) => ({
  conatiner: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    overflowY: "scroll",
  },

  textField: {
    width: "95%",
    margin: "auto",
    marginBottom: 10,
  },

  button: {
    width: "95%",
    margin: "auto",
    marginBottom: 30,
  },
}));

export default function GenerateDocuments() {
  const styles = useStyles();

  const dispatch: AppDispatch = useDispatch();
  const activeTemplate = useActiveTemplate();
  const activeTemplateName = path.basename(useActiveFolderPath());

  const activeFolderName = useTypedSelector(
    (state) => state.templates.activeFolder
  );
  const enabledTags = new Set<string>();

  if (!activeTemplate || !activeFolderName) return null;

  Object.keys(activeTemplate.docxFiles).forEach((fileName) => {
    activeTemplate.docxFiles[fileName]?.tags.forEach((tag) => {
      enabledTags.add(tag);
    });
  });

  if (enabledTags.size === 0) return null;

  return (
    <div className={styles.conatiner}>
      <Typography variant="h6" color="primary">
        Tags from files in <b> {activeTemplateName}:</b>{" "}
      </Typography>
      {Array.from(enabledTags).map((tag) => (
        <TextField
          key={tag}
          className={styles.textField}
          variant="outlined"
          label={tag}
          id={tag}
          onChange={(event) => {
            dispatch(setTagValue({ tag, value: event.target.value }));
          }}
          value={activeTemplate.formData[tag]}
        ></TextField>
      ))}
      <Button
        variant="outlined"
        color="primary"
        onClick={() => {
          generateZip(activeTemplate, activeFolderName);
        }}
        className={styles.button}
      >
        Save Results
      </Button>
    </div>
  );
}
