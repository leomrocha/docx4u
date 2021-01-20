import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import fs from "fs";
import { extractTagsFromContent } from "../utils/template2form";

import { promisify } from "util";
import { AppDispatch, AppStateGetter, useTypedSelector } from "./Store";
import {
  CancellableFileWatcher,
  getChildDirectories,
  getChildFiles,
} from "../utils/fs";

import fse from "fs-extra";
import chokidar from "chokidar";

import path, { basename } from "path";
import { assert } from "console";

export interface DocxFileData {
  contentBase64?: string;
  tags: string[];
  isLoading: boolean;
  malformed: boolean;
}

// Template is a folder containing docx files with {% %} tags.
interface TemplateData {
  docxFiles: {
    [path: string]: DocxFileData;
  };
  formData: { [tag: string]: string };
}

interface SubfoldersMap {
  [folderName: string]: TemplateData;
}

export interface TemplatesState {
  subfolders: SubfoldersMap;
  activeTemplatesFolder?: string;
}

const initialState: TemplatesState = { subfolders: {} };

const templatesSlice = createSlice({
  name: "templates",
  initialState,
  reducers: {
    resetTemplates(state, action: PayloadAction<SubfoldersMap>) {
      state.subfolders = action.payload;
      const keys = Object.keys(state.subfolders);
      state.activeTemplatesFolder = undefined;
      if (keys.length > 0) {
        state.activeTemplatesFolder = keys[0];
      }
    },

    addSubfolder(
      state,
      action: PayloadAction<{
        fullPath: string;
        templateData: TemplateData;
      }>
    ) {
      state.subfolders[path.basename(action.payload.fullPath)] =
        action.payload.templateData;
      if (state.activeTemplatesFolder === undefined)
        state.activeTemplatesFolder = path.basename(action.payload.fullPath);
    },

    removeTemplate(state, action: PayloadAction<{ fullPath: string }>) {
      delete state.subfolders[path.basename(action.payload.fullPath)];

      if (
        path.basename(action.payload.fullPath) === state.activeTemplatesFolder
      ) {
        const keys = Object.keys(state.subfolders);
        if (keys.length > 0) {
          state.activeTemplatesFolder = keys[0];
        } else {
          state.activeTemplatesFolder = undefined;
        }
      }
    },

    setActiveSubfolder(state, action: PayloadAction<{ folderName: string }>) {
      if (path.basename(action.payload.folderName) in state.subfolders) {
        state.activeTemplatesFolder = path.basename(action.payload.folderName);
      }
    },

    setTagValue(state, action: PayloadAction<{ tag: string; value: string }>) {
      if (!state.activeTemplatesFolder) return;

      const activeTemplate = state.subfolders[state.activeTemplatesFolder];
      assert(activeTemplate);

      activeTemplate.formData[action.payload.tag] = action.payload.value;
    },

    setDocxFileLoading(state, action: PayloadAction<{ fullPath: string }>) {
      const folderData =
        state.subfolders[path.basename(path.dirname(action.payload.fullPath))];
      if (!folderData) return;

      folderData.docxFiles[path.basename(action.payload.fullPath)] = {
        isLoading: true,
        tags: [],
        malformed: false,
      };
    },

    updateDocxFileContent(
      state,
      action: PayloadAction<{
        fullPath: string;
        contentBase64: string;
        tags: string[];
        malformed: boolean;
      }>
    ) {
      const folderData =
        state.subfolders[path.basename(path.dirname(action.payload.fullPath))];
      if (!folderData) return;

      folderData.docxFiles[path.basename(action.payload.fullPath)] = {
        contentBase64: action.payload.contentBase64,
        isLoading: false,
        tags: action.payload.tags,
        malformed: action.payload.malformed,
      };

      action.payload.tags.forEach((tag) => {
        if (tag in folderData.formData) return;
        folderData.formData[tag] = "";
      });
    },

    deleteDocxFile(state, action: PayloadAction<{ fullPath: string }>) {
      const folderData =
        state.subfolders[path.basename(path.dirname(action.payload.fullPath))];
      if (!folderData) return;
      delete folderData.docxFiles[path.basename(action.payload.fullPath)];
    },
  },
});

const onDocxFileUpdate = (templatePath: string) => async (
  dispatch: AppDispatch
) => {
  if (basename(templatePath)[0] === "~") return;

  await dispatch(
    templatesSlice.actions.setDocxFileLoading({ fullPath: templatePath })
  );

  let fileContent: Buffer | undefined;
  try {
    fileContent = await fse.readFile(templatePath);
  } catch {}

  if (fileContent) {
    let malformed = false;
    let tags: string[] = [];
    try {
      tags = await extractTagsFromContent(fileContent);
    } catch {
      malformed = true;
    }
    await dispatch(
      templatesSlice.actions.updateDocxFileContent({
        fullPath: templatePath,
        contentBase64: fileContent.toString("base64"),
        tags,
        malformed,
      })
    );
  } else {
    await dispatch(
      templatesSlice.actions.deleteDocxFile({ fullPath: templatePath })
    );
  }
};

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
          templatesSlice.actions.addSubfolder({
            fullPath: fileOrDir,
            templateData: { docxFiles: {}, formData: {} },
          })
        );
      } else if (eventName === "unlinkDir") {
        dispatch(
          templatesSlice.actions.removeTemplate({ fullPath: fileOrDir })
        );
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
          await dispatch(onDocxFileUpdate(fileOrDir));
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

  const subfolders: SubfoldersMap = {};

  (await getChildDirectories(templatesParentDir)).forEach(async (subfolder) => {
    subfolders[path.basename(subfolder)] = {
      docxFiles: {},
      formData: {},
    };
  });

  await dispatch(templatesSlice.actions.resetTemplates(subfolders));

  await Promise.all(
    Object.keys(subfolders).map((subfolder) =>
      dispatch(loadDocxFiles(path.join(templatesParentDir, subfolder)))
    )
  );
};

const loadDocxFiles = (parentDirectory: string) => async (
  dispatch: AppDispatch
) => {
  const docxFiles = await getChildFiles(parentDirectory, [".docx"]);

  await Promise.all(
    docxFiles.map((docxFile) => dispatch(onDocxFileUpdate(docxFile)))
  );
};

export function useActiveFolderPath() {
  return useTypedSelector((state) =>
    path.join(
      state.settings.templatesPath,
      state.templates.activeTemplatesFolder ?? ""
    )
  );
}

export function useActiveTemplate() {
  return useTypedSelector(
    (state) =>
      state.templates.subfolders[state.templates.activeTemplatesFolder ?? ""]
  );
}

export const { setTagValue, setActiveSubfolder } = templatesSlice.actions;

export default templatesSlice.reducer;
