<script>
    import { userData } from "../db";
    let organizationSelected = $userData.organizations[0].name;

    function organizationClicked(name){
        organizationSelected = name;
    }
</script>

{#key $userData}

<p id="listTile">Organizations</p>

<div id="newOrganization">

</div>

<!-- Organization list -->
<div id="organizationList">
    {#each $userData.organizations as organization}
        <div class="listItem">
            <!-- Organization name is highlighted if it is selected -->
            <p style={"color: " + (organization.name == organizationSelected ? "red" : "white")} on:click={() => organizationClicked(organization.name)} on:keydown={() => organizationClicked(organization.name)}>{organization.name}</p>
        </div>
    {/each}
</div>

{/key}

<style>

    #newOrganization {
        position: absolute;
        left: 2vw;
        bottom: 2vh;
        width: 40vw;
        height: 7vh;
        background-color: #d4d4d4;
        border-radius: 10px;
    }

    #listTile {
        display: inline-block;
        position: absolute;
        left: 2vw;
        top: 9vh;
        font-size: 4vh;
        font-weight: bold;
    }

    #organizationList {     
        position: absolute;
        left: 2vw;
        top: 22vh;
        width: 55vw;
        overflow-y: scroll;
        text-align: left;
        background-color: #007bff;
        border-radius: 10px;
        padding-left: 5px;
        max-height: 65vh;
    }

    .listItem {
        margin: 5px;
        overflow-x: auto;
    }
</style>
