<script>
  import { createEventDispatcher } from "svelte";
  import AuraFS from "../core/auraFS.js";
  import { setProjectName } from "../stores/projectStore.js";

  const dispatch = createEventDispatcher();

  let input = "";
  let loading = false;

  async function generate() {
    if (!input.trim()) return;
    loading = true;

    await AuraFS.parseAIStructure(input);
    setProjectName(AuraFS.project.name);

    window.dispatchEvent(new CustomEvent("refresh-tree"));
    loading = false;
    dispatch("close");
  }

  function close() {
    dispatch("close");
  }
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60">

  <div class="w-[92%] max-w-md bg-panel rounded-xl shadow-soft border border-zinc-800 p-4">

    <div class="flex items-center justify-between mb-3">
      <h2 class="text-sm font-semibold text-zinc-200">
        Paste AI Folder Structure
      </h2>
      <button class="text-zinc-400" on:click={close}>
        <i class="ri-close-line text-lg"></i>
      </button>
    </div>

    <textarea
      bind:value={input}
      rows="8"
      placeholder="src/
 ├── components/
 ├── pages/
 └── index.js"
      class="w-full p-3 text-xs bg-soft border border-zinc-700 rounded-lg text-zinc-200 font-mono resize-none outline-none"
    ></textarea>

    <div class="mt-4 flex justify-end gap-2">

      <button
        class="px-3 py-1.5 text-xs rounded-lg bg-soft text-zinc-300 hover:bg-zinc-700"
        on:click={close}
      >
        Cancel
      </button>

      <button
        class="px-3 py-1.5 text-xs rounded-lg bg-accent text-white hover:opacity-90 disabled:opacity-50"
        on:click={generate}
        disabled={loading}
      >
        {#if loading}
          Generating...
        {:else}
          Generate
        {/if}
      </button>

    </div>

  </div>
</div>