<script>
    import { update } from "firebase/database";
    import { userData, userId, organizations, getFromDb, setToDb } from "../db";
    import { writable } from "svelte/store";
    let organizationSelected = "";
    let organizationMembers = writable({});
    let organizationTeams = writable({});

    function emailToUserId(email) {
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
            teams: { 0: "Unranked", 1: "Admin" },
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

        // If the id is an email, alert the user that they must use an id
        if (id.includes("@")) {
            alert("Please use the user ID");
            return;
        }

        let chosenUserEmail = await getFromDb(`users/${id}/email`);
        if (!chosenUserEmail) {
            alert("User not found");
            return;
        } else if (chosenUserEmail == $userData.email) {
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
            email: chosenUserEmail,
            rank: "Unranked",
        });
        let userOrgObj = { rank: "Unranked" };
        setToDb(
            `users/${id}/organizations/${organizationSelected}`,
            userOrgObj
        );

        organizationMembers.set(
            await getFromDb(`organizations/${organizationSelected}/members`)
        );
        organizationTeams.set(
            await getFromDb(`organizations/${organizationSelected}/teams`)
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

    async function memberRemove(elm) {
        if (
            !confirm(
                `Are you sure you want to remove ${elm.target.parentNode.children[0].innerHTML} from ${organizationSelected}?`
            )
        ) {
            return;
        }

        let user = elm.target.parentNode.children[0].innerHTML;
        let userId = emailToUserId(user);
        setToDb(
            `organizations/${organizationSelected}/members/${userId}`,
            null
        );
        setToDb(`users/${userId}/organizations/${organizationSelected}`, null);

        // Update the organization members and teams
        organizationMembers.set(
            await getFromDb(`organizations/${name}/members`)
        );
        organizationTeams.set(await getFromDb(`organizations/${name}/teams`));
    }

    async function teamButton(elm) {
        let team = elm.target.parentNode.children[0].value;
        if (team == "") {
            return;
        }
        console.log(team);
        // let organization = await getFromDb(
        //     `organizations/${organizationSelected}`
        // );
        // if (organization.teams) {
        //     if (organization.teams[team]) {
        //         alert("Team already exists");
        //         return;
        //     }
        // }
        // setToDb(`organizations/${organizationSelected}/teams/${team}`, team);
        // elm.target.parentNode.children[0].value = "";
        // organizationTeams.set(
        //     await getFromDb(`organizations/${organizationSelected}/teams`)
        // );
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
                        <p class="memberEmail">{member.email}</p>
                        <select
                            on:change={(elm) => ranked(elm)}
                            value={$organizationMembers[
                                emailToUserId(member.email)
                            ].rank}
                        >
                            {#each Object.values($organizationTeams) as team}
                                <option value={team}>{team}</option>
                            {/each}
                        </select>
                        <p
                            class="memberRemove"
                            on:click={(elm) => memberRemove(elm)}
                            on:keydown={(elm) => memberRemove(elm)}
                        >
                            ❌
                        </p>
                    </div>
                {/each}
            {/if}
        </div>
    {/key}
{/if}

{#key $organizationTeams}
    {#if organizationSelected}
        <div id="organizationTeamList">
            <p id="organizationTeamListTitle">Teams</p>
            <div id="newTeam">
                <input
                    type="text"
                    maxlength="100"
                    id="newTeamInput"
                    placeholder="New Team"
                />
                <button id="newTeamButton" on:click={(elm) => teamButton(elm)}
                    >Add</button
                >
            </div>
            {#each Object.values($organizationTeams) as team}
                <div class="organizationTeamListItem">
                    <p>{team}</p>
                </div>
            {/each}
        </div>
    {/if}
{/key}

<style>
    #memberList {
        position: absolute;
        right: 5.5vw;
        top: 30vh;
        max-width: 32vw;
        overflow-y: auto;
        text-align: center;
        border-radius: 10px;
        max-height: 57vh;
    }

    .memberListItem {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 10vh;
        background-color: #d4d4d4;
        border-radius: 10px;
        margin: 0;
        padding: 0;
        margin-bottom: 1vh;
    }

    .memberEmail {
        max-width: 32vw;
        overflow-x: auto;
        margin-top: 2px;
        margin-bottom: 0;
        padding-left: 2px;
        padding-right: 2px;
    }

    .memberRemove {
        cursor: pointer;
        padding-left: 4px;
    }

    select {
        margin-bottom: 4px;
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
        overflow-x: auto;
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
        overflow-y: auto;
        text-align: left;
        background-color: #007bff;
        border-radius: 10px;
        padding-left: 5px;
        max-height: 35vh;
    }

    .listItem {
        margin: 5px;
        overflow-x: auto;
    }

    #organizationTeamList {
        position: absolute;
        left: 2vw;
        top: 60vh;
        width: 55vw;
        overflow-y: auto;
        text-align: left;
        background-color: #007bff;
        border-radius: 10px;
        max-height: 28vh;
        display: flex;
        flex-wrap: wrap;
        flex-direction: row;
        justify-content: center;
    }

    #organizationTeamListTitle {
        text-align: center;
        font-size: 4vh;
        font-weight: bold;
        margin-top: 0;
        margin-bottom: 0;
        color: white;
        overflow-x: auto;
        white-space: nowrap;
        margin-left: 2px;
        margin-right: 2px;
    }

    .organizationTeamListItem {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-content: center;
        width: 95%;
        height: 5vh;
        background-color: #d4d4d4;
        border-radius: 10px;
        margin-bottom: 1vh;
    }

    #newTeam {
        width: 31vw;
        height: 7vh;
        background-color: #d4d4d4;
        border-radius: 10px;
        margin: 0;
        padding: 0;
    }

    #newTeamInput {
        width: 18vw;
        height: 3vh;
        background-color: #d4d4d4;
        border-radius: 10px;
        padding-left: 5px;
        font-size: 1.5vh;
    }

    #newTeamButton {
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
    
</style>
