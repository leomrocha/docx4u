import { Docx, XmlParser, Zip } from "easy-template-x";
import React from "react";
import DocxView from "./DocxView";

interface EditDocxProps {
  fullPath: string;
  base64Content: string;
}
export default function AddTagsToDocx(props: EditDocxProps) {
  // TODO: implement docx editing
  const [docx, setDocx] = React.useState<Docx | undefined>();

  React.useEffect(() => {
    (async () => {
      const zip = await Zip.load(Buffer.from(props.base64Content, "base64"));
      const docx = await Docx.open(zip, new XmlParser());
      await docx.getContentParts();

      setDocx(docx);
    })();
  }, [props.base64Content]);

  return (
    <div>
      {props.fullPath} <DocxView base64={props.base64Content}></DocxView>
    </div>
  );
}
