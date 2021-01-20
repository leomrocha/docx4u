// TODO: migrate to something that parses haeder and footer
import mammoth from "mammoth";
import React from "react";

interface DocxViewProps {
  base64: string;
}

export default function DocxView(props: DocxViewProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    (async () => {
      const result = await mammoth.convertToHtml({
        arrayBuffer: Buffer.from(props.base64, "base64"),
      });

      if (ref.current) ref.current.innerHTML = result.value;
    })();
  }, [props.base64]);

  return <div ref={ref}></div>;
}
