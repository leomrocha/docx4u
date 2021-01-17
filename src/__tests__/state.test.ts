import { store } from "../state/Store";
import { setTemplatePath } from "../state/Settings";
import path from "path";
import fse from "fs-extra";

import tmp from "tmp";
import { reloadTemplates } from "../state/Templates";
import { inspect } from "util";
import { stringify } from "querystring";

const templateSetOne = "src/__tests__/fixtures/state/templateSetOne";
const templateSetTwo = "src/__tests__/fixtures/state/templateSetTwo";

function getExpectedStateOne(templatesPath: string) {
  return {
    settings: {
      templatesPath,
    },
    templates: {
      activeTemplatesFolder: path.join(templatesPath, "folderThree"),
      map: {
        [path.join(templatesPath, "folderThree")]: {
          isLoading: false,
          formData: {
            "template 1 folder 3 file A": "",
            "template 1 folder 3 file B": "",
          },
          tags: ["template 1 folder 3 file A", "template 1 folder 3 file B"],
        },
        [path.join(templatesPath, "folderTwo")]: {
          isLoading: false,
          formData: {
            "template 1 folder 2 file A": "",
            "template 1 folder 2 file B": "",
          },
          tags: ["template 1 folder 2 file A", "template 1 folder 2 file B"],
        },
      },
    },
  };
}

function getExpectedStateTwo(templatesPath: string) {
  return {
    settings: {
      templatesPath,
    },
    templates: {
      activeTemplatesFolder: path.join(templatesPath, "folderOne"),
      map: {
        [path.join(templatesPath, "folderOne")]: {
          isLoading: false,
          formData: {
            "template 2 folder 1 file A": "",
            "template 2 folder 1 file B": "",
            "template 2 folder 1 file C": "",
          },
          tags: [
            "template 2 folder 1 file A",
            "template 2 folder 1 file B",
            "template 2 folder 1 file C",
          ],
        },
        [path.join(templatesPath, "folderThree")]: {
          isLoading: false,
          formData: {
            "template 2 folder 3 file A": "",
            "template 2 folder 3 file B": "",
          },
          tags: ["template 2 folder 3 file A", "template 2 folder 3 file B"],
        },
        [path.join(templatesPath, "folderTwo")]: {
          isLoading: false,
          formData: {
            "template 2 folder 2 file A": "",
          },
          tags: ["template 2 folder 2 file A"],
        },
      },
    },
  };
}

let cleanupCallbacks: ((this: void) => void)[] = [];
function createTempDirectory(): string {
  const directory = tmp.dirSync({ unsafeCleanup: true });
  cleanupCallbacks.push(() => {
    directory.removeCallback();
  });
  return directory.name;
}

afterAll(() => {
  //cleanupCallbacks.forEach((callback) => callback());
  cleanupCallbacks = [];
});

test("reloadTemplates works when called several times", async () => {
  await store.dispatch(setTemplatePath(templateSetOne));
  expect(store.getState()).toStrictEqual(getExpectedStateOne(templateSetOne));

  await store.dispatch(setTemplatePath(templateSetTwo));
  expect(store.getState()).toStrictEqual(getExpectedStateTwo(templateSetTwo));

  await store.dispatch(setTemplatePath(templateSetOne));
  expect(store.getState()).toStrictEqual(getExpectedStateOne(templateSetOne));

  await store.dispatch(setTemplatePath(templateSetOne));
  expect(store.getState()).toStrictEqual(getExpectedStateOne(templateSetOne));

  await store.dispatch(setTemplatePath(templateSetTwo));
  expect(store.getState()).toStrictEqual(getExpectedStateTwo(templateSetTwo));
});

test("reloadTemplates works when called asyncrhoniously", async () => {
  await Promise.all([
    store.dispatch(setTemplatePath(templateSetOne)),
    store.dispatch(setTemplatePath(templateSetOne)),
    store.dispatch(setTemplatePath(templateSetOne)),
    store.dispatch(setTemplatePath(templateSetOne)),
    store.dispatch(setTemplatePath(templateSetOne)),
    store.dispatch(setTemplatePath(templateSetOne)),
    store.dispatch(setTemplatePath(templateSetOne)),
    store.dispatch(setTemplatePath(templateSetOne)),
    store.dispatch(setTemplatePath(templateSetOne)),
    store.dispatch(setTemplatePath(templateSetOne)),
    store.dispatch(setTemplatePath(templateSetOne)),
    store.dispatch(setTemplatePath(templateSetOne)),
    store.dispatch(setTemplatePath(templateSetOne)),
    store.dispatch(setTemplatePath(templateSetOne)),
    store.dispatch(setTemplatePath(templateSetOne)),
    store.dispatch(setTemplatePath(templateSetOne)),
    store.dispatch(setTemplatePath(templateSetOne)),
    store.dispatch(setTemplatePath(templateSetOne)),
    store.dispatch(setTemplatePath(templateSetOne)),
    store.dispatch(setTemplatePath(templateSetOne)),
    store.dispatch(setTemplatePath(templateSetOne)),
    store.dispatch(setTemplatePath(templateSetOne)),
    store.dispatch(setTemplatePath(templateSetOne)),
    store.dispatch(setTemplatePath(templateSetOne)),
    store.dispatch(setTemplatePath(templateSetOne)),
    store.dispatch(setTemplatePath(templateSetTwo)),
  ]);

  expect(store.getState()).toStrictEqual(getExpectedStateTwo(templateSetTwo));
});

test("can add templates", async () => {
  const directory = createTempDirectory();
  fse.copySync(templateSetTwo, directory);
  await store.dispatch(setTemplatePath(directory));

  const newTemplatePath = path.join(directory, "test");
  await fse.mkdir(newTemplatePath);

  await sleep(500);

  expect(store.getState().templates.map[newTemplatePath]).toStrictEqual({
    isLoading: false,
    formData: {},
    tags: [],
  });

  fse.copySync(
    path.join(templateSetOne, "folderTwo", "A.docx"),
    path.join(newTemplatePath, "newFile.docx")
  );

  await sleep(500);

  expect(store.getState().templates.map[newTemplatePath]).toStrictEqual({
    isLoading: false,
    formData: { "template 1 folder 2 file A": "" },
    tags: ["template 1 folder 2 file A"],
  });
});

test("can delete templates", async () => {
  const directory = createTempDirectory();
  fse.copySync(templateSetTwo, directory);
  await store.dispatch(setTemplatePath(directory));

  const folderOnePath = path.join(directory, "folderOne");
  await fse.remove(folderOnePath);

  await sleep(500);

  const expectedState = getExpectedStateTwo(directory);
  delete expectedState.templates.map[folderOnePath];
  expectedState.templates.activeTemplatesFolder = path.join(
    directory,
    "folderThree"
  );

  expect(store.getState()).toStrictEqual(expectedState);
});

test("adding files to existing templates adds new tags", async () => {
  const directory = createTempDirectory();
  fse.copySync(templateSetTwo, directory);
  await store.dispatch(setTemplatePath(directory));

  const expectedState = getExpectedStateTwo(directory);
  expect(store.getState()).toStrictEqual(expectedState);

  const folderOnePath = path.join(directory, "folderOne");

  fse.copySync(
    path.join(templateSetTwo, "folderTwo", "A.docx"),
    path.join(folderOnePath, "D.docx")
  );

  expectedState.templates.map[folderOnePath].tags.push(
    "template 2 folder 2 file A"
  );
  expectedState.templates.map[folderOnePath].formData[
    "template 2 folder 2 file A"
  ] = "";

  await sleep(500);

  expect(store.getState()).toStrictEqual(expectedState);
});

test("removing files from existing templates removes tags", async () => {
  const directory = createTempDirectory();
  fse.copySync(templateSetTwo, directory);
  await store.dispatch(setTemplatePath(directory));

  const expectedState = getExpectedStateTwo(directory);
  expect(store.getState()).toStrictEqual(expectedState);

  const folderOnePath = path.join(directory, "folderOne");

  fse.removeSync(path.join(folderOnePath, "C.docx"));

  // formFata remain unchanged to preserve data in case if user restores file.
  expectedState.templates.map[folderOnePath].tags = expectedState.templates.map[
    folderOnePath
  ].tags.filter((x) => x !== "template 2 folder 1 file C");

  expect(expectedState.templates.map[folderOnePath].tags.length).toBe(2);

  await sleep(500);
  expect(store.getState()).toStrictEqual(expectedState);
});

test("restoring files restores tags", async () => {});

test("can change templates folder", async () => {});

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
