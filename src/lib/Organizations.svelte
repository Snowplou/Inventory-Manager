<script>
    import { set, update } from "firebase/database";
    import {
        userData,
        userId,
        organizations,
        getFromDb,
        setToDb,
        emailChanger,
    } from "../db";
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

    async function emailToUserIdDb(email) {
        let temp;
        for (let i = 0; i < Object.keys(emailChanger).length; i++) {
            email = email.replaceAll(
                Object.keys(emailChanger)[i],
                Object.values(emailChanger)[i]
            );
        }
        await getFromDb(`emailToId/${email}`).then((value) => {
            temp = value;
        });
        return temp;
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
        try {
            await getFromDb(`organizations/${name}`);
        } catch (err) {
            if (err == "Error: Permission denied") {
                alert("Organization already exists");
                return;
            }
        }
        let organization = {
            owner: $userData.email,
            teamList: { 0: "Unsorted", 1: "Coach" },
        };
        setToDb(`organizations/${name}`, organization);
        let organization2 = { rank: "Unsorted" };
        setToDb(`users/${$userId}/organizations/${name}`, organization2);
    }

    async function memberButton(elm) {
        let email = elm.target.parentNode.children[0].value;
        if (email == "") {
            return;
        }
        let id = await emailToUserIdDb(email);

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
        let user = elm.target.parentNode.parentNode.children[0].innerHTML
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
        let user = elm.target.parentNode.parentNode.children[0].innerHTML;

        if (
            !confirm(
                `Are you sure you want to remove ${user} from ${organizationSelected}?`
            )
        ) {
            return;
        }

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
        if (org.teamList) {
            if (Object.values(org.teamList).includes(team)) {
                alert("This team already exists");
                return;
            }
        }

        if (org.teamList) {
            setToDb(
                `organizations/${organizationSelected}/teamList/${
                    Object.values(org.teamList).length
                }`,
                team
            );
        } else {
            setToDb(`organizations/${organizationSelected}/teamList/2`, team);
        }
        elm.target.parentNode.children[0].value = "";
        organizationTeams.update((teams) => {
            if (org.teamList) teams[Object.values(org.teamList).length] = team;
            else teams[0] = team;
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

        if ($organizationMembers) {
            let memberValues = Object.values($organizationMembers);
            let memberKeys = Object.keys($organizationMembers);
            for (let i = 0; i < memberValues.length; i++) {
                if (memberValues[i].rank == team) {
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
    <!-- Organization list -->
    <div id="organizationList">
        {#if $userData.organizations}
            {#each Object.values($userData.organizations) as organization, i}
                <div
                    class="listItem"
                    style={"background-color: " +
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
                {#if $organizationMembers}
                    {#each Object.values($organizationMembers) as member}
                        <div class="memberListItem">
                            <p class="memberEmail">{member.email}</p>
                            <div class="memberListItemSelectAndRemove">
                                <select
                                    on:change={(elm) => ranked(elm)}
                                    value={$organizationMembers[
                                        emailToUserId(member.email)
                                    ].rank}
                                    disabled={(member.rank == "Coach" &&
                                        $organizationOwner !=
                                            $userData.email) ||
                                        $userData.email == member.email ||
                                        $userData.organizations[organizationSelected].rank == "Coach"
                                        }
                                >
                                    {#each Object.values($organizationTeams) as team}
                                        <option value={team}>{team}</option>
                                    {/each}
                                </select>
                                {#if $organizations[organizationSelected].owner == $userData.email}
                                    <p
                                        class="memberRemove"
                                        on:click={(elm) => memberRemove(elm)}
                                        on:keydown={(elm) => memberRemove(elm)}
                                    >
                                        ❌
                                    </p>
                                {/if}
                            </div>
                        </div>
                    {/each}
                {/if}
            </div>
        {/key}
    </div>
{/if}

{#key $userData}
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
                <div id="organizationTeamListOfTeams">
                    {#each Object.values($organizationTeams) as team}
                        <div class="organizationTeamListItem">
                            <p>{team}</p>
                            {#if team != "Unsorted" && team != "Coach" && $organizations[organizationSelected].owner == $userData.email}
                                <p
                                    class="organizationTeamListRemove"
                                    on:click={(elm) =>
                                        organizationTeamListRemove(elm)}
                                    on:keydown={(elm) =>
                                        organizationTeamListRemove(elm)}
                                >
                                    ❌
                                </p>
                            {/if}
                        </div>
                    {/each}
                </div>
            </div>
        {/if}
    {/key}
{/key}

<style>
    #memberList {
        margin-top: 2vh;
        min-width: 100%;
        max-width: 100%;
        height: 26vh;
        overflow-y: auto;
        text-align: center;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: space-around;
    }

    @media screen and (max-width: 300px) {
        #memberList {
            max-width: 90vw;
        }
    }
    @media screen and (min-width: 300px) {
        #memberList {
            max-width: 300px;
        }
    }

    .memberListItem {
        max-height: 10vh;
        overflow-x: auto;
        background-color: #d4d4d4;
        border-radius: 10px;
        margin: 0;
        margin-left: 1.5vw;
        margin-right: 1.5vw;
        padding: 0;
        margin-bottom: 1vh;
    }

    .memberListItemSelectAndRemove {
        display: flex;
        justify-content: center;
        align-items: baseline;
    }

    .memberEmail {
        max-width: 90vw;
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
        margin-bottom: 0;
    }

    #organizationInfo {
        position: absolute;
        left: 2vw;
        top: 15vh;
        width: 96vw;
        height: 43vh;
        overflow-y: scroll;
        text-align: left;
        background-color: #007bff;
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    #organizationTitle {
        text-align: center;
        font-size: 4vh;
        font-weight: bold;
        margin: 0;
        padding: 0;
        color: white;
        overflow: auto;
        white-space: nowrap;
        max-width: 96vw;
        height: 8vh;
    }

    #newMember {
        display: flex;
        align-items: center;
        justify-content: space-evenly;
        width: 50vw;
        min-width: 200px;
        height: 7vh;
        background-color: #d4d4d4;
        border-radius: 10px;
        margin: 0;
        padding: 0;
    }

    #newMemberInput {
        width: 30vw;
        height: 3vh;
        background-color: #d4d4d4;
        border-radius: 10px;
        padding-left: 5px;
        font-size: 1.5vh;
        text-align: center;
    }

    #newMemberButton {
        width: 10vw;
        min-width: 50px;
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

    #organizationList {
        position: absolute;
        left: 22vw;
        top: 1vh;
        width: 55vw;
        max-height: 13vh;
        overflow-y: auto;
        text-align: left;
        background-color: #007bff;
        border-radius: 10px;
    }

    .listItem {
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0;
        padding-left: 5px;
        padding-right: 5px;
        min-height: 5vh;
        max-height: 5vh;
        overflow-x: auto;
        overflow-y: hidden;
        text-align: center;
        cursor: pointer;
        color: white;
        transition: background-color 0.25s ease-in-out;
    }

    .listItem:hover {
        background-color: #0056b3;
        transition: background-color 0.25s ease-in-out;
    }

    #organizationTeamList {
        position: absolute;
        left: 2vw;
        top: 60vh;
        width: 96vw;
        height: 29vh;
        overflow-y: auto;
        text-align: left;
        background-color: #007bff;
        border-radius: 10px;
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

    #organizationTeamListOfTeams {
        position: absolute;
        left: 2vw;
        top: 15vh;
        width: 92vw;
        height: 14vh;
        overflow-y: auto;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: space-evenly;
        align-items: stretch;
    }

    .organizationTeamListItem {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-content: center;
        width: 200px;
        min-height: 5vh;
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

    @media screen and (max-width: 700px) {
        #newTeam {
            width: 56vw;
        }
    }
    @media screen and (min-width: 700px) {
        #newTeam {
            width: 700px;
        }
    }

    #newTeam {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-evenly;
        align-items: center;
        align-content: center;
        /* width: 56vw; */
        height: 7vh;
        background-color: #d4d4d4;
        border-radius: 10px;
        margin: 0;
        padding: 0;
        margin-top: 5px;
        margin-bottom: 5px;
    }

    #newTeamInput {
        width: 22vw;
        min-width: 175px;
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
