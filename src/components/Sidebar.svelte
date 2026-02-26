<script>
  import { onMount } from "svelte";
  import FileTree from "./FileTree.svelte";
  import { createEventDispatcher } from "svelte";
  import { sidebarOpen } from "../stores/projectStore.js";

  const dispatch = createEventDispatcher();

  export let sidebarOpen = false;

  function close() {
    dispatch("close");
  }
</script>

<aside
  class="fixed z-50 top-0 left-0 h-full w-64 bg-panel border-r border-zinc-800 transform transition-transform duration-200 ease-out"
  class:translate-x-0={sidebarOpen}
  class:-translate-x-full={!sidebarOpen}
>

  <!-- Header -->
  <div class="h-12 flex items-center justify-between px-4 border-b border-zinc-800">
    <div class="font-semibold text-zinc-200">
      AURA
    </div>
    <button class="text-zinc-400" on:click={close}>
      <i class="ri-close-line text-xl"></i>
    </button>
  </div>

  <!-- File tree -->
  <div class="flex-1 overflow-y-auto">
    <FileTree />
  </div>

</aside>