/**
 * Helps with the conversion of the docx template to a form with fields and validations
 *
 */
import fs from "fs";
import { promisify } from "util";
import { TemplateHandler, Delimiters, TemplateData } from "easy-template-x";
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

export async function extractTagsFromDocxFiles(
  docxFiles: string[]
): Promise<Set<string>> {
  const tags = new Set<string>();
  await Promise.all(
    docxFiles.map(async (docxFile) => {
      try {
        (await extractTagsFromFile(docxFile)).forEach((x) => tags.add(x));
      } catch (e) {
        console.error(e);
      }
    })
  );

  return tags;
}

async function extractTagsFromFile(fname: string): Promise<string[]> {
  // unless something else happens, I'll set the tags
  const templateContent = await promisify(fs.readFile)(fname);
  return await extractFields(delimiters, templateContent);
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
