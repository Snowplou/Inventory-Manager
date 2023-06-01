<script>
    // @ts-nocheck

    import {
        organizationSelectionForParts,
        getFromDb,
        setToDb,
        userData,
        pageState,
        teamSelected,
        organizations,
        pathChanger,
        products,
    } from "../db";
    import { writable } from "svelte/store";
    let parts = {};
    let teamProducts = {};
    let selectedTeamForTransfer = "";
    let search = "";
    organizationSelectionForParts.subscribe(() => {
        if (!$organizationSelectionForParts) return;
        selectedTeamForTransfer =
            $organizations[$organizationSelectionForParts].teamList[2];
    });

    function updateParts() {
        if (!$organizationSelectionForParts) return;
        if (!$teamSelected) {
            teamProducts = {};
        } else if (!$organizations[$organizationSelectionForParts].teams) {
            teamProducts = {};
        } else if (
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
        updateParts();
    });

    organizationSelectionForParts.subscribe((value) => {
        updateParts();
    });

    teamSelected.subscribe((value) => {
        updateParts();
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
        // Remove amp
        decodedName = decodedName.replaceAll("&amp;", "&");
        for (let i = 0; i < Object.keys(pathChanger).length; i++) {
            decodedName = decodedName.replaceAll(
                Object.values(pathChanger)[i],
                Object.keys(pathChanger)[i]
            );
        }
        return decodedName;
    }

    function nameToImage(name) {
        name = decodeProductName(name);
        for (let product of Object.values($products)) {
            if (product.name == name) {
                return product.url;
            }
        }
    }

    async function removeProduct(elm, type) {
        let product =
            elm.target.parentElement.parentElement.children[1].children[0]
                .innerHTML;

        let productCount =
            $organizations[$organizationSelectionForParts].teams[$teamSelected]
                .products[product];

        if (type == "remove") {
            if (productCount == 1) {
                setToDb(
                    `organizations/${$organizationSelectionForParts}/teams/${$teamSelected}/products/${product}`,
                    null
                );
            } else {
                setToDb(
                    `organizations/${$organizationSelectionForParts}/teams/${$teamSelected}/products/${product}`,
                    productCount - 1
                );
                elm.target.parentElement.children[3].innerHTML = "Removed!";
                setTimeout(() => {
                    elm.target.parentElement.children[3].innerHTML = "Remove";
                }, 500);
            }
        } else {
            let transferTeam = document.getElementById(
                "transferToTeamSelect"
            ).value;
            let teamCount;
            if (
                $organizations[$organizationSelectionForParts].teams[
                    transferTeam
                ]
            ) {
                teamCount =
                    $organizations[$organizationSelectionForParts].teams[
                        transferTeam
                    ].products[product];
            }
            if (!teamCount) teamCount = 0;
            setToDb(
                `organizations/${$organizationSelectionForParts}/teams/${transferTeam}/products/${product}`,
                teamCount + 1
            );
            if (productCount == 1) {
                setToDb(
                    `organizations/${$organizationSelectionForParts}/teams/${$teamSelected}/products/${product}`,
                    null
                );
            } else {
                setToDb(
                    `organizations/${$organizationSelectionForParts}/teams/${$teamSelected}/products/${product}`,
                    productCount - 1
                );
                elm.target.parentElement.children[4].innerHTML = "Transferred!";
                setTimeout(() => {
                    elm.target.parentElement.children[4].innerHTML = "Transfer";
                }, 500);
            }
        }
    }

    function searchChanged(elm) {
        search = elm.target.value;
    }

    function searchFilter(product) {
        let searchTerms = search.split(" ");
        for (let i = 0; i < searchTerms.length; i++) {
            if (!product.toLowerCase().includes(searchTerms[i].toLowerCase())) {
                return false;
            }
        }
        return true;
    }
</script>

{#if !$organizationSelectionForParts}
    <div id="organizationSelection">
        {#if $userData}
            {#each Object.keys($userData.organizations) as organization}
                <p
                    class="organizationListItem"
                    on:click={(elm) => organizationClicked(elm)}
                    on:keydown={(elm) => organizationClicked(elm)}
                >
                    {organization}
                </p>
            {/each}
        {/if}
    </div>
{:else}
    <div id="teamSelection">
        <p
            class="teamListItem"
            on:click={(elm) => teamClicked(elm)}
            on:keydown={(elm) => teamClicked(elm)}
            style="background-color: {'Inventory' == $teamSelected
                ? '#0056b3'
                : ''}"
        >
            Inventory
        </p>
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

    {#if $teamSelected && ($userData.organizations[$organizationSelectionForParts].rank == "Owner" || $userData.organizations[$organizationSelectionForParts].rank == "Coach")}
        <button
            id="addParts"
            on:click={addPartsClicked}
            on:keydown={addPartsClicked}>Add Parts</button
        >
    {/if}

    {#key $organizationSelectionForParts}
        {#key $teamSelected}
            {#key search}
                <div
                    id="partsList"
                    style="top: {$teamSelected != 'Inventory'
                        ? '20vh'
                        : '24vh'};"
                >
                    {#each Object.values(teamProducts) as productCount, i}
                        {#if searchFilter(Object.keys(teamProducts)[i])}
                            <div class="part">
                                <img
                                    class="productImage"
                                    src={nameToImage(
                                        Object.keys(teamProducts)[i]
                                    )}
                                    alt={decodeProductName(
                                        Object.keys(teamProducts)[i]
                                    )}
                                />
                                <div class="partPList">
                                    <p>
                                        {decodeProductName(
                                            Object.keys(teamProducts)[i]
                                        )}
                                    </p>
                                    <p>Count: {productCount}</p>
                                </div>
                                <div class="partListButtons">
                                    <button
                                        on:click={(elm) =>
                                            removeProduct(elm, "remove")}
                                        on:keydown={(elm) =>
                                            removeProduct(elm, "remove")}
                                        >Remove</button
                                    >
                                    {#if $teamSelected == "Inventory"}
                                        <button
                                            on:click={(elm) =>
                                                removeProduct(elm, "transfer")}
                                            on:keydown={(elm) =>
                                                removeProduct(elm, "transfer")}
                                            >Transfer</button
                                        >
                                    {/if}
                                </div>
                            </div>
                        {/if}
                    {:else}
                        <p id="noPartsFound">
                            No parts found.<br />You need to add parts to this
                            team.
                        </p>
                    {/each}
                </div>
            {/key}
        {/key}
    {/key}
{/if}

{#if $teamSelected == "Inventory"}
    <div id="transferInputs">
        <p id="transferToTeamText">Transfer to team:</p>
        <select
            id="transferToTeamSelect"
            value={selectedTeamForTransfer}
            on:change={(elm) => (selectedTeamForTransfer = elm.target.value)}
        >
            {#each Object.values($organizations[$organizationSelectionForParts].teamList) as team}
                {#if team != "Unsorted" && team != "Coach"}
                    <option value={team}>{team}</option>
                {/if}
            {/each}
        </select>
    </div>
{/if}

<input
    type="text"
    id="searchBar"
    placeholder="Search"
    on:input={(elm) => searchChanged(elm)}
/>

{#if $teamSelected == "Inventory"}
    <style>
        .partListButtons {
            display: flex;
            flex-direction: column;
            justify-content: space-evenly;;
            height: 100%;
        }
    </style>
{:else}
    <style>
        .partListButtons {
            display: flex;
            flex-direction: column;
            justify-content: center;
            height: 100%;
        }
    </style>
{/if}

<style>
    select {
        text-align: center;
    }

    #searchBar {
        position: absolute;
        left: 25vw;
        top: 12vh;
        width: 65vw;
        height: 6vh;
        text-align: center;
        font-size: 4vmin;
    }

    #transferToTeamText {
        font-size: 3vw;
    }

    #transferInputs {
        position: absolute;
        left: 25vw;
        top: 19.5vh;
        width: 40vw;
        height: 4vh;
        display: flex;
        align-items: center;
        justify-content: space-around;
    }

    #partsList {
        position: absolute;
        left: 24vw;
        width: 74vw;
        height: 72vh;
        border-radius: 10px;
        background-color: #007bff;
        overflow-y: auto;
        display: flex;
        /* flex-wrap: wrap; */
        flex-direction: column;
    }

    .part img {
        margin-top: 5px;
        /* width: 50%; */
        /* height: auto; */
        width: auto;
        height: 10vh;
        object-fit: contain;
        border-radius: 10px;
    }

    .part p {
        margin-top: 0;
        margin-bottom: 2px;
        color: white;
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
        margin-top: 0.5vh;
        margin-bottom: 3.5vh;
        margin-left: 1vw;
        margin-right: 1vw;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 115px;
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
        color: white;
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
