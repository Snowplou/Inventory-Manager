<script>
  import { data, addDbCallback, getFromDb, isLoggedIn, authWritable } from "./db";
  import LogIn from "./lib/LogIn.svelte";
  import SignOut from "./lib/SignOut.svelte";
</script>

{#key $authWritable.currentUser}
  {#if !$authWritable.currentUser}
    <LogIn />
  {:else}
    <SignOut />
  {/if}
{/key}