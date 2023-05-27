<script>
    import {
        organizationSelectionForParts,
        getFromDb,
        setToDb,
        userData,
        pageState,
        teamSelected,
        organizations,
        pathChanger,
    } from "../db";
    import { writable } from "svelte/store";
    let parts = {};
    let teamProducts = {};

    function updateParts(){
        if (!$organizationSelectionForParts) return;
        if(!$teamSelected){
            teamProducts = {}
        }
        else if(!$organizations[$organizationSelectionForParts].teams){
            teamProducts = {}
        }
        else if (
            !$organizations[$organizationSelectionForParts].teams[$teamSelected]
        ) {
            teamProducts = {};
        } else {
            teamProducts = {
                ...$organizations[$organizationSelectionForParts].teams[
                    $teamSelected
                ].products,
            };
        }
    }

    organizations.subscribe((value) => {
        updateParts()
    });

    organizationSelectionForParts.subscribe((value) => {
        updateParts()
    });

    teamSelected.subscribe((value) => {
        updateParts()
    });

    async function organizationClicked(elm) {
        let orgName = elm.target.innerHTML;
        // If last character is a space, remove it
        if (orgName[orgName.length - 1] == " ") {
            orgName = orgName.slice(0, -1);
        }
        organizationSelectionForParts.set(orgName);
    }

    async function goBackToOrganizationSelection() {
        organizationSelectionForParts.set("");
    }

    async function teamClicked(elm) {
        teamSelected.set(elm.target.innerHTML);
    }

    async function addPartsClicked() {
        pageState.set("addParts");
    }

    function decodeProductName(name) {
        let decodedName = name;
        for (let i = 0; i < Object.keys(pathChanger).length; i++) {
            decodedName = decodedName.replaceAll(
                Object.values(pathChanger)[i],
                Object.keys(pathChanger)[i]
            );
        }
        return decodedName;
    }
</script>

{#if !$organizationSelectionForParts}
    <div id="organizationSelection">
        {#each Object.keys($userData.organizations) as organization}
            <p
                class="organizationListItem"
                on:click={(elm) => organizationClicked(elm)}
                on:keydown={(elm) => organizationClicked(elm)}
            >
                {organization}
            </p>
        {/each}
    </div>
{:else}
    <div id="teamSelection">
        {#each $organizations[$organizationSelectionForParts].teamList as team}
            {#if team != "Unsorted" && team != "Coach"}
                <p
                    class="teamListItem"
                    on:click={(elm) => teamClicked(elm)}
                    on:keydown={(elm) => teamClicked(elm)}
                    style="background-color: {team == $teamSelected
                        ? '#0056b3'
                        : ''}"
                >
                    {team}
                </p>
            {/if}
        {/each}
        <button
            id="goBackToOrganizationSelection"
            on:click={goBackToOrganizationSelection}
            on:keydown={goBackToOrganizationSelection}
            >Organization Selection</button
        >
    </div>

    <button
        id="addParts"
        on:click={addPartsClicked}
        on:keydown={addPartsClicked}>Add Parts</button
    >

    {#key $organizationSelectionForParts}
        {#key $teamSelected}
            <div id="partsList">
                {#each Object.values(teamProducts) as productCount, i}
                    <div class="part">
                        <!-- <img
                    class="productImage"
                    src={}
                    alt={}
                /> -->
                        <p>{decodeProductName(Object.keys(teamProducts)[i])}</p>
                        <p>{productCount}</p>
                        <button>Remove</button>
                    </div>
                {:else}
                    <p id="noPartsFound">
                        No parts found.<br />You need to add parts to this team.
                    </p>
                {/each}
            </div>
        {/key}
    {/key}
{/if}

<style>
    #partsList {
        position: absolute;
        left: 24vw;
        top: 12vh;
        width: 74vw;
        height: 72vh;
        border-radius: 10px;
        background-color: #007bff;
        overflow-y: auto;
        display: flex;
        flex-wrap: wrap;
    }

    .part img {
        margin-top: 5px;
        width: 50%;
        height: auto;
        object-fit: contain;
        border-radius: 10px;
    }

    .part p {
        margin-top: 0;
        margin-bottom: 2px;
    }

    .part button {
        background-color: white;
        transition: background-color 0.25s ease-in-out;
    }

    .part button:hover {
        background-color: lightgray;
        transition: background-color 0.25s ease-in-out;
    }

    .part {
        width: 30vw;
        height: calc(35vh + 3vw);
        margin-bottom: 5vh;
        position: relative;
    }

    #noPartsFound {
        display: flex;
        align-items: center;
        margin-left: auto;
        margin-right: auto;
        color: white;
        font-size: 8vmin;
        font-weight: bold;
    }

    #teamSelection {
        position: absolute;
        top: 12vh;
        left: 2vw;
        width: 20vw;
        height: 85vh;
        background-color: #007bff;
        border-radius: 10px;
        overflow-y: auto;
    }

    .teamListItem {
        color: white;
        max-width: 20vw;
        overflow-x: auto;
        cursor: pointer;
        margin-top: 0;
        margin-bottom: 0;
        padding-top: 0.75vh;
        padding-bottom: 0.75vh;
        transition: background-color 0.25s ease-in-out;
    }

    .teamListItem:hover {
        background-color: #0056b3;
        transition: background-color 0.25s ease-in-out;
    }

    #goBackToOrganizationSelection {
        position: absolute;
        left: 1vw;
        bottom: 1vh;
        width: 18vw;
        height: 6vh;
        overflow: hidden;
        padding: 0;
        font-size: 2.5vmin;
        transition: background-color 0.25s ease-in-out;
    }

    /* Fade into the background color */
    #goBackToOrganizationSelection:hover {
        background-color: lightgray;
        transition: background-color 0.25s ease-in-out;
    }

    #organizationSelection {
        display: block;
        margin-left: auto;
        margin-right: auto;
        width: 80vw;
        max-height: 70vh;
        background-color: #007bff;
        border-radius: 10px;
        overflow-y: auto;
    }

    .organizationListItem {
        color: white;
        overflow-x: auto;
        max-width: 80vw;
        cursor: pointer;
        margin-top: 0;
        margin-bottom: 0;
        padding-top: 1vh;
        padding-bottom: 1vh;
    }

    .organizationListItem:hover {
        background-color: #0056b3;
    }

    #addParts {
        position: absolute;
        top: 0;
        right: 40vw;
        background-color: #007bff;
        border-radius: 10px;
        margin-top: 1vh;
        margin-right: 1vw;
        font-size: 4vmin;
        width: 20vw;
        height: 10vh;
        /* Vertically align text */
        display: flex;
        justify-content: center;
        align-items: center;
        transition: background-color 0.25s ease-in-out;
    }

    #addParts:hover {
        background-color: #0056b3;
        transition: background-color 0.25s ease-in-out;
    }
</style>
