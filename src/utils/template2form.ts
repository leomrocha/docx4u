/**
 * Helps with the conversion of the docx template to a form with fields and validations
 *
 */
import fs from "fs";
import { promisify } from "util";
import {
  TemplateHandler,
  Delimiters,
  TemplateData,
  Binary,
} from "easy-template-x";
import { extractFields } from "./extractFields";

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

export { extractTagsFromFile, convertFile };
