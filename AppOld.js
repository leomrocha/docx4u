import React from "react";
import "./App.css";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import DocxNavBar from "./views/nav_bar";
import About from "./views/about";
import Login from "./views/login";
import Home from "./views/home";
import TemplateEditor from "./views/template_editor";

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

function App() {
  return (
    <Router>
      <DocxNavBar />
      <div>
        <Switch>
          <Route path="/">
            <Home />
          </Route>
          <Route path="/template_editor">
            <TemplateEditor />
          </Route>
          <Route path="/about">
            <About />
          </Route>
          <Route path="/login">
            <Login />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}
export default App;
