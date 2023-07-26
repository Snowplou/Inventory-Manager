<script>
    // @ts-nocheck
    import MiniSearch from "minisearch";

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
        customPartSelected,
        logEvent,
    } from "../db";
    import { append } from "svelte/internal";
    let teamProducts = {};
    let selectedTeamForTransfer = "";
    let search = "";
    organizationSelectionForParts.subscribe(() => {
        if (!$organizationSelectionForParts) return;
        selectedTeamForTransfer =
            $organizations[$organizationSelectionForParts].teamList[2];
    });

    let sortedParts = [];
    applySearch();

    // Determine if the part is a custom part
    function isCustomPart(name) {
        if (!$organizationSelectionForParts) return false;
        if (!$teamSelected) return false;
        if (!$organizations[$organizationSelectionForParts].teams) return false;
        if (
            !$organizations[$organizationSelectionForParts].teams[$teamSelected]
        )
            return false;

        if (
            $organizations[$organizationSelectionForParts].teams[$teamSelected]
                .customParts
        ) {
            if (
                $organizations[$organizationSelectionForParts].teams[
                    $teamSelected
                ].customParts[name]
            ) {
                return true;
            }
        }
        return false;
    }

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
        applySearch();
    }

    async function addPartsClicked() {
        pageState.set("addParts");
    }

    function decodeProductName(name) {
        let decodedName = name;
        for (let i = 0; i < Object.keys(pathChanger).length; i++) {
            if (!decodedName) continue;
            decodedName = decodedName.replaceAll(
                Object.values(pathChanger)[i],
                Object.keys(pathChanger)[i]
            );
        }
        return decodedName;
    }

    function getSKU(name) {
        // Find the product in the products list
        name = decodeProductName(name);
        for (let product of Object.values($products)) {
            if (product.name == name) {
                return product.sku;
            }
        }

        // Find the product in the custom parts list
        name = encodeProductName(name);
        if (
            $organizations[$organizationSelectionForParts].teams[$teamSelected]
                .customParts
        ) {
            if (
                $organizations[$organizationSelectionForParts].teams[
                    $teamSelected
                ].customParts[name]
            ) {
                if (
                    $organizations[$organizationSelectionForParts].teams[
                        $teamSelected
                    ].customParts[name].sku
                ) {
                    return $organizations[$organizationSelectionForParts].teams[
                        $teamSelected
                    ].customParts[name].sku;
                }
            }
        }

        return "SKU Not Found";
    }

    function encodeProductName(name) {
        let encodedName = name;
        for (let i = 0; i < Object.keys(pathChanger).length; i++) {
            if (!encodedName) continue;
            encodedName = encodedName.replaceAll(
                Object.keys(pathChanger)[i],
                Object.values(pathChanger)[i]
            );
        }
        return encodedName;
    }

    function nameToImage(name) {
        if (
            $organizations[$organizationSelectionForParts].teams[$teamSelected]
                .customParts
        ) {
            if (
                $organizations[$organizationSelectionForParts].teams[
                    $teamSelected
                ].customParts[name]
            ) {
                if (
                    $organizations[$organizationSelectionForParts].teams[
                        $teamSelected
                    ].customParts[name].image == "none"
                ) {
                    return "https://static.vecteezy.com/system/resources/previews/000/365/820/original/question-mark-vector-icon.jpg";
                }
                return $organizations[$organizationSelectionForParts].teams[
                    $teamSelected
                ].customParts[name].image;
            }
        }
        for (let product of Object.values($products)) {
            if (product.name == name) {
                return product.url;
            }
        }

        name = decodeProductName(name);

        if (
            $organizations[$organizationSelectionForParts].teams[$teamSelected]
                .customParts
        ) {
            if (
                $organizations[$organizationSelectionForParts].teams[
                    $teamSelected
                ].customParts[name]
            ) {
                if (
                    $organizations[$organizationSelectionForParts].teams[
                        $teamSelected
                    ].customParts[name].image == "none"
                ) {
                    return "https://static.vecteezy.com/system/resources/previews/000/365/820/original/question-mark-vector-icon.jpg";
                }
                return $organizations[$organizationSelectionForParts].teams[
                    $teamSelected
                ].customParts[name].image;
            }
        }
        for (let product of Object.values($products)) {
            if (product.name == name) {
                return product.url;
            }
        }
    }

    function searchChanged(elm) {
        search = elm.target.value;
        applySearch();
    }

    function applySearch() {
        sortedParts = [];
        if (!$organizationSelectionForParts) return;
        if (!$teamSelected) return;
        if (!$organizations[$organizationSelectionForParts].teams) return;
        if (
            !$organizations[$organizationSelectionForParts].teams[$teamSelected]
        )
            return;
        if (
            !$organizations[$organizationSelectionForParts].teams[$teamSelected]
                .products
        )
            return;

        let keys = Object.keys(
            $organizations[$organizationSelectionForParts].teams[$teamSelected]
                .products
        );
        let values = Object.values(
            $organizations[$organizationSelectionForParts].teams[$teamSelected]
                .products
        );
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            key = decodeProductName(key);
            let value = values[i];
            sortedParts.push({
                name: key,
                count: value,
                sku: getSKU(key),
                id: i,
            });
        }

        if (search) {
            // Use minisearch to search for the products by name and sku with a threshold of 0 (include everything)
            let miniSearch = new MiniSearch({
                fields: ["name", "sku"],
                storeFields: ["name", "sku", "count"],
                searchOptions: {
                    prefix: true,
                    fuzzy: 0.1,
                },
            });

            // Add all the parts to the search
            miniSearch.addAll(sortedParts);

            // Search for the parts
            sortedParts = miniSearch.search(search);
        }
    }

    let partSelectedForMenu = "";

    // hiding the menu on click to the document
    function hideCustomContextMenu() {
        // Don't set style to none if it doesn't exist
        if (document.getElementById("customContextMenu"))
            document.getElementById("customContextMenu").style.display = "none";
    }

    // toggling the menu on right click to the page
    function showCustomContextMenu(event) {
        event.preventDefault();
        var myContextMenu = document.getElementById("customContextMenu");
        myContextMenu.style.display = "block";
        myContextMenu.style.left = event.pageX + "px";
        myContextMenu.style.top = event.pageY + "px";

        // Hide the elements with the addMenu class
        if (document.getElementsByClassName("addMenu")) {
            for (let elm of document.getElementsByClassName("addMenu")) {
                elm.style.display = "none";
            }
        }

        // Check if the menu would be placed to the right of the screen
        if (event.pageX + myContextMenu.offsetWidth + 25 > window.innerWidth) {
            // Adjust the left position of the menu to keep it on the screen
            myContextMenu.style.left =
                event.pageX - myContextMenu.offsetWidth + "px";
        }

        // Check if the menu would be placed below the screen
        if (event.pageY + myContextMenu.offsetHeight + 50 > window.innerHeight) {
            // Adjust the top position of the menu to keep it above the screen
            myContextMenu.style.top =
                event.pageY - myContextMenu.offsetHeight + "px";
        }

        partSelectedForMenu =
            event.currentTarget.children[1].children[0].innerHTML;
    }

    function add(elm){
        // Have a small menu appear asking how much to add. Have a input for typing the number. Below that are two buttons: ok and cancel.
        // If ok is pressed, add the number to the count of the part. If cancel is pressed, do nothing.

        // Create the menu
        let addMenu = document.createElement("div");
        addMenu.classList = "addMenu";
        addMenu.style.position = "absolute";
        addMenu.style.backgroundColor = "#84abb5";
        addMenu.style.color = "white";
        addMenu.style.textAlign = "center";
        addMenu.style.padding = "5px";
        addMenu.style.borderRadius = "10px";
        addMenu.style.width = "200px";

        // // Set the left and top position of the menu and adjust if needed. When doing the calculations, remember to account for the width and height of the menu and that it is in vw/vh instead of px.
        // let left = elm.pageX;
        // let top = elm.pageY;
        // let leftThresh = 160;
        // let topThresh = 0;
        // if (elm.pageX + leftThresh > window.innerWidth) {
        //     left = elm.pageX - leftThresh;
        // }
        // if (elm.pageY + topThresh > window.innerHeight) {
        //     top = elm.pageY - topThresh;
        // }
        // addMenu.style.left = left + "px";
        // addMenu.style.top = top + "px";


        // Set the left and top position of the menu based on the cursor. If the cursor is on the right side of te screen, use the right corners, otherwise the left corners. If it is on the bottom of the screen, use the bottom corners, otherwise the top corners.
        let left = elm.pageX;
        let top = elm.pageY;
        let leftMiddle = window.innerWidth / 2;
        let topMiddle = window.innerHeight / 2;
        if(elm.pageX > leftMiddle){
            left = elm.pageX - 200;
        }
        if(elm.pageY > topMiddle){
            top = elm.pageY - 100;
        }
        addMenu.style.left = left + "px";
        addMenu.style.top = top + "px";

        // Create the input
        let input = document.createElement("input");
        input.type = "number";
        input.id = "addMenuInput";
        input.style.width = "50%";
        input.style.height = "4vh";
        input.style.fontSize = "125%";
        input.style.marginRight = "0";
        input.style.paddingRight = "0";
        input.onchange = (event) => {
            // Make sure the input is a number that is greater than or equal to 0
            if (event.target.value < 0) {
                event.target.value = 0;
            }
            if(isNaN(event.target.value)){
                event.target.value = 0;
            }
            if(!event.target.value){
                event.target.value = 0;
            }
        }
        
        // Create the ok button
        let addButton = document.createElement("button");
        addButton.innerHTML = "Add";
        addButton.style.backgroundColor = "white";
        addButton.style.transition = "background-color 0.25s ease-in-out";
        addButton.style.cursor = "pointer";
        addButton.style.marginTop = "5px";
        addButton.style.marginBottom = "5px";
        addButton.style.marginLeft = "5px";
        addButton.style.marginRight = "5px";
        addButton.style.paddingLeft = "5px";
        addButton.style.paddingRight = "5px";
        addButton.style.borderRadius = "10px";
        addButton.style.border = "none";
        addButton.style.outline = "none";
        addButton.style.fontSize = "12px";
        addButton.style.fontWeight = "bold";
        addButton.style.color = "black";
        addButton.style.transition = "background-color 0.25s ease-in-out";
        addButton.onmouseover = () => {
            addButton.style.backgroundColor = "lightgray";
        }
        addButton.onmouseout = () => {
            addButton.style.backgroundColor = "white";
        }
        addButton.onclick = (event) => {
            let addingCount = Number(event.target.parentElement.children[0].value)
            if(addingCount == 0){
                document.body.removeChild(addMenu);
                return;
            }
            let partName = encodeProductName(partSelectedForMenu);
            let currentCount = 0;
            if($organizations[$organizationSelectionForParts].teams[$teamSelected])
            if($organizations[$organizationSelectionForParts].teams[$teamSelected].products)
            if($organizations[$organizationSelectionForParts].teams[$teamSelected].products[partName]){
                currentCount = $organizations[$organizationSelectionForParts].teams[$teamSelected].products[partName];
            }
            let newCount = currentCount + addingCount;
            if(newCount < 0){
                newCount = 0;
            }
            setToDb(
                "organizations/" +
                    $organizationSelectionForParts +
                    "/teams/" +
                    $teamSelected +
                    "/products/" +
                    partName,
                newCount
            );
            document.body.removeChild(addMenu);
        }

        // Create the cancel button
        let cancelButton = document.createElement("button");
        cancelButton.innerHTML = "Cancel";
        cancelButton.style.backgroundColor = "white";
        cancelButton.style.transition = "background-color 0.25s ease-in-out";
        cancelButton.style.cursor = "pointer";
        cancelButton.style.marginTop = "5px";
        cancelButton.style.marginBottom = "5px";
        cancelButton.style.marginLeft = "5px";
        cancelButton.style.marginRight = "5px";
        cancelButton.style.paddingLeft = "5px";
        cancelButton.style.paddingRight = "5px";
        cancelButton.style.borderRadius = "10px";
        cancelButton.style.border = "none";
        cancelButton.style.outline = "none";
        cancelButton.style.fontSize = "12px";
        cancelButton.style.fontWeight = "bold";
        cancelButton.style.color = "black";
        cancelButton.style.transition = "background-color 0.25s ease-in-out";
        cancelButton.onmouseover = () => {
            cancelButton.style.backgroundColor = "lightgray";
        }
        cancelButton.onmouseout = () => {
            cancelButton.style.backgroundColor = "white";
        }
        cancelButton.onclick = () => {
            document.body.removeChild(addMenu);
        }

        // Add the input and buttons to the menu
        addMenu.appendChild(input);
        addMenu.appendChild(addButton);
        addMenu.appendChild(cancelButton);

        // Add the menu to the page
        document.body.appendChild(addMenu);
    }

    // function remove()

    document.onclick = hideCustomContextMenu;
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
        {#each ["Inventory", ...$organizations[$organizationSelectionForParts].teamList] as team}
            {#if (team != "Unsorted" && team != "Coach" && (team == $userData.organizations[$organizationSelectionForParts].rank || $organizations[$organizationSelectionForParts].owner == $userData.email || $userData.organizations[$organizationSelectionForParts].rank == "Coach")) || team == "Inventory"}
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
            {#key sortedParts}
                <div id="partsList">
                    {#each Object.values(sortedParts) as productValues, i}
                        <div
                            class="part"
                            on:contextmenu={(elm) => showCustomContextMenu(elm)}
                            style="background-color: {partSelectedForMenu ==
                            productValues.name
                                ? '#0056b3'
                                : '#007bff'}"
                        >
                            <img
                                src={nameToImage(
                                    encodeProductName(productValues.name)
                                )}
                                onerror="this.src='https://static.vecteezy.com/system/resources/previews/000/365/820/original/question-mark-vector-icon.jpg'"
                                alt={productValues.name}
                            />
                            <div class="partPList">
                                <p>
                                    {productValues.name}
                                </p>
                                <p>
                                    {productValues.sku}
                                </p>
                            </div>
                            <p id="count">
                                Count: {$organizations[
                                    $organizationSelectionForParts
                                ].teams[$teamSelected].products[
                                    encodeProductName(productValues.name)
                                ]}
                            </p>
                        </div>
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

{#if $organizations[$organizationSelectionForParts]}
    <input
        type="text"
        id="searchBar"
        placeholder="Search"
        on:input={(elm) => searchChanged(elm)}
    />
{/if}

<div id="customContextMenu" style="display: none;">
    <ul class="menuItems">
        <li class="items"
        on:click={(elm) => add(elm)}
        on:keydown={(elm) => add(elm)}
        >Add</li>
        <li class="items"
        on:click={(elm) => remove(elm)}
        on:keydown={(elm) => remove(elm)}
        >Remove</li>
        <li class="items"
        on:click={(elm) => transfer(elm)}
        on:keydown={(elm) => transfer(elm)}
        >Transfer</li>
        {#if isCustomPart(encodeProductName(partSelectedForMenu))}
            <li
                class="items"
                on:click={() => customPartSelected.set(encodeProductName(partSelectedForMenu))}
                on:keypress={() => customPartSelected.set(encodeProductName(partSelectedForMenu))}
            >
                Edit
            </li>
        {/if}
    </ul>
</div>

<style>
    #customContextMenu {
        position: absolute;
        background-color: #84abb5;
        color: white;
        scale: 1.25;
        text-align: center;
    }
    .menuItems {
        list-style: none;
        font-size: 12px;
        padding: 0;
        margin: 0;
    }

    .items {
        cursor: pointer;
    }

    .items:hover {
        background-color: #607074;
    }

    .menuItems .items {
        padding: 5px;
        border-bottom: 1px solid #e6d4b6;
    }
    .menuItems .items:last-child {
        border: none;
    }

    #searchBar {
        position: absolute;
        left: 25vw;
        top: 13vh;
        width: 65vw;
        height: 4vh;
        text-align: center;
        font-size: 4vmin;
    }

    #transferToTeamText {
        font-size: 3vw;
    }

    .partPList {
        width: 100%;
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
        top: 20vh;
        width: 74vw;
        height: 76vh;
        border-radius: 10px;
        background-color: #007bff;
        overflow-y: auto;
        display: flex;
        /* flex-wrap: wrap; */
        flex-direction: column;
    }

    .partListButtons {
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        align-items: flex-end;
        height: 100%;
    }

    input {
        width: 50%;
        margin-right: 0;
        padding-right: 0;
    }

    .part img {
        margin-top: 5px;
        /* width: 50%; */
        /* height: auto; */
        width: auto;
        height: 10vh;
        object-fit: contain;
        border-radius: 10px;

        /* Transition */
        transition: filter 0.25s ease-in-out;
    }

    .part {
        border-radius: 10px;
        padding-left: 6px;
        padding-right: 6px;
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
