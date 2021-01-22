/**
 * Helps with the conversion of the docx template to a form with fields and validations
 *
 */
import fs from "fs";
import JSZip from "jszip";
import { mainProcessService } from "../ipc/mainProcessService";
import { FolderData } from "../state/Templates";
import fse from "fs-extra";

import os from "os";

import { promisify } from "util";
import {
  TemplateHandler,
  Delimiters,
  TemplateData,
  Binary,
} from "easy-template-x";
import { extractFields } from "./extractFields";
import path from "path";

//TODO make the delimiters custom
const delimiters: Partial<Delimiters> = {
  tagStart: "{%",
  tagEnd: "%}",
  // tagStart: "{{",
  // tagEnd: "}}",
  // containerTagOpen: ">>",
  // containerTagClose: "<<",
};

export async function extractTagsFromContent(
  content: Binary
): Promise<string[]> {
  return await extractFields(delimiters, content);
}

async function extractTagsFromFile(fname: string): Promise<string[]> {
  const templateContent = await promisify(fs.readFile)(fname);
  return await extractTagsFromContent(templateContent);
}

async function convertFile(
  templatePath: string,
  outputPath: string,
  templateData: TemplateData
) {
  const handler = new TemplateHandler({
    delimiters,
  });

  const templateContent = await promisify(fs.readFile)(templatePath);
  const convertedDoc = await handler.process(templateContent, templateData);
  await promisify(fs.writeFile)(outputPath, convertedDoc);
}

export async function generateZip(
  folder: FolderData,
  activeFolderName: string
) {
  const zip = new JSZip();

  const handler = new TemplateHandler({
    delimiters,
  });

  let resultPathPromise = mainProcessService().showSaveDialog(
    path.join(os.homedir(), "Documents", activeFolderName)
  );

  await Promise.all(
    Object.keys(folder.docxFiles).map(async (docxFile) => {
      const templateData = folder.docxFiles[docxFile];
      const content = templateData.contentBase64;
      if (!content) return;
      if (templateData.malformed) {
        zip.file<"base64">(docxFile, content, {
          base64: true,
        });
      } else {
        const convertedFileBuffer = await handler.process(
          Buffer.from(content, "base64"),
          folder.formData
        );

        zip.file<"base64">(docxFile, convertedFileBuffer.toString("base64"), {
          base64: true,
        });
      }
    })
  );

  const content = await zip.generateAsync<"nodebuffer">({ type: "nodebuffer" });

  if (!content) return;
  const resultPath = await resultPathPromise;
  if (!resultPath) return;

  await fse.writeFile(resultPath, content);
}

export { extractTagsFromFile, convertFile };
