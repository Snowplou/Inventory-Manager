<script>
  import {
    authWritable,
    pageState,
    userId,
    customPartSelected,
    animationTime,
    isConnected,
  } from "./db";
  import HomeLink from "./lib/HomeLink.svelte";
  import LogIn from "./lib/LogIn.svelte";
  import OrganizationLink from "./lib/OrganizationLink.svelte";
  import PartsLink from "./lib/PartsLink.svelte";
  import Organizations from "./lib/Organizations.svelte";
  import SignOut from "./lib/SignOut.svelte";
  import Parts from "./lib/Parts.svelte";
  import PartEditor from "./lib/PartEditor.svelte";

  import { fade, fly } from "svelte/transition";
  import { flip } from "svelte/animate";
  import NoConnection from "./lib/NoConnection.svelte";
</script>

{#key $authWritable.currentUser}
  {#key $isConnected}
    {#if $isConnected}
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
            <p
              id="supportEmail"
              in:fly={{ y: 100, duration: $animationTime }}
              out:fly={{ y: 100, duration: $animationTime }}
            >
              Do you need help or have any questions?<br />If so, email
              15442C@gmail.com<br /><span id="credits"
                >Made By Jacob Scheff</span
              >
              <br>
              <a href="https://forms.gle/DAYpiGXuE6fGjz1M8" target="_blank" rel="noopener noreferrer">If you think that a part is missing from the list, click here!</a>
            </p>
          </div>
        {:else if $customPartSelected != ""}
          <PartEditor />
        {:else if $pageState == "parts"}
          <Parts />
        {:else if $pageState == "organizations"}
          <Organizations />
        {/if}
      {/if}
    {:else}
      <NoConnection />
    {/if}
  {/key}
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

  #credits {
    font-size: 65%;
  }

  #supportEmail {
    text-align: center;
    font-size: 150%;
    position: absolute;
    top: 74vh;
  }

  a {
    font-size: medium;
  }
</style>
