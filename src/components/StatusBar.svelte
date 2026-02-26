<script>
  import { activeFileId } from "../stores/projectStore.js";
  import { onMount } from "svelte";
  import AuraFS from "../core/auraFS.js";

  let fileName = "READY";
  let cursor = "Ln 1, Col 1";

  function updateFileName(id) {
    if (!id) {
      fileName = "READY";
      return;
    }
    const node = AuraFS.findNode(id);
    if (node) fileName = node.name.toUpperCase();
  }

  $: updateFileName($activeFileId);

  onMount(() => {
    window.addEventListener("cursor-update", (e) => {
      cursor = e.detail;
    });
  });
</script>

<footer class="h-6 px-3 flex items-center justify-between text-[11px] bg-accent text-white font-semibold">
  <span>{fileName}</span>
  <span>{cursor}</span>
</footer>