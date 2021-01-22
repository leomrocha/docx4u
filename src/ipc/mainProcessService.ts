import {
  RendererToMainChannel,
  RpcMainEvent,
  RpcMainHandler,
} from "@wexond/rpc-electron";

import { dialog, BrowserWindow } from "electron";

// A service implemented in the Main Process and accessible in the Renderer Process.
// Things to keep in mind:
// 0) Do not run synchronious operations in the Main process. Use async/await
// 1) Do not throw exceptions. Return undefined instead
// 2) Main Process have to be stateless
// 3) Main Process should contain only simple functions impossible to implement in the Renderer process
// 4) The Main Process shouldn't have any logic anywhere besides MainProcessService.
// 5) The Renderer Process is the King. The Main Process is just a mere servant.
// 6) @wexond/rpc-electron doesn't support callbacks :(
interface MainProcessService {
  showSaveDialog(defaultPath: string): Promise<string | undefined>;
}

const channel = new RendererToMainChannel<MainProcessService>(
  "main-process-service"
);

export const mainProcessService = () => channel.getInvoker();

export async function registerFileService(browserWindow: BrowserWindow) {
  class MainProcessServiceImpl implements RpcMainHandler<MainProcessService> {
    async showSaveDialog(
      e: RpcMainEvent,
      defaultPath: string
    ): Promise<string | undefined> {
      return (
        await dialog.showSaveDialog(browserWindow, {
          defaultPath,
          properties: ["showOverwriteConfirmation", "createDirectory"],
          filters: [{ name: "Zip Archive", extensions: ["zip"] }],
        })
      ).filePath;
    }
  }

  channel.getReceiver().handler = new MainProcessServiceImpl();
}
