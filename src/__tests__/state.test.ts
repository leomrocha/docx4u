import { AppStateGetter, store } from "../state/Store";
import { setTemplatePath } from "../state/Settings";
import path from "path";
import fse from "fs-extra";

import tmp from "tmp";
import assert from "assert";
import { setTagValue, TemplatesState } from "../state/Templates";

import _ from "lodash";

class ExpectedState {
  constructor(
    public templatesLocation: string,
    private expectedTemplatesState: TemplatesState
  ) {
    for (const subfolder in expectedTemplatesState.subfolders) {
      for (const docxFile in expectedTemplatesState.subfolders[subfolder]
        .docxFiles) {
        expectedTemplatesState.subfolders[subfolder].docxFiles[
          docxFile
        ].contentBase64 = fse
          .readFileSync(path.join(this.templatesLocation, subfolder, docxFile))
          .toString("base64");
      }
    }

    Object.freeze(expectedTemplatesState);
  }

  public get(parentDir: string): ReturnType<AppStateGetter> {
    return {
      settings: { templatesPath: parentDir },
      templates: _.cloneDeep(this.expectedTemplatesState),
    };
  }
}

const expectedStateOne = new ExpectedState(
  "src/__tests__/fixtures/state/templateSetOne",
  {
    activeFolder: "folderThree",
    subfolders: {
      folderThree: {
        formData: {
          "template 1 folder 3 file A": "",
          "template 1 folder 3 file B": "",
        },
        docxFiles: {
          "A.docx": {
            tags: ["template 1 folder 3 file A"],
            isLoading: false,
          },
          "B.docx": {
            tags: ["template 1 folder 3 file B"],
            isLoading: false,
          },
        },
      },
      folderTwo: {
        formData: {
          "template 1 folder 2 file A": "",
          "template 1 folder 2 file B": "",
        },
        docxFiles: {
          "A.docx": {
            tags: ["template 1 folder 2 file A"],
            isLoading: false,
          },
          "B.docx": {
            tags: ["template 1 folder 2 file B"],
            isLoading: false,
          },
        },
      },
    },
  }
);

const expectedStateTwo = new ExpectedState(
  "src/__tests__/fixtures/state/templateSetTwo",
  {
    activeFolder: "folderOne",
    subfolders: {
      folderOne: {
        formData: {
          "template 2 folder 1 file A": "",
          "template 2 folder 1 file B": "",
          "template 2 folder 1 file C": "",
        },
        docxFiles: {
          "A.docx": {
            tags: ["template 2 folder 1 file A"],
            isLoading: false,
          },
          "B.docx": {
            tags: ["template 2 folder 1 file B"],
            isLoading: false,
          },
          "C.docx": {
            tags: ["template 2 folder 1 file C"],
            isLoading: false,
          },
        },
      },
      folderThree: {
        formData: {
          "template 2 folder 3 file A": "",
          "template 2 folder 3 file B": "",
        },

        docxFiles: {
          "A.docx": {
            tags: ["template 2 folder 3 file A"],
            isLoading: false,
          },
          "B.docx": {
            tags: ["template 2 folder 3 file B"],
            isLoading: false,
          },
        },
      },
      folderTwo: {
        formData: {
          "template 2 folder 2 file A": "",
        },
        docxFiles: {
          "A.docx": {
            tags: ["template 2 folder 2 file A"],
            isLoading: false,
          },
        },
      },
    },
  }
);

let cleanupCallbacks: ((this: void) => void)[] = [];
function createTempDirectory(): string {
  const directory = tmp.dirSync({ unsafeCleanup: true });
  cleanupCallbacks.push(() => {
    directory.removeCallback();
  });
  return directory.name;
}

afterAll(() => {
  cleanupCallbacks.forEach((callback) => callback());
  cleanupCallbacks = [];
});

test("expected states are valid", async () => {
  await store.dispatch(setTemplatePath(expectedStateOne.templatesLocation));
  expect(store.getState()).toStrictEqual(
    expectedStateOne.get(expectedStateOne.templatesLocation)
  );

  await store.dispatch(setTemplatePath(expectedStateTwo.templatesLocation));
  expect(store.getState()).toStrictEqual(
    expectedStateTwo.get(expectedStateTwo.templatesLocation)
  );
});

test("reloadTemplates works when called several times", async () => {
  await store.dispatch(setTemplatePath(expectedStateOne.templatesLocation));
  expect(store.getState()).toStrictEqual(
    expectedStateOne.get(expectedStateOne.templatesLocation)
  );

  await store.dispatch(setTemplatePath(expectedStateTwo.templatesLocation));
  expect(store.getState()).toStrictEqual(
    expectedStateTwo.get(expectedStateTwo.templatesLocation)
  );

  await store.dispatch(setTemplatePath(expectedStateOne.templatesLocation));
  expect(store.getState()).toStrictEqual(
    expectedStateOne.get(expectedStateOne.templatesLocation)
  );

  await store.dispatch(setTemplatePath(expectedStateOne.templatesLocation));
  expect(store.getState()).toStrictEqual(
    expectedStateOne.get(expectedStateOne.templatesLocation)
  );

  await store.dispatch(setTemplatePath(expectedStateTwo.templatesLocation));
  expect(store.getState()).toStrictEqual(
    expectedStateTwo.get(expectedStateTwo.templatesLocation)
  );
});

test("reloadTemplates works when called asyncrhoniously", async () => {
  await Promise.all([
    store.dispatch(setTemplatePath(expectedStateOne.templatesLocation)),
    store.dispatch(setTemplatePath(expectedStateOne.templatesLocation)),
    store.dispatch(setTemplatePath(expectedStateOne.templatesLocation)),
    store.dispatch(setTemplatePath(expectedStateOne.templatesLocation)),
    store.dispatch(setTemplatePath(expectedStateOne.templatesLocation)),
    store.dispatch(setTemplatePath(expectedStateOne.templatesLocation)),
    store.dispatch(setTemplatePath(expectedStateOne.templatesLocation)),
    store.dispatch(setTemplatePath(expectedStateOne.templatesLocation)),
    store.dispatch(setTemplatePath(expectedStateOne.templatesLocation)),
    store.dispatch(setTemplatePath(expectedStateOne.templatesLocation)),
    store.dispatch(setTemplatePath(expectedStateOne.templatesLocation)),
    store.dispatch(setTemplatePath(expectedStateOne.templatesLocation)),
    store.dispatch(setTemplatePath(expectedStateOne.templatesLocation)),
    store.dispatch(setTemplatePath(expectedStateOne.templatesLocation)),
    store.dispatch(setTemplatePath(expectedStateOne.templatesLocation)),
    store.dispatch(setTemplatePath(expectedStateOne.templatesLocation)),
    store.dispatch(setTemplatePath(expectedStateOne.templatesLocation)),
    store.dispatch(setTemplatePath(expectedStateOne.templatesLocation)),
    store.dispatch(setTemplatePath(expectedStateOne.templatesLocation)),
    store.dispatch(setTemplatePath(expectedStateOne.templatesLocation)),
    store.dispatch(setTemplatePath(expectedStateOne.templatesLocation)),
    store.dispatch(setTemplatePath(expectedStateOne.templatesLocation)),
    store.dispatch(setTemplatePath(expectedStateOne.templatesLocation)),
    store.dispatch(setTemplatePath(expectedStateOne.templatesLocation)),
    store.dispatch(setTemplatePath(expectedStateOne.templatesLocation)),
    store.dispatch(setTemplatePath(expectedStateTwo.templatesLocation)),
  ]);

  expect(store.getState()).toStrictEqual(
    expectedStateTwo.get(expectedStateTwo.templatesLocation)
  );
});

test("can add templates", async () => {
  const directory = createTempDirectory();
  fse.copySync(expectedStateTwo.templatesLocation, directory);
  await store.dispatch(setTemplatePath(directory));

  await fse.mkdir(path.join(directory, "test"));

  await sleep(500);

  expect(store.getState().templates.subfolders["test"]).toStrictEqual({
    formData: {},
    docxFiles: {},
  });

  fse.copySync(
    path.join(expectedStateOne.templatesLocation, "folderTwo", "A.docx"),
    path.join(directory, "test", "newFile.docx")
  );

  await sleep(500);

  expect(store.getState().templates.subfolders["test"]).toStrictEqual({
    formData: { "template 1 folder 2 file A": "" },
    docxFiles: {
      "newFile.docx": {
        contentBase64: fse
          .readFileSync(
            path.join(expectedStateOne.templatesLocation, "folderTwo", "A.docx")
          )
          .toString("base64"),
        tags: ["template 1 folder 2 file A"],
        isLoading: false,
      },
    },
  });
});

test("can delete templates", async () => {
  const directory = createTempDirectory();
  fse.copySync(expectedStateTwo.templatesLocation, directory);
  await store.dispatch(setTemplatePath(directory));

  await fse.remove(path.join(directory, "folderOne"));

  await sleep(500);

  const expectedState = expectedStateTwo.get(directory);
  delete expectedState.templates.subfolders["folderOne"];
  expectedState.templates.activeFolder = "folderThree";

  expect(store.getState()).toStrictEqual(expectedState);
});

test("can add folders with files", async () => {
  const directory = createTempDirectory();
  await store.dispatch(setTemplatePath(directory));
  fse.copySync(expectedStateTwo.templatesLocation, directory);
  await sleep(500);
  expect(store.getState()).toStrictEqual(expectedStateTwo.get(directory));
});

test("adding files to existing templates adds new tags", async () => {
  const directory = createTempDirectory();
  fse.copySync(expectedStateTwo.templatesLocation, directory);
  await store.dispatch(setTemplatePath(directory));

  const expectedState = expectedStateTwo.get(directory);
  expect(store.getState()).toStrictEqual(expectedState);

  fse.copySync(
    path.join(expectedStateTwo.templatesLocation, "folderTwo", "A.docx"),
    path.join(directory, "folderOne", "D.docx")
  );

  expectedState.templates.subfolders["folderOne"].docxFiles["D.docx"] = {
    tags: ["template 2 folder 2 file A"],
    contentBase64: fse
      .readFileSync(
        path.join(expectedStateTwo.templatesLocation, "folderTwo", "A.docx")
      )
      .toString("base64"),
    isLoading: false,
  };

  expectedState.templates.subfolders["folderOne"].formData[
    "template 2 folder 2 file A"
  ] = "";

  await sleep(500);

  expect(store.getState()).toStrictEqual(expectedState);
});

test("removing files from existing templates removes tags", async () => {
  const directory = createTempDirectory();
  fse.copySync(expectedStateTwo.templatesLocation, directory);
  await store.dispatch(setTemplatePath(directory));

  const expectedState = expectedStateTwo.get(directory);
  expect(store.getState()).toStrictEqual(expectedState);

  fse.removeSync(path.join(directory, "folderOne", "C.docx"));

  expect(
    Object.keys(expectedState.templates.subfolders["folderOne"].docxFiles)
      .length
  ).toBe(3);
  delete expectedState.templates.subfolders["folderOne"].docxFiles["C.docx"];
  expect(
    Object.keys(expectedState.templates.subfolders["folderOne"].docxFiles)
      .length
  ).toBe(2);

  await sleep(500);
  expect(store.getState()).toStrictEqual(expectedState);
});

test("restoring files restores tags", async () => {
  const directory = createTempDirectory();
  fse.copySync(expectedStateTwo.templatesLocation, directory);
  await store.dispatch(setTemplatePath(directory));

  const expectedState = expectedStateTwo.get(directory);

  await Promise.all([
    store.dispatch(
      setTagValue({ tag: "template 2 folder 1 file A", value: "Value A" })
    ),
    store.dispatch(
      setTagValue({ tag: "template 2 folder 1 file B", value: "Value B" })
    ),
    store.dispatch(
      setTagValue({ tag: "template 2 folder 1 file C", value: "Value C" })
    ),
  ]);

  assert(expectedState.templates.activeFolder);
  const expectedFormData =
    expectedState.templates.subfolders[expectedState.templates.activeFolder]
      .formData;
  expectedFormData["template 2 folder 1 file A"] = "Value A";
  expectedFormData["template 2 folder 1 file B"] = "Value B";
  expectedFormData["template 2 folder 1 file C"] = "Value C";

  expect(store.getState()).toStrictEqual(expectedState);

  fse.removeSync(path.join(directory, "folderOne", "C.docx"));

  delete expectedState.templates.subfolders["folderOne"].docxFiles["C.docx"];

  await sleep(500);
  expect(store.getState()).toStrictEqual(expectedState);

  fse.copySync(
    path.join(expectedStateTwo.templatesLocation, "folderOne", "C.docx"),
    path.join(directory, "folderOne", "C.docx")
  );

  expectedState.templates.subfolders["folderOne"].docxFiles["C.docx"] = {
    tags: ["template 2 folder 1 file C"],
    contentBase64: fse
      .readFileSync(
        path.join(expectedStateTwo.templatesLocation, "folderOne", "C.docx")
      )
      .toString("base64"),
    isLoading: false,
  };

  await sleep(500);
  expect(store.getState()).toStrictEqual(expectedState);

  const activeTemplateFolder = store.getState().templates.activeFolder;
  assert(activeTemplateFolder);
  const formData = store.getState().templates.subfolders[activeTemplateFolder]
    .formData;

  expect(formData["template 2 folder 1 file A"]).toBe("Value A");
  expect(formData["template 2 folder 1 file B"]).toBe("Value B");
  expect(formData["template 2 folder 1 file C"]).toBe("Value C");
});

test("can change templates folder", async () => {
  const directory = createTempDirectory();
  fse.copySync(expectedStateTwo.templatesLocation, directory);
  await store.dispatch(setTemplatePath(directory));

  const expectedState = expectedStateTwo.get(directory);

  fse.moveSync(
    path.join(directory, "folderOne"),
    path.join(directory, "folder1")
  );

  expectedState.templates.activeFolder = "folderThree";

  expectedState.templates.subfolders["folder1"] =
    expectedState.templates.subfolders["folderOne"];

  delete expectedState.templates.subfolders["folderOne"];

  await sleep(500);
  expect(store.getState()).toStrictEqual(expectedState);
});

test("can rename file", async () => {
  const directory = createTempDirectory();
  fse.copySync(expectedStateTwo.templatesLocation, directory);
  await store.dispatch(setTemplatePath(directory));

  const expectedState = expectedStateTwo.get(directory);
  fse.moveSync(
    path.join(directory, "folderOne", "A.docx"),
    path.join(directory, "folderOne", "D.docx")
  );

  expectedState.templates.subfolders["folderOne"].docxFiles["D.docx"] =
    expectedState.templates.subfolders["folderOne"].docxFiles["A.docx"];

  delete expectedState.templates.subfolders["folderOne"].docxFiles["A.docx"];

  await sleep(500);
  expect(store.getState()).toStrictEqual(expectedState);
});

test("first template becomes active", async () => {
  const directory = createTempDirectory();
  await store.dispatch(setTemplatePath(directory));

  const expectedState: ReturnType<typeof store.getState> = {
    settings: {
      templatesPath: directory,
    },

    templates: {
      subfolders: {},
      activeFolder: undefined,
    },
  };

  expect(store.getState()).toStrictEqual(expectedState);

  fse.mkdirSync(path.join(directory, "temp"));

  expectedState.templates.activeFolder = "temp";
  expectedState.templates.subfolders["temp"] = {
    formData: {},
    docxFiles: {},
  };

  await sleep(500);
  expect(store.getState()).toStrictEqual(expectedState);
});

test("deleting last template unsets active template", async () => {
  const directory = createTempDirectory();
  fse.copySync(expectedStateTwo.templatesLocation, directory);
  await store.dispatch(setTemplatePath(directory));

  await fse.remove(path.join(directory, "folderOne"));

  await sleep(500);
  expect(store.getState().templates.activeFolder).toBe("folderThree");

  await fse.remove(path.join(directory, "folderThree"));

  await sleep(500);
  expect(store.getState().templates.activeFolder).toBe("folderTwo");

  await fse.remove(path.join(directory, "folderTwo"));

  await sleep(500);

  expect(store.getState()).toStrictEqual({
    settings: {
      templatesPath: directory,
    },

    templates: {
      subfolders: {},
      activeTemplatesFolder: undefined,
    },
  });
});

test("files in the parent directory are ignored", async () => {
  const directory = createTempDirectory();
  fse.copySync(expectedStateTwo.templatesLocation, directory);
  await store.dispatch(setTemplatePath(directory));

  const expectedState = expectedStateTwo.get(directory);

  fse.copySync(
    path.join(directory, "folderOne", "A.docx"),
    path.join(directory, "A.docx")
  );

  await sleep(500);
  expect(store.getState()).toStrictEqual(expectedState);
});

test("dirs in children directories are ignored", async () => {
  const directory = createTempDirectory();
  fse.copySync(expectedStateTwo.templatesLocation, directory);
  await store.dispatch(setTemplatePath(directory));

  const expectedState = expectedStateTwo.get(directory);

  fse.copySync(
    path.join(directory, "folderTwo"),
    path.join(directory, "folderOne", "Directory")
  );

  await sleep(500);
  expect(store.getState()).toStrictEqual(expectedState);
});

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
