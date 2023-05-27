<script>
    import { set, update } from "firebase/database";
    import { userData, userId, organizations, getFromDb, setToDb } from "../db";
    import { writable } from "svelte/store";
    let organizationSelected = "";
    let organizationMembers = writable({});
    let organizationTeams = writable({});
    let organizationOwner = writable("");

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
        organizationTeams.set(
            await getFromDb(`organizations/${name}/teamList`)
        );
        organizationOwner.set(
            String(await getFromDb(`organizations/${name}/owner`))
        );
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
            teams: { 0: "Unsorted", 1: "Coach" },
        };
        setToDb(`organizations/${name}`, organization);
        let organization2 = { rank: "Unsorted" };
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
            rank: "Unsorted",
        });
        let userOrgObj = { rank: "Unsorted" };
        setToDb(
            `users/${id}/organizations/${organizationSelected}`,
            userOrgObj
        );

        organizationMembers.set(
            await getFromDb(`organizations/${organizationSelected}/members`)
        );
        organizationTeams.set(
            await getFromDb(`organizations/${organizationSelected}/teamList`)
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
            await getFromDb(`organizations/${organizationSelected}/members`)
        );
        organizationTeams.set(
            await getFromDb(`organizations/${organizationSelected}/teamList`)
        );
    }

    async function teamButton(elm) {
        let team = elm.target.parentNode.children[0].value;
        if (team == "") {
            return;
        }
        let org = await getFromDb(`organizations/${organizationSelected}`);
        if (Object.values(org.teams).includes(team)) {
            alert("This team already exists");
            return;
        }
        setToDb(
            `organizations/${organizationSelected}/teamList/${
                Object.values(org.teams).length
            }`,
            team
        );
        elm.target.parentNode.children[0].value = "";
        organizationTeams.update((teams) => {
            teams[Object.values(org.teams).length] = team;
            return teams;
        });
    }

    async function organizationTeamListRemove(elm) {
        let team = elm.target.parentNode.children[0].innerHTML;

        if (
            !confirm(
                `Are you sure you want to remove ${team} from ${organizationSelected}?`
            )
        ) {
            return;
        }

        let memberValues = Object.values($organizationMembers);
        let memberKeys = Object.keys($organizationMembers);
        for (let i = 0; i < memberValues.length; i++) {
            if (memberValues[i].rank == team) {
                console.log(organizationSelected);
                setToDb(
                    `organizations/${organizationSelected}/members/${memberKeys[i]}/rank`,
                    "Unsorted"
                );
                setToDb(
                    `users/${memberKeys[i]}/organizations/${organizationSelected}/rank`,
                    "Unsorted"
                );
            }
        }

        // Update the organization members and teams
        organizationMembers.set(
            await getFromDb(`organizations/${organizationSelected}/members`)
        );
        organizationTeams.set(
            await getFromDb(`organizations/${organizationSelected}/teamList`)
        );

        let newTeamList = Object.values($organizationTeams);
        newTeamList.splice(newTeamList.indexOf(team), 1);

        setToDb(`organizations/${organizationSelected}/teamList`, newTeamList);

        // Update the organization members and teams
        organizationMembers.set(
            await getFromDb(`organizations/${organizationSelected}/members`)
        );
        organizationTeams.set(
            await getFromDb(`organizations/${organizationSelected}/teamList`)
        );
    }
</script>

{#key $userData}
    <p id="listTile">Organizations</p>
    <!-- Organization list -->
    <div id="organizationList">
        {#if $userData.organizations}
            {#each Object.values($userData.organizations) as organization, i}
                <div class="listItem" style={"background-color: " +
                (Object.keys($userData.organizations)[i] ==
                organizationSelected
                    ? "#0056b3"
                    : "none")}
                    on:click={() =>
                        organizationClicked(
                            Object.keys($userData.organizations)[i]
                        )}
                    on:keydown={() =>
                        organizationClicked(
                            Object.keys($userData.organizations)[i]
                        )}
                    >
                    <p>
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
        <p id="organizationTitle">{organizationSelected}</p>

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
                    <div class="memberListItem">
                        <p class="memberEmail">{$organizationOwner}</p>
                        <select
                            on:change={(elm) => ranked(elm)}
                            value={$organizationOwner}
                            disabled={true}
                        >
                            <option value={$organizationOwner}>Coach</option>
                        </select>
                    </div>
                    {#each Object.values($organizationMembers) as member}
                        <div class="memberListItem">
                            <p class="memberEmail">{member.email}</p>
                            <select
                                on:change={(elm) => ranked(elm)}
                                value={$organizationMembers[
                                    emailToUserId(member.email)
                                ].rank}
                                disabled={(member.rank != "Coach" &&
                                    $organizationOwner != $userData.email) ||
                                    $userData.email == member.email}
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
    </div>
{/if}

{#key $organizationTeams}
    {#if organizationSelected}
        <div id="organizationTeamList">
            <div id="organizationTeamsTitleAndAdd">
                <p id="organizationTeamListTitle">Teams</p>
                <div id="newTeam">
                    <input
                        type="text"
                        maxlength="100"
                        id="newTeamInput"
                        placeholder="New Team"
                    />
                    <button
                        id="newTeamButton"
                        on:click={(elm) => teamButton(elm)}>Add</button
                    >
                </div>
            </div>
            {#each Object.values($organizationTeams) as team}
                <div class="organizationTeamListItem">
                    <p>{team}</p>
                    {#if team != "Unsorted" && team != "Coach"}
                        <p
                            class="organizationTeamListRemove"
                            on:click={(elm) => organizationTeamListRemove(elm)}
                            on:keydown={(elm) =>
                                organizationTeamListRemove(elm)}
                        >
                            ❌
                        </p>
                    {/if}
                </div>
            {/each}
        </div>
    {/if}
{/key}

<style>
    #memberList {
        display: block;
        margin-left: auto;
        margin-right: auto;
        margin-top: 2vh;
        max-width: 32vw;
        overflow-y: auto;
        text-align: center;
        border-radius: 10px;
        max-height: 50vh;
    }

    .memberListItem {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 10vh;
        min-height: 70px;
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
        margin-top: 0;
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
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    #organizationTitle {
        text-align: center;
        font-size: 4vh;
        font-weight: bold;
        margin-top: 0;
        color: white;
        overflow-x: auto;
        white-space: nowrap;
        max-width: 36vw;
    }

    #newMember {
        display: flex;
        align-items: center;
        justify-content: space-evenly;
        width: 31vw;
        height: 7vh;
        background-color: #d4d4d4;
        border-radius: 10px;
        margin: 0;
        padding: 0;
    }

    #newMemberInput {
        width: 18vw;
        height: 3vh;
        background-color: #d4d4d4;
        border-radius: 10px;
        padding-left: 5px;
        font-size: 1.5vh;
        text-align: center;
    }

    #newMemberButton {
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
        max-height: 35vh;
    }

    .listItem {
        display: flex;
        align-items: center;
        margin: 0;
        padding-left: 5px;
        padding-right: 5px;
        height: 5vh;
        overflow-x: auto;
        overflow-y: hidden;
        cursor: pointer;
        color: white;
    }

    .listItem:hover {
        background-color: #0056b3;
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

    #organizationTeamsTitleAndAdd {
        display: flex;
        flex-direction: column;
        align-items: center;
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
        overflow: auto;
    }

    .organizationTeamListItem p {
        margin-top: 0;
        margin-bottom: 0;
    }

    .organizationTeamListRemove {
        margin-left: 10px;
        cursor: pointer;
    }

    #newTeam {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-evenly;
        align-items: center;
        align-content: center;
        width: 48vw;
        height: 7vh;
        background-color: #d4d4d4;
        border-radius: 10px;
        margin: 0;
        padding: 0;
        margin-top: 5px;
        margin-bottom: 5px;
    }

    #newTeamInput {
        width: 18vw;
        height: 3vh;
        background-color: #d4d4d4;
        border-radius: 10px;
        padding-left: 5px;
        font-size: 1.5vh;
        text-align: center;
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
