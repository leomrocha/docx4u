import React from "react";
import { Button, TextField } from "@material-ui/core";
import { mainProcessService } from "./ipc/mainProcessService";
import { extractTagsFromFile, convertFile } from "./utils/template2form";
import assert from "assert";

export default function SelectFileDemo() {
  const [selectedFile, setSelectedFile] = React.useState<string>("");
  const [formData, setFormData] = React.useState<Map<string, string>>(
    new Map()
  );

  console.log(formData);

  return (
    <React.Fragment>
      <Button
        onClick={async () => {
          const files = await mainProcessService().pickFile();
          assert(files && files.length === 1);
          setSelectedFile(files[0]);
          const tags = await extractTagsFromFile(files[0]);

          setFormData((oldMap) => {
            const newMap = new Map<string, string>();
            for (const tag of tags) {
              const oldValue = oldMap.get(tag);
              if (oldValue) {
                newMap.set(tag, oldValue);
              } else {
                newMap.set(tag, "");
              }
            }

            return newMap;
          });
        }}
      >
        Do not press me
      </Button>
      <div>{selectedFile}</div>
      {Array.from(formData.entries()).map(([tag, value]) => (
        <div>
          <p> {tag} </p>
          <TextField
            id={tag}
            onChange={(event) => {
              setFormData((oldMap) => {
                const newMap = new Map(oldMap);
                newMap.set(tag, event.target.value);
                return newMap;
              });
            }}
            value={value}
          ></TextField>
        </div>
      ))}

      {formData.size > 0 && (
        <Button
          onClick={async () => {
            const files = await mainProcessService().pickFile();
            assert(files && files.length === 1);
            assert(files[0] !== selectedFile);

            convertFile(selectedFile, files[0], formData);
          }}
        >
          If I say DO NOT PRESS ME You won't change your mind. Right?
        </Button>
      )}
    </React.Fragment>
  );
}
