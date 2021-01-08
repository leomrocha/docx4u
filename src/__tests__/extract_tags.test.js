import React from "react";
// const request = require('supertest')
var assert = require("assert");
const fs = require("fs");

var { extractTagsFromFile, fillTemplate } = require("../utils/template2form");

test("tries to open a template file", async () => {
  const obj = await extractTagsFromFile(
    // "src/__tests__/fixtures/files/empty tag.docx"
    // "src/__tests__/fixtures/files/header and footer.docx"
    // "src/__tests__/fixtures/files/header and footer - loop.docx"
     "src/__tests__/fixtures/files/loop - table.docx"
    // "src/__tests__/fixtures/files/facture.docx"
    // "src/__tests__/fixtures/files/real life - he.docx"
    // "src/__tests__/fixtures/files/custom delimiters.docx"
    // "src/__tests__/fixtures/files/simple.docx"
    // "src/__tests__/fixtures/files/link.docx"
  );

  console.log("Object Fields = ", obj);
  // console.log("xml Object Fields = ", obj["obj"]);
  // console.log("JSON fields = ", JSON.stringify(obj["json"], null, 2));
  // console.log("FORM fields = ", JSON.stringify(obj["form"], null, 2));
  console.log("FORM fields = ", obj["form"]);
  // TODO
  assert(true);
});

// test("opens a template file and converts it to json", async () => {
//   const obj = await extractTags(
//     // "src/__tests__/fixtures/files/empty tag.docx"
//     // "src/__tests__/fixtures/files/header and footer.docx"
//     // "src/__tests__/fixtures/files/header and footer - loop.docx"
//     // "src/__tests__/fixtures/files/loop - table.docx"
//     "src/__tests__/fixtures/files/facture.docx"
//     // "src/__tests__/fixtures/files/real life - he.docx"
//     // "src/__tests__/fixtures/files/custom delimiters.docx"
//     // "src/__tests__/fixtures/files/simple.docx"
//     // "src/__tests__/fixtures/files/link.docx"
//   );
//   const jsn = tags2json(obj);
//   console.log("JSON  = ", jsn);
//   assert(true);
// });
