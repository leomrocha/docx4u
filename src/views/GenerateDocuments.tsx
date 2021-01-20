import { makeStyles, TextField } from "@material-ui/core";
import React from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../state/Store";
import { setTagValue, useActiveTemplate } from "../state/Templates";

const useStyles = makeStyles((theme) => ({
  conatiner: {
    display: "flex",
    alignItems: "flex-start",
    flexDirection: "column",
    height: "100vh",
    backgroundColor: theme.palette.background.default,
  },
}));

export default function GenerateDocuments() {
  const styles = useStyles();

  const dispatch: AppDispatch = useDispatch();
  const activeTemplate = useActiveTemplate();
  const enabledTags = new Set<string>();

  if (!activeTemplate) return null;

  Object.keys(activeTemplate.docxFiles).forEach((fileName) => {
    activeTemplate.docxFiles[fileName]?.tags.forEach((tag) => {
      enabledTags.add(tag);
    });
  });

  if (enabledTags.size === 0) return null;

  return (
    <div>
      {Array.from(enabledTags).map((tag) => (
        <div>
          <p> {tag} </p>
          <TextField
            id={tag}
            onChange={(event) => {
              dispatch(setTagValue({ tag, value: event.target.value }));
            }}
            value={activeTemplate.formData[tag]}
          ></TextField>
        </div>
      ))}
    </div>
  );
}
