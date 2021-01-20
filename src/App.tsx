import React from "react";
import "./App.css";

import isElectron from "is-electron";

import { Provider as ReduxProvider } from "react-redux";
import { ConfirmProvider } from "material-ui-confirm";
import { store } from "./state/Store";
import { initSettings } from "./state/Settings";
import Main from "./views/Main";

/* 
 Some other helper things that might be of use in the future:

 # docx viewers
 Some short reddit discussion  https://www.reddit.com/r/reactjs/comments/cdtg7e/displaying_any_file_xls_xlsx_doc_docx_pdf_txt_and/
 https://github.com/plangrid/react-file-viewer#readme
 https://stackoverflow.com/questions/27957766/how-do-i-render-a-word-document-doc-docx-in-the-browser-using-javascript
 https://jsfiddle.net/gcuzq343/
 https://jsfiddle.net/7xr419yb/
 https://stackoverflow.com/questions/27957766/how-do-i-render-a-word-document-doc-docx-in-the-browser-using-javascript

 // Templating:

 Docx-templates
 https://www.npmjs.com/package/docx-templates
 

 Easy template
 https://github.com/alonrbar/easy-template-x#raw-xml-plugin

 Convert to PDF
 https://github.com/NativeDocuments/docx-wasm-client-side
*/

store.dispatch(initSettings());

function App() {
  return (
    <ConfirmProvider>
      <ReduxProvider store={store}>
        <div className="App">
          {isElectron() ? (
            <Main />
          ) : (
            "There is no website yet.\n yarn run electron:dev"
          )}
        </div>
      </ReduxProvider>
    </ConfirmProvider>
  );
}

export default App;
