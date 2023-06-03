<script>
  import { authWritable, pageState, userId } from "./db";
  import HomeLink from "./lib/HomeLink.svelte";
  import LogIn from "./lib/LogIn.svelte";
  import OrganizationLink from "./lib/OrganizationLink.svelte";
  import PartsLink from "./lib/PartsLink.svelte";
  import Organizations from "./lib/Organizations.svelte";
  import SignOut from "./lib/SignOut.svelte";
  import Parts from "./lib/Parts.svelte";
  import AddParts from "./lib/AddParts.svelte";
</script>

{#key $authWritable.currentUser}
  {#if !$authWritable.currentUser}
    <LogIn />
  {:else}
    {#if $pageState != "home"}
      <HomeLink />
    {/if}
    <SignOut />
    {#if $pageState == "home"}
      <div id="linksCenter">
        <PartsLink />
        <OrganizationLink />
      </div>
    {:else if $pageState == "parts"}
      <Parts />
    {:else if $pageState == "organizations"}
      <Organizations />
    {:else if $pageState == "addParts"}
      <AddParts />
    {/if}
  {/if}
{/key}

<style>
  #linksCenter {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-content: center;
    justify-content: center;
    align-items: center;
  }
</style>
