<script>
  import { createEventDispatcher } from "svelte";
  import AuraFS from "../core/auraFS.js";
  import { projectName } from "../stores/projectStore.js";
  import AiStructureModal from "../modals/AiStructureModal.svelte";

  const dispatch = createEventDispatcher();
  let showAI = false;

  function openMenu() {
    dispatch("menu");
  }

  function openAI() {
    showAI = true;
  }

  function exportZip() {
    AuraFS.downloadProject();
  }
</script>

<header class="h-12 flex items-center justify-between px-3 bg-panel border-b border-zinc-800">

  <!-- Left -->
  <div class="flex items-center gap-3">
    <button 
      class="text-zinc-300 text-xl"
      on:click={openMenu}
    >
      <i class="ri-menu-line"></i>
    </button>

    <div class="text-sm text-zinc-300 font-medium truncate max-w-[160px]">
      {$projectName || "Aura Project"}
    </div>
  </div>

  <!-- Right -->
  <div class="flex items-center gap-2">

    <!-- AI structure -->
    <button 
      class="px-3 py-1.5 rounded-lg bg-soft text-sm text-zinc-200 hover:bg-zinc-700"
      on:click={openAI}
    >
      AI Structure
    </button>

    <!-- Export -->
    <button 
      class="px-3 py-1.5 rounded-lg bg-accent text-white text-sm hover:opacity-90"
      on:click={exportZip}
    >
      Export
    </button>

  </div>
</header>

{#if showAI}
  <AiStructureModal on:close={() => showAI = false} />
{/if}