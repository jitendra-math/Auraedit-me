<script>
  import { onMount, onDestroy } from "svelte";
  import AuraFS from "../core/auraFS.js";
  import { activeFileId } from "../stores/projectStore.js";
  import { get } from "svelte/store";

  let editor;
  let container;

  function initEditor() {
    editor = CodeMirror(container, {
      value: "",
      mode: "javascript",
      theme: "dracula",
      lineNumbers: true,
      tabSize: 2,
      indentUnit: 2,
      matchBrackets: true,
      autoCloseBrackets: true,
      autoCloseTags: true,
      lineWrapping: false
    });

    // cursor position
    editor.on("cursorActivity", () => {
      const pos = editor.getCursor();
      const text = `Ln ${pos.line + 1}, Col ${pos.ch + 1}`;
      window.dispatchEvent(new CustomEvent("cursor-update", { detail: text }));
    });

    // autosave handled by auraFS debounce
    editor.on("change", () => {
      const id = get(activeFileId);
      if (!id) return;
      AuraFS.updateFile(id, editor.getValue());
    });
  }

  function openFile(id) {
    const node = AuraFS.findNode(id);
    if (!node) return;

    let mode = "javascript";

    if (node.name.endsWith(".html")) mode = "htmlmixed";
    else if (node.name.endsWith(".css")) mode = "css";
    else if (node.name.endsWith(".json")) mode = "application/json";
    else if (node.name.endsWith(".md")) mode = "markdown";
    else if (node.name.endsWith(".ts")) mode = "javascript";
    else if (node.name.endsWith(".jsx")) mode = "jsx";

    editor.setOption("mode", mode);
    editor.setValue(node.content || "");
    editor.clearHistory();
    editor.focus();
  }

  function openFirstFile() {
    const find = (nodes) => {
      for (const n of nodes) {
        if (n.type === "file") return n;
        if (n.children) {
          const f = find(n.children);
          if (f) return f;
        }
      }
      return null;
    };

    const first = find(AuraFS.project.root);
    if (first) openFile(first.id);
  }

  let openHandler;
  let firstHandler;

  onMount(() => {
    initEditor();

    openHandler = (e) => openFile(e.detail);
    firstHandler = () => openFirstFile();

    window.addEventListener("open-file", openHandler);
    window.addEventListener("open-first-file", firstHandler);
  });

  onDestroy(() => {
    window.removeEventListener("open-file", openHandler);
    window.removeEventListener("open-first-file", firstHandler);
  });
</script>

<div class="absolute inset-0">
  <div bind:this={container} class="h-full w-full"></div>
</div>

<style>
  :global(.CodeMirror) {
    height: 100%;
    font-family: "JetBrains Mono", monospace;
    font-size: 14px;
    background: #0f0f14;
  }
</style>
