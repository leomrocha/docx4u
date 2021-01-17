import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import fs from "fs";
import { extractTagsFromDocxFiles } from "../utils/template2form";

import { promisify } from "util";
import { AppDispatch, AppStateGetter } from "./Store";
import { getChildDirectories, getChildFiles } from "../utils/fs";

import fse from "fs-extra";
import chokidar from "chokidar";

import path from "path";

// Template is a folder containing docx files with {% %} tags.
interface TemplateData {
  // |tags| relate to |formData.keys|.
  // The difference is |formData| may contain more keys than tags.
  // The goal is to preserve data loss when changing templates.
  tags: string[];
  formData: { [tag: string]: string };
  isLoading: boolean;
}

interface TemplatesMap {
  [templatePath: string]: TemplateData;
}

interface State {
  map: TemplatesMap;
  activeTemplatesFolder?: string;
}

const initialState: State = { map: {} };

const templatesSlice = createSlice({
  name: "templates",
  initialState,
  reducers: {
    resetTemplates(state, action: PayloadAction<TemplatesMap>) {
      state.map = action.payload;
      const keys = Object.keys(state.map);
      if (keys.length > 0) {
        state.activeTemplatesFolder = keys[0];
      }
    },

    addTemplate(
      state,
      action: PayloadAction<{
        templatePath: string;
        templateData: TemplateData;
      }>
    ) {
      state.map[action.payload.templatePath] = action.payload.templateData;
      if (state.activeTemplatesFolder == undefined)
        state.activeTemplatesFolder = action.payload.templatePath;
    },

    removeTemplate(state, action: PayloadAction<string>) {
      delete state.map[action.payload];

      if (action.payload === state.activeTemplatesFolder) {
        const keys = Object.keys(state.map);
        if (keys.length > 0) {
          state.activeTemplatesFolder = keys[0];
        } else {
          state.activeTemplatesFolder = undefined;
        }
      }
    },

    setActiveTemplateFolder(state, action: PayloadAction<string>) {
      if (action.payload in state.map) {
        state.activeTemplatesFolder = action.payload;
      }
    },

    updateTemplateTags(
      state,
      action: PayloadAction<{ templatePath: string; tags: string[] }>
    ) {
      const folderData = state.map[action.payload.templatePath];
      if (!folderData) return;

      folderData.isLoading = false;
      folderData.tags = action.payload.tags;

      folderData.tags.forEach((tag) => {
        if (!folderData.formData[tag]) {
          folderData.formData[tag] = "";
        }
      });
    },
  },
});

const onTemplateUpdate = (templatePath: string) => async (
  dispatch: AppDispatch
) => {
  const tags: string[] = Array.from(
    await extractTagsFromDocxFiles(await getChildFiles(templatePath, [".docx"]))
  ).sort();

  await dispatch(
    templatesSlice.actions.updateTemplateTags({ templatePath, tags })
  );
};

// Chokidar's |close| doesn't resolve promises waiting for "ready" event.
class CancellableFileWatcher {
  constructor(
    private watcher: chokidar.FSWatcher,
    public on = watcher.on.bind(watcher)
  ) {}

  private resolveInit?: () => void;
  async init() {
    return new Promise<void>((resolve) => {
      this.watcher.on("ready", resolve);
      this.resolveInit = resolve;
    });
  }
  cancel() {
    if (this.resolveInit) this.resolveInit();
    this.watcher.close();
  }
}

let watcher: CancellableFileWatcher | undefined;

const setupWatcher = () => async (
  dispatch: AppDispatch,
  getState: AppStateGetter
): Promise<void> => {
  const templatesParentDir = getState().settings.templatesPath;

  if (watcher) watcher.cancel();

  watcher = new CancellableFileWatcher(
    chokidar.watch(templatesParentDir, {
      depth: 2,
      ignoreInitial: true,
    })
  );

  watcher.on("all", async (eventName, fileOrDir) => {
    if (path.dirname(fileOrDir) === templatesParentDir) {
      if (eventName === "addDir") {
        await dispatch(
          templatesSlice.actions.addTemplate({
            templatePath: fileOrDir,
            templateData: { tags: [], formData: {}, isLoading: true },
          })
        );

        await dispatch(onTemplateUpdate(fileOrDir));
      } else if (eventName === "unlinkDir") {
        dispatch(templatesSlice.actions.removeTemplate(fileOrDir));
      }
    } else if (
      path.dirname(path.dirname(fileOrDir)) === templatesParentDir &&
      path.extname(fileOrDir) === ".docx"
    ) {
      if (
        eventName === "change" ||
        eventName === "add" ||
        eventName === "unlink"
      ) {
        if (await fse.pathExists(path.dirname(fileOrDir)))
          dispatch(onTemplateUpdate(path.dirname(fileOrDir)));
      }
    }
  });

  await watcher.init();
};

export const reloadTemplates = () => async (
  dispatch: AppDispatch,
  getState: AppStateGetter
) => {
  const templatesParentDir = getState().settings.templatesPath;

  if (!(await promisify(fs.lstat)(templatesParentDir)).isDirectory()) {
    await promisify(fs.mkdir)(templatesParentDir);
  }

  await dispatch(setupWatcher());

  const templates: TemplatesMap = {};

  (await getChildDirectories(templatesParentDir)).forEach(
    async (templatePath) => {
      templates[templatePath] = {
        tags: [],
        formData: {},
        isLoading: true,
      };
    }
  );

  dispatch(templatesSlice.actions.resetTemplates(templates));

  await Promise.all(
    Object.keys(templates).map((templatePath) =>
      dispatch(onTemplateUpdate(templatePath))
    )
  );
};

export default templatesSlice.reducer;
