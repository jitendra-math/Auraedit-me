<script>
  import AuraFS from "../core/auraFS.js";
  import { activeFileId, setActiveFile, setSelectedFolder } from "../stores/projectStore.js";

  export let node;
  export let depth = 0;

  function toggleFolder() {
    node.isOpen = !node.isOpen;
    AuraFS.saveToDB();
    setSelectedFolder(node.id);
    window.dispatchEvent(new CustomEvent("refresh-tree"));
  }

  function openFile() {
    setActiveFile(node.id);
    window.dispatchEvent(new CustomEvent("open-file", { detail: node.id }));
  }

  function newFile() {
    const name = prompt("File name:", "file.js");
    if (!name) return;
    AuraFS.addNode(node.id, name, "file", "");
    window.dispatchEvent(new CustomEvent("refresh-tree"));
  }

  function newFolder() {
    const name = prompt("Folder name:", "folder");
    if (!name) return;
    AuraFS.addNode(node.id, name, "folder");
    window.dispatchEvent(new CustomEvent("refresh-tree"));
  }

  function rename() {
    const name = prompt("Rename:", node.name);
    if (!name) return;
    node.name = name;
    AuraFS.saveToDB();
    window.dispatchEvent(new CustomEvent("refresh-tree"));
  }

  function del() {
    if (!confirm("Delete?")) return;
    AuraFS.deleteNode(node.id);
    window.dispatchEvent(new CustomEvent("refresh-tree"));
  }

  function getIcon() {
    if (node.type === "folder") return node.isOpen ? "ri-folder-open-fill" : "ri-folder-fill";
    if (node.name.endsWith(".js")) return "ri-javascript-fill";
    if (node.name.endsWith(".css")) return "ri-css3-fill";
    if (node.name.endsWith(".html")) return "ri-html5-fill";
    return "ri-file-code-fill";
  }
</script>

<div class="group">
  <div
    class="flex items-center pr-2 hover:bg-soft transition"
    class:bg-accent={$activeFileId === node.id}
    style="padding-left:{depth * 16 + 14}px;height:42px"
  >
    <div
      class="flex-1 flex items-center gap-2 overflow-hidden"
      on:click={() => node.type === 'folder' ? toggleFolder() : openFile()}
    >
      <i class="{getIcon()} text-zinc-400"></i>
      <span class="truncate">{node.name}</span>
    </div>

    <div class="opacity-0 group-hover:opacity-100 flex gap-2 text-zinc-500">
      {#if node.type === "folder"}
        <i class="ri-file-add-line cursor-pointer" on:click={newFile}></i>
        <i class="ri-folder-add-line cursor-pointer" on:click={newFolder}></i>
      {/if}
      <i class="ri-edit-line cursor-pointer" on:click={rename}></i>
      <i class="ri-delete-bin-line cursor-pointer" on:click={del}></i>
    </div>
  </div>

  {#if node.type === "folder" && node.isOpen}
    {#each node.children as child}
      <svelte:self node={child} depth={depth + 1}/>
    {/each}
  {/if}
</div>
