<script>
  import { onMount } from "svelte";
  import Sidebar from "./components/Sidebar.svelte";
  import Toolbar from "./components/Toolbar.svelte";
  import Editor from "./components/Editor.svelte";
  import StatusBar from "./components/StatusBar.svelte";
  import AuraFS from "./core/auraFS.js";

  let sidebarOpen = false;
  let cursorText = "Ln 1, Col 1";

  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }

  onMount(async () => {
    await AuraFS.init();

    // open first file if exists
    window.dispatchEvent(new CustomEvent("open-first-file"));

    window.addEventListener("cursor-update", (e) => {
      cursorText = e.detail;
    });
  });
</script>

<div class="relative h-screen w-screen bg-bg text-white overflow-hidden">

  <!-- Sidebar -->
  <Sidebar {sidebarOpen} on:close={() => sidebarOpen = false} />

  <!-- Overlay (fixed a11y) -->
  {#if sidebarOpen}
    <button
      class="fixed inset-0 bg-black/50 z-40"
      on:click={() => sidebarOpen = false}
      aria-label="Close sidebar"
    />
  {/if}

  <!-- Main -->
  <div class="flex flex-col h-full">

    <Toolbar on:menu={toggleSidebar} />

    <div class="flex-1 relative overflow-hidden">
      <Editor />
    </div>

    <StatusBar {cursorText} />

  </div>

</div>
