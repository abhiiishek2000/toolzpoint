import { inspectPdf, type PdfInfo } from "./inspect-pdf";
const scope = self as unknown as {
  onmessage: ((event: MessageEvent<ArrayBuffer>) => void) | null;
  postMessage(data: { info?: PdfInfo; error?: string }): void;
};
scope.onmessage = async ({ data }) => {
  try {
    scope.postMessage({ info: await inspectPdf(data) });
  } catch (error) {
    scope.postMessage({
      error:
        error instanceof Error
          ? error.message
          : "Could not read this PDF. Encrypted or damaged files are not supported.",
    });
  }
};
