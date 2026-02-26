<script>
  import { activeFileId } from "../stores/projectStore.js";
  import { onMount, onDestroy } from "svelte";
  import AuraFS from "../core/auraFS.js";

  export let cursorText = "Ln 1, Col 1";

  let fileName = "No file";

  function updateFileName(id) {
    if (!id) {
      fileName = "No file";
      return;
    }

    const node = AuraFS.findNode(id);
    if (node) fileName = node.name;
  }

  $: updateFileName($activeFileId);

  let handler;

  onMount(() => {
    handler = (e) => {
      cursorText = e.detail;
    };
    window.addEventListener("cursor-update", handler);
  });

  onDestroy(() => {
    window.removeEventListener("cursor-update", handler);
  });
</script>

<footer class="h-6 px-3 flex items-center justify-between text-[11px] bg-accent text-white font-semibold">
  <span class="truncate max-w-[60%]">{fileName}</span>
  <span>{cursorText}</span>
</footer>
