<script>
  import { createEventDispatcher } from "svelte";
  import AuraFS from "../core/auraFS.js";
  import { setProjectName } from "../stores/projectStore.js";

  const dispatch = createEventDispatcher();

  let input = "";
  let loading = false;
  let error = "";

  async function generate() {
    if (!input.trim()) {
      error = "Paste structure first";
      return;
    }

    if (loading) return;
    loading = true;
    error = "";

    try {
      await AuraFS.parseAIStructure(input);

      // sync project name
      setProjectName(AuraFS.project.name);

      // refresh UI everywhere
      window.dispatchEvent(new CustomEvent("refresh-tree"));
      window.dispatchEvent(new CustomEvent("open-first-file"));

      dispatch("close");
    } catch (e) {
      error = "Invalid structure";
      console.error(e);
    }

    loading = false;
  }

  function close() {
    if (loading) return;
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

    {#if error}
      <div class="text-red-400 text-xs mt-2">{error}</div>
    {/if}

    <div class="mt-4 flex justify-end gap-2">

      <button
        class="px-3 py-1.5 text-xs rounded-lg bg-soft text-zinc-300 hover:bg-zinc-700 transition"
        on:click={close}
      >
        Cancel
      </button>

      <button
        class="px-3 py-1.5 text-xs rounded-lg bg-accent text-white hover:opacity-90 disabled:opacity-50 transition"
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
