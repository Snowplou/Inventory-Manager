<script>
  import { authWritable, pageState, userId, customPartSelected } from "./db";
  import HomeLink from "./lib/HomeLink.svelte";
  import LogIn from "./lib/LogIn.svelte";
  import OrganizationLink from "./lib/OrganizationLink.svelte";
  import PartsLink from "./lib/PartsLink.svelte";
  import Organizations from "./lib/Organizations.svelte";
  import SignOut from "./lib/SignOut.svelte";
  import Parts from "./lib/Parts.svelte";
  import AddParts from "./lib/AddParts.svelte";
  import PartEditor from "./lib/PartEditor.svelte";
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
        <p id="supportEmail">Do you need help or have any questions?<br>If so, email 15442C@gmail.com!</p>
      </div>
    {:else if $customPartSelected != ""}
      <PartEditor />
    {:else if $pageState == "parts"}
      <Parts />
    {:else if $pageState == "organizations"}
      <Organizations />
    {:else if $pageState == "addParts"}
      <AddParts />
    {/if}
  {/if}
{/key}

<!-- <p>
The website is currently closed for maintenance. Please check back later.<br>
Reason For Maintenance: SKUs are being added to the products.<br><br>
<i>Note: The ability to add SKUs to custom parts and edit custom parts will be added at a later time.</i>
</p> -->

<style>
  #linksCenter {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-content: center;
    justify-content: center;
    align-items: center;
  }

  #supportEmail {
    text-align: center;
    font-size: 150%;
    position: absolute;
    top: 80vh;
  }
</style>
