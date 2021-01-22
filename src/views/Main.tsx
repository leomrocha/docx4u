import React from "react";

import Folders from "./Folders";
import { makeStyles } from "@material-ui/core/styles";
import TagsForm from "./TagsForm";
import Files from "./Files";

const useStyles = makeStyles((theme) => ({
  conatiner: {
    display: "flex",
    alignItems: "flex-start",
    flexDirection: "column",
    height: "100vh",
    backgroundColor: theme.palette.background.default,
  },

  content: {
    display: "flex",
    width: "100%",
    overflow: "hidden",
    alignItems: "flex-start",
  },

  activeTemplate: {
    height: "100%",
    width: "100%",
    borderLeft: `1px solid ${theme.palette.divider}`,
  },

  tabs: {
    alignSelf: "flex-end",
  },
  files: {},
}));

enum SelectedTab {
  EditTemplate = 0,
  GenerateDocuments = 1,
}
export default function Main() {
  const styles = useStyles();

  return (
    <div className={styles.conatiner}>
      <div className={styles.content}>
        <Folders></Folders>
        <Files />
        <TagsForm />
      </div>
    </div>
  );
}
