import * as Y from "yjs";
import { yCollab } from "y-codemirror.next";
import { WebsocketProvider } from "y-websocket";
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { useEffect, useRef } from "react";

export default function CodingEditor() {
  const elementRef = useRef(null);

  useEffect(() => {
    // Initialize YJS document
    const ydoc = new Y.Doc();

    // Set up WebSocket provider to connect to local server on ws://localhost:1234
    const provider = new WebsocketProvider(
      "ws://localhost:1234", // Local WebSocket server URL
      "room123",              // Room name for collaboration
      ydoc                     // YJS document
    );

    // Log WebSocket connection status
    provider.on("status", (event) => {
      console.log("WebSocket status:", event.status); // Logs "connected" or "disconnected"
    });

    // Create a shared text type for CodeMirror binding
    const yText = ydoc.getText("codemirror");
    const undoManager = new Y.UndoManager(yText);

    // Set a placeholder user for testing
    provider.awareness.setLocalStateField("user", {
      name: "Local User",
      color: "#30bced",
      colorLight: "#30bced33",
    });

    // Define CodeMirror editor appearance
    const fixedHeightEditor = EditorView.theme({
      "&": { height: "100%" },
      ".cm-scroller": { overflow: "auto" },
    });

    // Create the initial state for CodeMirror with YJS collaboration
    const state = EditorState.create({
      doc: yText.toString(),
      extensions: [
        basicSetup,
        javascript(),
        fixedHeightEditor,
        yCollab(yText, provider.awareness, { undoManager }),
      ],
    });

    // Initialize the editor view
    const view = new EditorView({
      state,
      parent: elementRef.current,
    });

    // Cleanup on component unmount
    return () => {
      ydoc.destroy();
      provider.disconnect();
      view.destroy();
    };
  }, []);

  return (
    <div
      ref={elementRef}
      style={{
        height: "100%",
        width: "50vw",
        border: "1px solid #000",
        margin: "0 auto",
      }}
    />
  );
}