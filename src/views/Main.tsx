import React from "react";

import Folders from "./Folders";
import { makeStyles } from "@material-ui/core/styles";
import TagsForm from "./TagsForm";

const useStyles = makeStyles((theme) => ({
  conatiner: {
    display: "flex",
    alignItems: "flex-start",
    height: "100vh",
    backgroundColor: theme.palette.background.default,
  },

  tagsForm: {
    flex: "3 1 330px",
    height: "100%",
  },
  files: {
    flex: "1 0 330px",
    height: "100%",
  },
}));

export default function Main() {
  const styles = useStyles();

  return (
    <div className={styles.conatiner}>
      <div className={styles.files}>
        <Folders></Folders>
      </div>
      <div className={styles.tagsForm}>
        <TagsForm />
      </div>
    </div>
  );
}
