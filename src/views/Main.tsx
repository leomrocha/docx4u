import React from "react";

import TemplatesSelectionPanel from "./TemplatesSelectionPanel";
import { makeStyles } from "@material-ui/core/styles";
import { AppBar, Tab, Tabs } from "@material-ui/core";
import GenerateDocuments from "./GenerateDocuments";
import EditTemplate from "./EditTemplate";

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
}));

enum SelectedTab {
  EditTemplate = 0,
  GenerateDocuments = 1,
}
export default function Main() {
  const styles = useStyles();

  const [selectedTab, setSelectedTab] = React.useState<SelectedTab>(
    SelectedTab.EditTemplate
  );

  return (
    <div className={styles.conatiner}>
      <AppBar position="static">
        <Tabs
          selectionFollowsFocus
          className={styles.tabs}
          value={selectedTab}
          onChange={(e, value) => {
            setSelectedTab(value);
          }}
          aria-label="simple tabs example"
        >
          <Tab label="Edit Template" />
          <Tab label="Generate Documents" />
        </Tabs>
      </AppBar>
      <div className={styles.content}>
        <TemplatesSelectionPanel></TemplatesSelectionPanel>

        <div className={styles.activeTemplate}>
          {selectedTab === SelectedTab.EditTemplate ? (
            <EditTemplate />
          ) : (
            <GenerateDocuments />
          )}
        </div>
      </div>
    </div>
  );
}
