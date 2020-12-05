import React from "react";
// const request = require('supertest')
var assert = require('assert')
const fs = require('fs')

var { extractFields, fillTemplate } = require('../utils/template2form')

test("tries to open a template file", async () => {
    const obj = await extractFields('src/__tests__/fixtures/files/header and footer - loop.docx')
    console.log("Fields = ", obj)
    assert(true)
});
