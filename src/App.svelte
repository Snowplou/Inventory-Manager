<script>
  import { authWritable, pageState, userId } from "./db";
  import HomeLink from "./lib/HomeLink.svelte";
  import LogIn from "./lib/LogIn.svelte";
  import OrganizationLink from "./lib/OrganizationLink.svelte";
  import Organizations from "./lib/Organizations.svelte";
  import SignOut from "./lib/SignOut.svelte";
  import Teams from "./lib/Teams.svelte";
  import TeamsLink from "./lib/TeamsLink.svelte";
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
      <p>User ID: {$userId}</p>
      <div id="linksCenter">
        <TeamsLink />
        <OrganizationLink />
      </div>
    {:else if $pageState == "teams"}
      <Teams />
    {:else if $pageState == "organizations"}
      <Organizations />
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
