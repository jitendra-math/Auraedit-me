<script>
  import { onMount } from "svelte";
  import AuraFS from "../core/auraFS.js";
  import { setActiveFile, setSelectedFolder } from "../stores/projectStore.js";

  let tree = [];

  function refresh() {
    tree = AuraFS.project.root || [];
  }

  onMount(() => {
    refresh();
    window.addEventListener("refresh-tree", refresh);
  });

  function toggleFolder(node) {
    node.isOpen = !node.isOpen;
    AuraFS.saveToDB();
    refresh();
    setSelectedFolder(node.id);
  }

  function openFile(node) {
    setActiveFile(node.id);
    window.dispatchEvent(new CustomEvent("open-file", { detail: node.id }));
  }

  function newFile(parentId) {
    const name = prompt("File name:", "file.js");
    if (!name) return;
    AuraFS.addNode(parentId, name, "file", "");
    refresh();
  }

  function newFolder(parentId) {
    const name = prompt("Folder name:", "folder");
    if (!name) return;
    AuraFS.addNode(parentId, name, "folder");
    refresh();
  }

  function rename(node) {
    const name = prompt("Rename:", node.name);
    if (!name) return;
    node.name = name;
    AuraFS.saveToDB();
    refresh();
  }

  function del(node) {
    if (!confirm("Delete?")) return;
    AuraFS.deleteNode(node.id);
    refresh();
  }

  function getIcon(node) {
    if (node.type === "folder") return node.isOpen ? "ri-folder-open-fill" : "ri-folder-fill";
    if (node.name.endsWith(".js")) return "ri-javascript-fill";
    if (node.name.endsWith(".jsx")) return "ri-reactjs-line";
    if (node.name.endsWith(".css")) return "ri-css3-fill";
    if (node.name.endsWith(".html")) return "ri-html5-fill";
    return "ri-file-code-fill";
  }
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

<!-- Recursive tree item -->
{#if false}{/if}
<script>
  export let node;
  export let depth = 0;
</script>

<div class="group">
  <div
    class="flex items-center pr-2 hover:bg-soft"
    style="padding-left:{depth * 16 + 14}px;height:42px"
  >
    <div
      class="flex-1 flex items-center gap-2 overflow-hidden"
      on:click={() => node.type === 'folder' ? toggleFolder(node) : openFile(node)}
    >
      <i class="{getIcon(node)} text-zinc-400"></i>
      <span class="truncate">{node.name}</span>
    </div>

    <div class="opacity-0 group-hover:opacity-100 flex gap-2 text-zinc-500">
      {#if node.type === "folder"}
        <i class="ri-file-add-line cursor-pointer" on:click={() => newFile(node.id)}></i>
        <i class="ri-folder-add-line cursor-pointer" on:click={() => newFolder(node.id)}></i>
      {/if}
      <i class="ri-edit-line cursor-pointer" on:click={() => rename(node)}></i>
      <i class="ri-delete-bin-line cursor-pointer" on:click={() => del(node)}></i>
    </div>
  </div>

  {#if node.type === "folder" && node.isOpen}
    {#each node.children as child}
      <TreeItem node={child} depth={depth + 1}/>
    {/each}
  {/if}
</div>
