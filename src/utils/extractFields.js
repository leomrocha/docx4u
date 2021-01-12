import { TemplateHandler } from "easy-template-x";

// Code below doesn't convert to Typescript gracefully.
function singleTag2Json(tag) {
  const jsn = {
    rawText: String(tag.rawText),
    disposition: String(tag.disposition),
    name: String(tag.name),
  };
  return jsn;
}

class FieldsEnumerator extends TemplateHandler {
  async getFields(templateFile, data) {
    var xmlFields = [];
    var jsonFields = [];
    var jsonForm = [];
    // load the docx file
    const docx = await this.loadDocx(templateFile);

    // prepare context
    const context = {
      docx,
      currentPart: null,
    };

    const contentParts = await docx.getContentParts();

    for (const part of contentParts) {
      context.currentPart = part;

      const xmlRoot = await part.xmlRoot();
      const tags = this.compiler.parseTags(xmlRoot);
      // group tags depending on open and close
      let groups = [];
      let jsonGroups = {};
      let currentGroupName = undefined;
      for (const t of tags) {
        const jsnT = JSON.parse(JSON.stringify(singleTag2Json(t)));
        if (t.disposition === "Open") {
          // create new group with the current element as the first element
          groups.push([t]);
          currentGroupName = jsnT.name;
          jsonGroups[currentGroupName] = [];
          jsonForm[currentGroupName] = [{}];
          // create the json tag for this one:
        } else if (t.disposition === "Close") {
          // set this element in the current group
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
            jsonForm[currentGroupName][0][jsnT.name] = jsnT.rawText;
          } else {
            // the element is self contained
            groups.push([t]);
            jsonGroups[jsnT.name] = jsnT;
            jsonForm[jsnT.name] = jsnT.rawText;
          }
        }
      }
      // now filter out empty groups and
      const res = groups.filter((g) => g.length > 0);
      if (groups.length > 0) xmlFields.push(res);
      jsonFields.push(jsonGroups);
    }
    // export the result
    return Object.keys(jsonForm);
  }
}

export async function extractFields(delimiters, fileContent) {
  const handler = new FieldsEnumerator({
    delimiters,
  });

  return await handler.getFields(fileContent);
}
