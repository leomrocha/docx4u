/**
 * Helps with the conversion of the docx template to a form with fields and validations
 *
 */
import fs from "fs";
import { TemplateHandler } from 'easy-template-x';


/**
 *
 * @param {*} fname file name and path from where to extract the template fields for the form
 * @returns (template, fields) template object (to fill it later) and the fields (with proper elements) for the FORM
 */
function extract_fields(fname) {
  const templateFile = fs.readFileSync(fname);
  console.log(templateFile)
}

function fill_templates() {
  // TODO
}

export {
    extract_fields,
    fill_templates
}