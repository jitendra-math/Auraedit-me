<script>
  import { createEventDispatcher, onMount } from "svelte";
  import AuraFS from "../core/auraFS.js";
  import { projectName, setProjectName } from "../stores/projectStore.js";
  import AiStructureModal from "../modals/AiStructureModal.svelte";

  const dispatch = createEventDispatcher();

  let showAI = false;

  function openMenu() {
    dispatch("menu");
  }

  function openAI() {
    showAI = true;
  }

  async function exportZip() {
    await AuraFS.downloadProject();
  }

  onMount(() => {
    // sync project name on load
    if (AuraFS.project?.name) {
      setProjectName(AuraFS.project.name);
    }
  });
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
      {$projectName || "my-project"}
    </div>
  </div>

  <!-- Right -->
  <div class="flex items-center gap-2">

    <!-- AI structure -->
    <button 
      class="px-3 py-1.5 rounded-lg bg-soft text-sm text-zinc-200 hover:bg-zinc-700 transition"
      on:click={openAI}
    >
      AI
    </button>

    <!-- Export -->
    <button 
      class="px-3 py-1.5 rounded-lg bg-accent text-white text-sm hover:opacity-90 transition"
      on:click={exportZip}
    >
      ZIP
    </button>

  </div>
</header>

{#if showAI}
  <AiStructureModal on:close={() => showAI = false} />
{/if}
