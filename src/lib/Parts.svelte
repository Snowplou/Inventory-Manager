<script>
    import {
        organizationSelectionForParts,
        getFromDb,
        setToDb,
        userData,
        userId,
        pageState,
    } from "../db";
    let teamSelected = "";
    let parts = {};
    let teamList = [];

    // Delete me
    // Delete me
    // Delete me
    // Delete me
    // Delete me
    // Delete me
    organizationSelectionForParts.set("Canyon High School");
    (async () => {
        teamList = Object.values(
            await getFromDb(
                `organizations/${$organizationSelectionForParts}/teamList`
            )
        );
    })();
    // Delete me
    // Delete me
    // Delete me
    // Delete me
    // Delete me
    // Delete me

    async function organizationClicked(elm) {
        organizationSelectionForParts.set(elm.target.innerHTML);
        teamList = Object.values(
            await getFromDb(
                `organizations/${$organizationSelectionForParts}/teamList`
            )
        );
    }

    async function goBackToOrganizationSelection() {
        organizationSelectionForParts.set("");
    }

    async function teamClicked(elm) {
        teamSelected = elm.target.innerHTML;
    }

    async function addPartsClicked(){
        pageState.set("addParts");
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
        {#each teamList as team}
            {#if team != "Unsorted" && team != "Coach"}
                <p
                    class="teamListItem"
                    on:click={(elm) => teamClicked(elm)}
                    on:keydown={(elm) => teamClicked(elm)}
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

    <button id="addParts" on:click={addPartsClicked} on:keydown={addPartsClicked}>Add Parts</button>
{/if}

<style>
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
