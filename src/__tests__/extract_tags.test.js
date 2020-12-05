import React from "react";
// const request = require('supertest')
var assert = require("assert");
const fs = require("fs");

var { extractTags, fillTemplate } = require("../utils/template2form");

test("tries to open a template file", async () => {
  const obj = await extractTags(
    // "src/__tests__/fixtures/files/empty tag.docx"
    // "src/__tests__/fixtures/files/header and footer.docx"
    // "src/__tests__/fixtures/files/header and footer - loop.docx"
    // "src/__tests__/fixtures/files/loop - table.docx"
    "src/__tests__/fixtures/files/facture.docx"
    // "src/__tests__/fixtures/files/real life - he.docx"
    // "src/__tests__/fixtures/files/custom delimiters.docx"
    // "src/__tests__/fixtures/files/simple.docx"
    // "src/__tests__/fixtures/files/link.docx"
  );
  console.log("Fields = ", obj);
  assert(true);
});
