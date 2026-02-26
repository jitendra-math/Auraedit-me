<script>
  import { onMount } from "svelte";
  import AuraFS from "../core/auraFS.js";
  import { activeFileId, selectedFolderId, setActiveFile, setSelectedFolder } from "../stores/projectStore.js";

  let tree = [];

  async function load() {
    tree = AuraFS.project.root || [];
  }

  onMount(() => {
    load();

    window.addEventListener("refresh-tree", load);
  });

  function toggleFolder(node) {
    node.isOpen = !node.isOpen;
    AuraFS.saveToDB();
    tree = [...tree];
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
    load();
  }

  function newFolder(parentId) {
    const name = prompt("Folder name:", "folder");
    if (!name) return;
    AuraFS.addNode(parentId, name, "folder");
    load();
  }

  function rename(node) {
    const name = prompt("Rename:", node.name);
    if (!name) return;
    node.name = name;
    AuraFS.saveToDB();
    load();
  }

  function del(node) {
    if (!confirm("Delete?")) return;
    AuraFS.deleteNode(node.id);
    load();
  }

  function icon(name, type) {
    if (type === "folder") return "ri-folder-3-fill";
    if (name.endsWith(".js")) return "ri-javascript-fill";
    if (name.endsWith(".jsx")) return "ri-reactjs-line";
    if (name.endsWith(".css")) return "ri-css3-fill";
    if (name.endsWith(".html")) return "ri-html5-fill";
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
    <TreeNode {node} depth={0} />
  {/each}

</div>

<!-- Recursive component -->
<script context="module">
  import AuraFS from "../core/auraFS.js";
  import { setActiveFile, setSelectedFolder } from "../stores/projectStore.js";

  export const TreeNode = (props) => {
    const { node, depth } = props;

    function toggle() {
      node.isOpen = !node.isOpen;
      AuraFS.saveToDB();
      setSelectedFolder(node.id);
      window.dispatchEvent(new CustomEvent("refresh-tree"));
    }

    function open() {
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

    function icon() {
      if (node.type === "folder") return node.isOpen ? "ri-folder-open-fill" : "ri-folder-fill";
      if (node.name.endsWith(".js")) return "ri-javascript-fill";
      if (node.name.endsWith(".jsx")) return "ri-reactjs-line";
      if (node.name.endsWith(".css")) return "ri-css3-fill";
      if (node.name.endsWith(".html")) return "ri-html5-fill";
      return "ri-file-code-fill";
    }

    return `
      <div class="group flex items-center pr-2 hover:bg-soft" style="padding-left:${depth * 16 + 14}px;height:42px">
        <div class="flex-1 flex items-center gap-2 overflow-hidden"
          onclick="${node.type === "folder" ? toggle : open}">
          
          <i class="${icon()} text-zinc-400"></i>
          <span class="truncate">${node.name}</span>
        </div>

        <div class="opacity-0 group-hover:opacity-100 flex gap-2 text-zinc-500">
          ${node.type === "folder" ? `
            <i class="ri-file-add-line" onclick="${newFile}"></i>
            <i class="ri-folder-add-line" onclick="${newFolder}"></i>
          ` : ``}
          <i class="ri-edit-line" onclick="${rename}"></i>
          <i class="ri-delete-bin-line" onclick="${del}"></i>
        </div>
      </div>

      ${
        node.type === "folder" && node.isOpen
          ? node.children.map(child => TreeNode({ node: child, depth: depth + 1 })).join("")
          : ""
      }
    `;
  };
</script>