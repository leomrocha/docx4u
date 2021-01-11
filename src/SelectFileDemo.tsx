import { Button } from "@material-ui/core";
import { fileService } from "./ipc/fileDialog";

export default function SelectFileDemo() {
  return (
    <Button
      onClick={async () => {
        console.log(await fileService().start("YOU HAD ONE JOB!"));
      }}
    >
      Do not press me
    </Button>
  );
}
