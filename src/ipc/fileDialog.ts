import {
  RendererToMainChannel,
  RpcMainEvent,
  RpcMainHandler,
} from "@wexond/rpc-electron";

interface FileService {
  start(postfix: string): string;
}

const fileServiceChannel = new RendererToMainChannel<FileService>(
  "file-service"
);

// RENDER PROCESS PART
export const fileService = () => fileServiceChannel.getInvoker();

// MAIN PROCESS PART
export function registerFileService() {
  class FileServiceHandler implements RpcMainHandler<FileService> {
    start(e: RpcMainEvent, postfix: string): string {
      return "I TOLD YOU TO NOT PRESS THE BUTTON! " + postfix;
    }
  }

  fileServiceChannel.getReceiver().handler = new FileServiceHandler();
}
