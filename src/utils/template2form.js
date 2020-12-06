/**
 * Helps with the conversion of the docx template to a form with fields and validations
 *
 */
import fs from "fs";
import { TemplateHandler, ScopeData } from "easy-template-x";
import { group } from "console";

function singleTag2Json(tag) {
  const jsn = {
    rawText: String(tag.rawText),
    disposition: String(tag.disposition),
    name: String(tag.name),
  };
  return jsn;
  // return JSON.parse(JSON.stringify(jsn));
}

class CustomTemplateHandler extends TemplateHandler {
  async getFields(templateFile, data) {
    var xmlFields = [];
    var jsonFields = [];
    var jsonForm = [];
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
      // console.log("tags Type ", typeof tags);
      // console.log("Tags found: ", tags);
      // console.log("Found Node: ", xmlRoot.childNodes)
      // console.log("Node Keys: ", Object.keys(xmlRoot.childNodes))
      // for (const obj in xmlRoot.childNodes) {
      //   console.log("part text: ", JSON.stringify(obj))
      // }
      //TODO group tags depending on open and close
      let groups = [];
      let jsonGroups = {}; // JSON.parse(JSON.stringify([]));
      let currentGroupName = undefined;
      // let groupOpenFlag = false;
      for (const t of tags) {
        const jsnT = JSON.parse(JSON.stringify(singleTag2Json(t)));
        if (t.disposition === "Open") {
          // create new group with the current element as the first element
          // groupOpenFlag = true;
          groups.push([t]);
          currentGroupName = jsnT.name;
          jsonGroups[currentGroupName] = [];
          jsonForm[currentGroupName] = [{}];
          // create the json tag for this one:
        } else if (t.disposition === "Close") {
          // set this element in the current group
          // groupOpenFlag = false;
          groups[groups.length - 1].push(t);
          // set a new empty group
          groups.push([]);
          currentGroupName = undefined;
        } else {
          // disposition === 'SelfClosed'
          if (currentGroupName) {
            // we are adding elements in a group
            groups[groups.length - 1].push(t);
            jsonGroups[currentGroupName].push(jsnT);
            //groups can have repetitions, but the initial json has only one repetition
            // console.log("jsonForm: ", jsonForm);
            jsonForm[currentGroupName][0][jsnT.name] = jsnT.rawText;
          } else {
            // the element is self contained
            groups.push([t]);
            jsonGroups[jsnT.name] = jsnT;
            jsonForm[jsnT.name] = jsnT.rawText;
          }
        }
      }
      // console.log("jsonForm: ", jsonForm);
      // console.log("Found groups: ", groups);
      // now filter out empty groups and
      const res = groups.filter((g) => g.length > 0);
      // console.log("Filtered groups: ", res);
      if (groups.length > 0) xmlFields.push(res);
      jsonFields.push(jsonGroups);
      // jsonForm.push(jsonForm);
      // if (tags.length > 0) xmlFields.push(tags);
    }
    // export the result
    console.log("FORM generated: ", jsonForm);

    return {
      obj: xmlFields,
      json: jsonFields,
      // form: JSON.parse(JSON.stringify(jsonForm)),
      form: jsonForm,
    };
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
      // containerTagOpen: ">>",
      // containerTagClose: "<<",
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

function jsnTags2jsnForm(tags) {
  const jsnTags = JSON.parse(JSON.stringify(tags));
  var jsnForm = {};

  for (const group of jsnTags) {
    // each is a part, header, body, footer or others
    for (const tag of group) {
    }
    //
  }

  return jsnForm;
}

async function fillTemplate(handler, template, data) {
  const doc = await handler.process(template, data);
  const docXml = await handler.getXml(doc);
  return docXml;
}

export { extractTags, fillTemplate };
