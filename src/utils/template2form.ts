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

/**
 *
 * @param {*} fname file name and path from where to extract the template fields for the form
 * @returns (template, fields) template object (to fill it later) and the fields (with proper elements) for the FORM
 */
async function extractTagsFromFile(fname: string): Promise<string[]> {
  // unless something else happens, I'll set the tags
  const templateContent = await promisify(fs.readFile)(fname);
  return await extractFields(delimiters, templateContent);
}

async function convertFile(
  templatePath: string,
  outputPath: string,
  formData: Map<string, string>
) {
  const handler = new TemplateHandler({
    delimiters,
  });

  const templateData: TemplateData = {};
  formData.forEach((value, key) => {
    templateData[key] = value;
  });

  const templateContent = await promisify(fs.readFile)(templatePath);
  const convertedDoc = await handler.process(templateContent, templateData);
  await promisify(fs.writeFile)(outputPath, convertedDoc);
}

export { extractTagsFromFile, convertFile };
