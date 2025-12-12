"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import "suneditor/dist/css/suneditor.min.css";

// Dynamically import SunEditor to avoid SSR issues
const SunEditor = dynamic(() => import("suneditor-react"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] animate-pulse rounded-md border bg-muted" />
  ),
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
  disabled?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing...",
  height = "400px",
  disabled = false,
}: RichTextEditorProps) {

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorOptions: any = useMemo(
    () => ({
      buttonList: [
        ["undo", "redo"],
        ["font", "fontSize", "formatBlock"],
        ["bold", "italic", "underline", "strike"],
        ["fontColor", "hiliteColor"],
        ["removeFormat"],
        "/", // Line break
        ["outdent", "indent"],
        ["align", "horizontalRule", "list", "lineHeight"],
        ["table", "link", "image"],
        ["fullScreen", "showBlocks", "codeView"],
      ],
      defaultStyle: "font-family: inherit; font-size: 16px;",
      height,
      minHeight: "200px",
      placeholder,
      showPathLabel: false,
      resizingBar: true,
      // charCounter disabled - causes getCharCount error in suneditor-react
      charCounter: false,
      formats: ["p", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "pre"],
      font: [
        "Arial",
        "Comic Sans MS",
        "Courier New",
        "Georgia",
        "Impact",
        "Lucida Console",
        "Tahoma",
        "Times New Roman",
        "Trebuchet MS",
        "Verdana",
      ],
      fontSize: [
        8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72,
      ],
      colorList: [
        "#000000",
        "#333333",
        "#666666",
        "#999999",
        "#CCCCCC",
        "#FFFFFF",
        "#FF0000",
        "#FF5722",
        "#FF9800",
        "#FFC107",
        "#FFEB3B",
        "#CDDC39",
        "#8BC34A",
        "#4CAF50",
        "#009688",
        "#00BCD4",
        "#03A9F4",
        "#2196F3",
        "#3F51B5",
        "#673AB7",
        "#9C27B0",
        "#E91E63",
      ],
      imageUploadUrl: "/api/admin/upload",
      imageAccept: ".jpg,.jpeg,.png,.gif,.webp",
      imageGalleryUrl: "/api/admin/images",
    }),
    [height, placeholder]
  );

  return (
    <div className="rich-text-editor">
      <SunEditor
        setContents={value}
        onChange={onChange}
        setOptions={editorOptions}
        disable={disabled}
      />
      <style jsx global>{`
        .sun-editor {
          border-radius: 0.5rem;
          border-color: hsl(var(--border));
        }
        .sun-editor .se-toolbar {
          border-radius: 0.5rem 0.5rem 0 0;
          background-color: hsl(var(--muted));
        }
        .sun-editor .se-wrapper {
          background-color: hsl(var(--background));
        }
        .sun-editor .se-wrapper .se-placeholder {
          color: hsl(var(--muted-foreground));
        }
        .sun-editor-editable {
          font-family: inherit;
        }
        .sun-editor .se-resizing-bar {
          background-color: hsl(var(--muted));
          border-color: hsl(var(--border));
        }
        .dark .sun-editor .se-toolbar {
          background-color: hsl(var(--muted));
        }
        .dark .sun-editor .se-btn {
          color: hsl(var(--foreground));
        }
        .dark .sun-editor .se-wrapper .se-wrapper-inner {
          background-color: hsl(var(--background));
        }
        .dark .sun-editor-editable {
          color: hsl(var(--foreground));
          background-color: hsl(var(--background));
        }
      `}</style>
    </div>
  );
}
