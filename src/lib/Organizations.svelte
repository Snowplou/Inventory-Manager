<script>
    import { userData, userId, organizations, getFromDb, setToDb } from "../db";
    let organizationSelected = ""

    function organizationClicked(name) {
        organizationSelected = name;
    }

    async function organizationButton(elm) {
        let name = elm.target.parentNode.children[0].value;
        if (name == "") {
            return;
        }
        let organizations = await getFromDb("organizations");
        if (organizations) {
            for (let i = 0; i < organizations.length; i++) {
                if (organizations[i].name == name) {
                    alert("Organization already exists");
                    return;
                }
            }
        }
        let organization = { owner: $userData.email };
        setToDb(`organizations/${name}`, organization);
        let organization2 = { name: name };
        setToDb(
            `users/${$userId}/organizations/${$userData.organizations.length}`,
            organization2
        );
    }
</script>

{#key $userData}
    <p id="listTile">Organizations</p>
    <!-- Organization list -->
    <div id="organizationList">
        {#if $userData.organizations}
            {#each $userData.organizations as organization}
                <div class="listItem">
                    <!-- Organization name is highlighted if it is selected -->
                    <p
                        style={"color: " +
                            (organization.name == organizationSelected
                                ? "darkGray"
                                : "white")}
                        on:click={() => organizationClicked(organization.name)}
                        on:keydown={() =>
                            organizationClicked(organization.name)}
                    >
                        {organization.name}
                    </p>
                </div>
            {/each}
        {/if}
    </div>
{/key}

<div id="newOrganization">
    <input
        type="text"
        maxlength="100"
        id="newOrganizationInput"
        placeholder="New Organization"
    />
    <button
        id="newOrganizationButton"
        on:click={(elm) => organizationButton(elm)}>Add</button
    >
</div>

{#if organizationSelected}
    <div id="organizationInfo">
        <p>{organizationSelected}</p>
    </div>
{/if}

<style>
    #organizationInfo {
        position: absolute;
        right: 2vw;
        top: 15vh;
        width: 35vw;
        overflow-y: scroll;
        text-align: left;
        background-color: #007bff;
        border-radius: 10px;
        padding-left: 5px;
        height: 72vh;
    }

    #newOrganization {
        position: absolute;
        left: 2vw;
        bottom: 2vh;
        width: 96vw;
        height: 7vh;
        background-color: #d4d4d4;
        border-radius: 10px;
    }

    #newOrganizationInput {
        position: absolute;
        left: 2vw;
        bottom: 1.5vh;
        width: 65vw;
        height: 3vh;
        background-color: #d4d4d4;
        border-radius: 10px;
        padding-left: 5px;
        font-size: 3.25vh;
    }

    #newOrganizationButton {
        position: absolute;
        right: 2vw;
        bottom: 1vh;
        width: 15vw;
        height: 5vh;
        color: white;
        background-color: #007bff;
        border-radius: 10px;
        font-size: 2vh;
        font-weight: bold;
        text-align: center;
        padding: 0;
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
