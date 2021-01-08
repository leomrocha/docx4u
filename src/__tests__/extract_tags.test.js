import docx4js from 'docx4js';
import tmp from 'tmp';

// const request = require('supertest')
var assert = require('assert');
const fs = require('fs');
var {extractTagsFromFile, convertFile} = require('../utils/template2form');

async function getDocxInfo(filePath) {
  const docx = await docx4js.load(filePath);
  return {
    filePath: filePath,
    body: docx.officeDocument.content.text(),
    header: docx.getObjectPart('word/header1.xml')?.text(),
    footer: docx.getObjectPart('word/footer1.xml')?.text(),
  };
}

// test('tries to open a template file', async () => {
//   console.log(
//     await Promise.all(
//       [
//         'src/__tests__/fixtures/files/empty tag.docx',
//         'src/__tests__/fixtures/files/header and footer.docx',
//         'src/__tests__/fixtures/files/header and footer - loop.docx',
//         'src/__tests__/fixtures/files/loop - table.docx',
//         'src/__tests__/fixtures/files/real life - he.docx',
//         'src/__tests__/fixtures/files/custom delimiters.docx',
//         'src/__tests__/fixtures/files/simple.docx',
//         'src/__tests__/fixtures/files/link.docx',
//       ].map(async (x) => {
//         return {
//           ...(await getDocxInfo(x)),
//           extractedTags: await extractTagsFromFile(x),
//         };
//       }),
//     ),
//   );

//   // TODO
//   assert(true);
// });

test('simple conversion (no loops)', async () => {
  const templatePath = 'src/__tests__/fixtures/files/header and footer.docx';
  const tags = await extractTagsFromFile(templatePath);
  const tempFile = tmp.fileSync();

  await convertFile(templatePath, tempFile.name, {
    [tags[0]]: 'BUDDY',
    [tags[1]]: 'HEADER',
    [tags[2]]: 'FOOTER',
  });

  const docxInfo = await getDocxInfo(tempFile.name);

  expect(docxInfo.footer).toBe('FOOTER');
  expect(docxInfo.header).toBe('HEADER');
  expect(docxInfo.body).toBe('BUDDY');

  // console.log(tempFile.name);
  tempFile.removeCallback();
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
