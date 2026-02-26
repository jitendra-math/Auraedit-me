<script>
  import { onMount } from "svelte";
  import Sidebar from "./components/Sidebar.svelte";
  import Toolbar from "./components/Toolbar.svelte";
  import Editor from "./components/Editor.svelte";
  import StatusBar from "./components/StatusBar.svelte";

  import AuraFS from "./core/auraFS.js";

  let sidebarOpen = false;
  let projectLoaded = false;

  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }

  onMount(async () => {
    // load IndexedDB project
    const project = await AuraFS.init();
    projectLoaded = true;

    // agar project exist karta hai → first file open
    if (project && project.root?.length) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("open-first-file"));
      }, 100);
    }
  });
</script>

<div class="h-screen w-screen overflow-hidden bg-bg flex">

  <!-- Sidebar -->
  <Sidebar {sidebarOpen} on:close={() => sidebarOpen = false} />

  <!-- Overlay -->
  {#if sidebarOpen}
    <div 
      class="fixed inset-0 bg-black/50 z-40"
      on:click={() => sidebarOpen = false}
    ></div>
  {/if}

  <!-- Main -->
  <div class="flex-1 flex flex-col h-full">

    <!-- Top toolbar -->
    <Toolbar on:menu={toggleSidebar} />

    <!-- Editor -->
    <div class="flex-1 relative overflow-hidden">
      {#if projectLoaded}
        <Editor />
      {:else}
        <div class="h-full flex items-center justify-center text-zinc-500">
          Loading project...
        </div>
      {/if}
    </div>

    <!-- Status -->
    <StatusBar />

  </div>
</div>