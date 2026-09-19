"use client";
import dynamic from "next/dynamic";
import ToolWorkspace from "./ToolWorkspace";
const FileStudio = dynamic(() => import("./FileStudio"));
const QrCreator = dynamic(() => import("./QrCreator"));
const InvoiceMaker = dynamic(() => import("./InvoiceMaker"));
const BiodataMaker = dynamic(() => import("./BiodataMaker"));
const ResumeMaker = dynamic(() => import("./ResumeMaker"));
const PdfInfoViewer = dynamic(() => import("./PdfInfoViewer"));
export default function ToolRenderer({ slug }: { slug: string }) {
  return (
    <>
      {slug === "qr-code-generator" ? (
        <QrCreator />
      ) : slug === "invoice-maker" ? (
        <InvoiceMaker />
      ) : slug === "biodata-maker" ? (
        <BiodataMaker />
      ) : slug === "resume-maker" ? (
        <ResumeMaker />
      ) : slug === "image-compressor" ||
        slug === "image-resizer" ||
        slug === "image-format-converter" ||
        slug === "image-rotator-flipper" ||
        slug === "rotate-pdf" ||
        slug === "add-page-numbers-to-pdf" ||
        slug === "merge-pdf" ||
        slug === "images-to-pdf" ||
        slug === "split-pdf" ||
        slug === "organize-pdf-pages" ||
        slug === "watermark-pdf" ||
        slug === "passport-photo-maker" ||
        slug === "social-media-image-resizer" ? (
        <FileStudio slug={slug} />
      ) : slug === "pdf-page-counter" ? (
        <PdfInfoViewer />
      ) : (
        <ToolWorkspace slug={slug} />
      )}
    </>
  );
}
