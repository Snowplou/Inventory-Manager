<script>
    import { update } from "firebase/database";
    import { userData, userId, organizations, getFromDb, setToDb } from "../db";
    import { writable } from "svelte/store";
    let organizationSelected = "";
    let organizationMembers = writable({});
    let organizationTeams = writable({});

    function emailToUserId(email){
        let i = 0;
        for (let member of Object.values($organizationMembers)) {
            if (member.email == email) {
                return Object.keys($organizationMembers)[i];
            }
            i++;
        }
    }

    async function organizationClicked(name) {
        organizationSelected = name;
        organizationMembers.set(
            await getFromDb(`organizations/${name}/members`)
        );
        organizationTeams.set(await getFromDb(`organizations/${name}/teams`));
    }

    async function organizationButton(elm) {
        let name = elm.target.parentNode.children[0].value;
        if (name == "") {
            return;
        }
        if (await getFromDb(`organizations/${name}/a`)) {
            alert("Organization already exists");
            return;
        }
        let organization = {
            owner: $userData.email,
            a: true,
            teams: { 0: "Unranked" },
        };
        setToDb(`organizations/${name}`, organization);
        let organization2 = { rank: "Unranked" };
        setToDb(`users/${$userId}/organizations/${name}`, organization2);
    }

    async function memberButton(elm) {
        let id = elm.target.parentNode.children[0].value;
        if (id == "") {
            return;
        }

        let chosenUser = await getFromDb(`users/${id}`);
        if (!chosenUser) {
            alert("User not found");
            return;
        } else if (chosenUser.email == $userData.email) {
            alert("You cannot add yourself");
            return;
        }

        let organization = await getFromDb(
            `organizations/${organizationSelected}`
        );

        if (organization.members) {
            if (organization.members[id]) {
                alert("User is already in organization");
                return;
            }
        }

        setToDb(`organizations/${organizationSelected}/members/${id}`, {
            email: chosenUser.email,
            rank: "member",
            team: -1,
        });
        let userOrgObj = { rank: "Unranked" };
        setToDb(
            `users/${id}/organizations/${organizationSelected}`,
            userOrgObj
        );

        elm.target.parentNode.children[0].value = "";
    }

    async function ranked(elm) {
        let team = elm.target.value;
        let user = elm.target.parentNode.children[0].innerHTML;
        let userId = emailToUserId(user);
        setToDb(
            `organizations/${organizationSelected}/members/${userId}/rank`,
            team
        );
        setToDb(
            `users/${userId}/organizations/${organizationSelected}/rank`,
            team
        );
    }
</script>

{#key $userData}
    <p id="listTile">Organizations</p>
    <!-- Organization list -->
    <div id="organizationList">
        {#if $userData.organizations}
            {#each Object.values($userData.organizations) as organization, i}
                <div class="listItem">
                    <!-- Organization name is highlighted if it is selected -->
                    <p
                        style={"color: " +
                            (Object.keys($userData.organizations)[i] ==
                            organizationSelected
                                ? "darkGray"
                                : "white")}
                        on:click={() =>
                            organizationClicked(
                                Object.keys($userData.organizations)[i]
                            )}
                        on:keydown={() =>
                            organizationClicked(
                                Object.keys($userData.organizations)[i]
                            )}
                    >
                        {Object.keys($userData.organizations)[i]}
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
        <button id="newMemberButton" on:click={(elm) => memberButton(elm)}
            >Add</button
        >
    </div>

    {#key $organizationMembers}
        <div id="memberList">
            {#if $organizationMembers}
                {#each Object.values($organizationMembers) as member}
                    <div class="memberListItem">
                        <p>{member.email}</p>
                        <select on:change={(elm) => ranked(elm)} value={$organizationMembers[emailToUserId(member.email)].rank}>
                            {#each Object.values($organizationTeams) as team}
                                <option value={team}>{team}</option>
                            {/each}
                        </select>
                    </div>
                {/each}
            {/if}
        </div>
    {/key}
{/if}

<style>
    #memberList {
        position: absolute;
        right: 2vw;
        top: 30vh;
        max-width: 36vw;
        overflow-y: scroll;
        overflow-x: scroll;
        text-align: center;
        /* background-color: green; */
        border-radius: 10px;
        max-height: 57vh;
    }

    .memberListItem {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 5vh;
        background-color: #d4d4d4;
        border-radius: 10px;
        margin: 0;
        padding: 0;
        margin-bottom: 1vh;
    }

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
        right: 6vw;
        top: 22vh;
        width: 31vw;
        height: 7vh;
        background-color: #d4d4d4;
        border-radius: 10px;
        margin: 0;
        padding: 0;
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
