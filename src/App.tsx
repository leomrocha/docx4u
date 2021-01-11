import React from "react";
import "./App.css";

import SelectFileDemo from "./SelectFileDemo";

import isElectron from "is-electron";

function App() {
  return (
    <div className="App">
      {isElectron() ? (
        <SelectFileDemo />
      ) : (
        "There is no website yet. yarn run electron:dev"
      )}
    </div>
  );
}

export default App;
