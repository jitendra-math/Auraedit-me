<script>
  import { onMount } from "svelte";
  import AuraFS from "../core/auraFS.js";
  import TreeItem from "./TreeItem.svelte";

  let tree = [];

  function refresh() {
    tree = AuraFS.project.root || [];
  }

  onMount(() => {
    refresh();
    window.addEventListener("refresh-tree", refresh);
    return () => window.removeEventListener("refresh-tree", refresh);
  });
</script>

<div class="text-sm select-none">
  {#if tree.length === 0}
    <div class="p-6 text-center text-zinc-500">
      No files yet
    </div>
  {/if}

  {#each tree as node}
    <TreeItem {node} depth={0}/>
  {/each}
</div>
