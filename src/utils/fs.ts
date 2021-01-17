import { lstat, readdir } from "fs";
import { promisify } from "util";

import filterAsync from "node-filter-async";
import path from "path";
import assert from "assert";

export async function getChildDirectories(
  parentDirectory: string
): Promise<string[]> {
  const allFiles = (await promisify(readdir)(parentDirectory)).map((x) =>
    path.join(parentDirectory, x)
  );
  const directories = await filterAsync(allFiles, async (x) =>
    (await promisify(lstat)(x)).isDirectory()
  );
  return directories;
}

// extensions should start from dot (e.g. ".docx")
export async function getChildFiles(
  parentDirectory: string,
  extensions: string[]
): Promise<string[]> {
  extensions.forEach((x) => assert(x[0] === "."));

  const allFiles = (await promisify(readdir)(parentDirectory)).map((x) =>
    path.join(parentDirectory, x)
  );

  const docxFiles = await filterAsync(
    allFiles,
    async (x) =>
      (await promisify(lstat)(x)).isFile() &&
      extensions.includes(path.extname(x))
  );

  return docxFiles;
}
