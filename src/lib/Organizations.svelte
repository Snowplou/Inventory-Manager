<script>
    import { userData, userId, organizations, getFromDb, setToDb } from "../db";
    let organizationSelected = "a"

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

    async function memberButton(elm) {
        let email = elm.target.parentNode.children[0].value;
        if (email == "") {
            return;
        }
        
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
        <p id="organtizationTitle">{organizationSelected}</p>
    </div>
    <div id="newMember">
        <input
            type="text"
            maxlength="100"
            id="newMemberInput"
            placeholder="New Member"
        />
        <button
            id="newMemberButton"
            on:click={(elm) => organizationButton(elm)}>Add</button
        >
    </div>
{/if}

<style>
    #organizationInfo {
        position: absolute;
        right: 2vw;
        top: 15vh;
        width: 36vw;
        overflow-y: scroll;
        text-align: left;
        background-color: #007bff;
        border-radius: 10px;
        height: 72vh;
    }

    #organtizationTitle {
        text-align: center;
        font-size: 4vh;
        font-weight: bold;
        margin-top: 0;
        color: white;
        overflow-x: scroll;
        white-space: nowrap;
        margin-left: 2px;
        margin-right: 2px;
    }

    #newMember {
        position: absolute;
        right: 3vw;
        top: 22vh;
        width: 34vw;
        height: 7vh;
        background-color: #d4d4d4;
        border-radius: 10px;
    }

    #newMemberInput {
        position: absolute;
        left: 1vw;
        bottom: 1.5vh;
        width: 18vw;
        height: 3vh;
        background-color: #d4d4d4;
        border-radius: 10px;
        padding-left: 5px;
        font-size: 1.5vh;
    }

    #newMemberButton {
        position: absolute;
        right: 1vw;
        bottom: 1vh;
        width: 10vw;
        height: 5vh;
        color: white;
        background-color: #007bff;
        border-radius: 10px;
        font-size: 2vh;
        font-weight: bold;
        text-align: center;
        padding: 0;
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
