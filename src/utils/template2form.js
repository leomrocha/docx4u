/**
 * Helps with the conversion of the docx template to a form with fields and validations
 *
 */
import fs from "fs";
import { TemplateHandler, ScopeData } from 'easy-template-x';


class CustomTemplateHandler extends (TemplateHandler) {
  async getFields(templateFile, data) {
    var xmlFields = []

        // load the docx file
        const docx = await this.loadDocx(templateFile);

        // prepare context
        const scopeData = new ScopeData(data);
        const context = {
            docx,
            currentPart: null
        };

    const contentParts = await docx.getContentParts()
    
        for (const part of contentParts) {

            context.currentPart = part;

            // extensions - before compilation
            await this.callExtensions(this.options.extensions?.beforeCompilation, scopeData, context);

            // compilation (do replacements)
            const xmlRoot = await part.xmlRoot();
            xmlFields.push(xmlRoot)
        }

        // export the result
        return xmlFields

    }

}

/**
 *
 * @param {*} fname file name and path from where to extract the template fields for the form
 * @returns (template, fields) template object (to fill it later) and the fields (with proper elements) for the FORM
 */
async function extractFields(fname) {

  // unless something else happens, I'll set the tags 
  const handler = new CustomTemplateHandler({
              delimiters: {
                  tagStart: '{%',
                  tagEnd: '%}',
                  containerTagOpen: '{>',
                  containerTagClose: '<}'
              }
          });
  const templateFile = fs.readFileSync(fname)
  // console.log(templateFile)

  try {
    const fields = await handler.getFields(templateFile)
    return fields
  } catch (e) {
    console.log("ERROR reading the file")
    console.error(e)
  }
  
  // return (templateFile, fields)
}

async function fillTemplate(handler, template, data) {
  const doc = await handler.process(template, data);
  const docXml = await handler.getXml(doc);
  return docXml
}

export {
    extractFields,
    fillTemplate
}