/**
 * Helps with the conversion of the docx template to a form with fields and validations
 *
 */
import fs from "fs";
import { TemplateHandler, ScopeData } from "easy-template-x";

class CustomTemplateHandler extends TemplateHandler {
  async getFields(templateFile, data) {
    var xmlFields = [];

    // load the docx file
    const docx = await this.loadDocx(templateFile);

    // prepare context
    const scopeData = new ScopeData(data);
    const context = {
      docx,
      currentPart: null,
    };

    const contentParts = await docx.getContentParts();

    for (const part of contentParts) {
      context.currentPart = part;

      const xmlRoot = await part.xmlRoot();
      const tags = this.compiler.parseTags(xmlRoot);
      console.log("tags Type ", typeof tags);
      console.log("Tags found: ", tags);
      // console.log("Found Node: ", xmlRoot.childNodes)
      // console.log("Node Keys: ", Object.keys(xmlRoot.childNodes))
      // for (const obj in xmlRoot.childNodes) {
      //   console.log("part text: ", JSON.stringify(obj))
      // }

      if (tags.length > 0) xmlFields.push(tags);
    }

    // export the result

    return xmlFields;
  }
}

/**
 *
 * @param {*} fname file name and path from where to extract the template fields for the form
 * @returns (template, fields) template object (to fill it later) and the fields (with proper elements) for the FORM
 */
async function extractTags(fname) {
  // unless something else happens, I'll set the tags
  const handler = new CustomTemplateHandler({
    //TODO make the delimiters custom
    delimiters: {
      tagStart: "{%",
      tagEnd: "%}",
      // tagStart: "{{",
      // tagEnd: "}}",
      containerTagOpen: ">>",
      containerTagClose: "<<",
    },
  });
  const templateFile = fs.readFileSync(fname);
  // console.log(templateFile)

  try {
    const fields = await handler.getFields(templateFile);
    // console.log("doc text  = ", await handler.getText(templateFile));
    // console.log("Received fields = ", fields);
    return fields;
  } catch (e) {
    console.log("ERROR reading the file");
    console.error(e);
  }

  // return (templateFile, fields)
}

/**
 * Converts a list of tags into a json
 * @param {*} tagList A list of lists As returned by extractTags in this file
 */
function tags2json(tagList) {
  // TODO
  // each list tagList can contain different groups of tags, I'll start by the simplest ones
  for (const tag of tagList) {
  }
}

async function fillTemplate(handler, template, data) {
  const doc = await handler.process(template, data);
  const docXml = await handler.getXml(doc);
  return docXml;
}

export { extractTags, fillTemplate };
