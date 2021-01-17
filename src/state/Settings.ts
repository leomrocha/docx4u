import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { readFile, writeFile } from "fs";
import path from "path";
import os from "os";
import envPaths from "env-paths";

import { promisify } from "util";
import { AppDispatch, AppStateGetter } from "./Store";
import { reloadTemplates } from "./Templates";

const appName = "docx4u";
const appPaths = envPaths(appName);
const settingsPath = path.join(appPaths.config, "config.json");

interface Settings {
  templatesPath: string;
}

const initialState: Settings = {
  templatesPath: "",
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setTemplatePath(state, action: PayloadAction<string>) {
      state.templatesPath = action.payload;
    },
  },
});

export const setTemplatePath = (templatePath: string) => async (
  dispatch: AppDispatch,
  getState: AppStateGetter
) => {
  await dispatch(settingsSlice.actions.setTemplatePath(templatePath));
  await dispatch(reloadTemplates());
  if (process.env.JEST_WORKER_ID === undefined) {
    await promisify(writeFile)(
      settingsPath,
      JSON.stringify(getState().settings.templatesPath)
    );
  }
};

export const initSettings = () => async (dispatch: AppDispatch) => {
  try {
    const parsed = JSON.parse(
      await promisify(readFile)(settingsPath).toString()
    );
    if (typeof parsed.templatesPath !== "string") throw new Error();

    await dispatch(setTemplatePath(parsed.templatePath));
    return parsed;
  } catch {
    await dispatch(
      setTemplatePath(path.join(os.homedir(), "Documents", appName))
    );
  }
};

export default settingsSlice.reducer;
