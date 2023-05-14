<script>
  import { data, addDbCallback, getFromDb, isLoggedIn } from "./db";
  import LogIn from "./lib/LogIn.svelte";
</script>

{#if !isLoggedIn()}
  <LogIn />
{/if}