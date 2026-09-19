import { processFiles } from "./process";
import type { FileTask, FileResult } from "./domain";
const scope = self as unknown as {
  onmessage: ((event: MessageEvent<FileTask>) => void) | null;
  postMessage: (value: {
    id: number;
    result?: FileResult;
    error?: string;
  }) => void;
};
scope.onmessage = async ({ data }) => {
  try {
    scope.postMessage({ id: data.id, result: await processFiles(data) });
  } catch (e) {
    const message = e instanceof Error ? e.message : "";
    const known =
      /Choose|Use |must|combined|browser|Quality|Dimensions|Output dimensions|no pages|Enter|valid page|does not exist|Could not compress|Try a smaller|too small/.test(
        message,
      );
    scope.postMessage({
      id: data.id,
      error: known
        ? message
        : "This file could not be processed. Try an undamaged, unencrypted file.",
    });
  }
};
