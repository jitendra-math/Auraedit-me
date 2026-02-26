<script>
  import { onMount } from "svelte";
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

    // autosave
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
    if (node.name.endsWith(".css")) mode = "css";
    if (node.name.endsWith(".jsx")) mode = "jsx";

    editor.setOption("mode", mode);
    editor.setValue(node.content || "");
    editor.clearHistory();
  }

  onMount(() => {
    initEditor();

    window.addEventListener("open-file", (e) => {
      openFile(e.detail);
    });

    window.addEventListener("open-first-file", () => {
      const first = findFirstFile(AuraFS.project.root);
      if (first) openFile(first.id);
    });
  });

  function findFirstFile(nodes) {
    for (const n of nodes) {
      if (n.type === "file") return n;
      if (n.children) {
        const f = findFirstFile(n.children);
        if (f) return f;
      }
    }
    return null;
  }
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