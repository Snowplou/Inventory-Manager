<script>
    // @ts-nocheck
    import MiniSearch from "minisearch";

    import { fade, fly } from "svelte/transition";
    import { flip } from "svelte/animate";

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
        showAllParts,
        isTouchscreen,
        logEvent,
        animationTime
    } from "../db";
    import { append } from "svelte/internal";
    let teamProducts = {};
    let selectedTeamForTransfer = "Inventory";
    let search = "";

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

    organizations.subscribe(() => {
        updateParts();
    });

    organizationSelectionForParts.subscribe(() => {
        updateParts();
    });

    teamSelected.subscribe(() => {
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

    async function showAllPartsClicked() {
        showAllParts.set(!$showAllParts);
        applySearch();
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
        // Convert &amp; to &
        decodedName = decodedName.replaceAll("&amp;", "&");
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

    async function createCustomPart() {
        let partCount =
            $organizations[$organizationSelectionForParts].teams[$teamSelected]
                .customParts;
        if (!partCount) partCount = 1;
        else partCount = Object.keys(partCount).length + 1;

        setToDb(
            `organizations/${$organizationSelectionForParts}/teams/${$teamSelected}/customParts/Custom Part ${partCount}`,
            {
                image: "none",
            }
        );

        customPartSelected.set(`Custom Part ${partCount}`);
    }

    let lastSearchTime = 0;
    let timeThreshold = 350;
    function searchChanged(elm) {
        search = elm.target.value;
        lastSearchTime = Date.now();
        setTimeout(() => {
            if (Date.now() - lastSearchTime >= timeThreshold) {
                applySearch();
            }
        }, timeThreshold);
        // applySearch();
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

        if ($showAllParts) {
            // Add the custom parts to the sortedParts array
            let customParts = [];
            if ($organizations[$organizationSelectionForParts].teams) {
                if (
                    $organizations[$organizationSelectionForParts].teams[
                        $teamSelected
                    ]
                ) {
                    if (
                        $organizations[$organizationSelectionForParts].teams[
                            $teamSelected
                        ].customParts
                    ) {
                        customParts = Object.keys(
                            $organizations[$organizationSelectionForParts]
                                .teams[$teamSelected].customParts
                        );
                    }
                }
            }

            for (let i = 0; i < customParts.length; i++) {
                let key = customParts[i];
                key = decodeProductName(key);
                sortedParts.push({
                    name: key,
                    sku: getSKU(key),
                    id: i,
                    score: 0,
                });
            }

            // Add the main parts to the sortedParts array
            let info = Object.values($products);
            for (let i = 0; i < info.length; i++) {
                sortedParts.push({
                    name: info[i].name,
                    sku: info[i].sku,
                    id: i + customParts.length,
                    score: 0,
                });
            }
        } else {
            let keys = Object.keys(
                $organizations[$organizationSelectionForParts].teams[
                    $teamSelected
                ].products
            );

            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                key = decodeProductName(key);
                sortedParts.push({
                    name: key,
                    sku: getSKU(key),
                    id: i,
                    score: 0,
                });
            }
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
    function hideCustomContextMenu(event) {
        // Don't set style to none if it doesn't exist
        if (document.getElementById("customContextMenu"))
            document.getElementById("customContextMenu").style.display = "none";
        // If the event element type is not li and it is not an input with type number and it is not a select or option element
        if (
            event.target.tagName != "LI" &&
            event.target.type != "number" &&
            event.target.tagName != "SELECT" &&
            event.target.tagName != "OPTION"
        ) {
            if (event.target.classList) {
                let className = event.target.className;
                if (
                    className == "addMenu" ||
                    className == "removeMenu" ||
                    className == "transferMenu"
                ) {
                    return;
                }
            }

            partSelectedForMenu = "";

            // Hide the elements with the addMenu class
            if (document.getElementsByClassName("addMenu")) {
                for (let elm of document.getElementsByClassName("addMenu")) {
                    elm.style.display = "none";
                }
            }

            // Hide the elements with the removeMenu class
            if (document.getElementsByClassName("removeMenu")) {
                for (let elm of document.getElementsByClassName("removeMenu")) {
                    elm.style.display = "none";
                }
            }

            // Hide the elements with the transferMenu class
            if (document.getElementsByClassName("transferMenu")) {
                for (let elm of document.getElementsByClassName(
                    "transferMenu"
                )) {
                    elm.style.display = "none";
                }
            }
        }
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

        // Hide the elements with the removeMenu class
        if (document.getElementsByClassName("removeMenu")) {
            for (let elm of document.getElementsByClassName("removeMenu")) {
                elm.style.display = "none";
            }
        }

        // Hide the elements with the transferMenu class
        if (document.getElementsByClassName("transferMenu")) {
            for (let elm of document.getElementsByClassName("transferMenu")) {
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
        if (
            event.pageY + myContextMenu.offsetHeight + 50 >
            window.innerHeight
        ) {
            // Adjust the top position of the menu to keep it above the screen
            myContextMenu.style.top =
                event.pageY - myContextMenu.offsetHeight + "px";
        }

        try {
            // Desktop
            partSelectedForMenu = decodeProductName(
                event.currentTarget.children[1].children[0].innerHTML
            );
        } catch {
            partSelectedForMenu = decodeProductName(
                event.currentTarget.parentNode.children[1].children[0].innerHTML
            );
        }
    }

    function add(elm) {
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
        if ($isTouchscreen) {
            addMenu.style.scale = "1.5";
        }

        // Set the left and top position of the menu based on the cursor. If the cursor is on the right side of te screen, use the right corners, otherwise the left corners. If it is on the bottom of the screen, use the bottom corners, otherwise the top corners.
        let left = elm.pageX;
        let top = elm.pageY;
        let leftMiddle = window.innerWidth / 2;
        let topMiddle = window.innerHeight / 2;
        if (elm.pageX > leftMiddle) {
            left = elm.pageX - 200;
            if ($isTouchscreen) {
                left -= 40;
            }
        }
        if (elm.pageY > topMiddle) {
            top = elm.pageY - 100;
        }
        addMenu.style.left = left + "px";
        addMenu.style.top = top + "px";

        // Create the input
        let input = document.createElement("input");
        input.type = "number";
        input.id = "addMenuInput";
        input.value = 1;
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
            if (isNaN(event.target.value)) {
                event.target.value = 0;
            }
            if (!event.target.value) {
                event.target.value = 0;
            }
        };

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
        };
        addButton.onmouseout = () => {
            addButton.style.backgroundColor = "white";
        };
        addButton.onclick = (event) => {
            let addingCount = Number(
                event.target.parentElement.children[0].value
            );
            if (addingCount == 0) {
                document.body.removeChild(addMenu);
                return;
            }
            let partName = encodeProductName(partSelectedForMenu);
            let currentCount = 0;
            if (
                $organizations[$organizationSelectionForParts].teams[
                    $teamSelected
                ]
            )
                if (
                    $organizations[$organizationSelectionForParts].teams[
                        $teamSelected
                    ].products
                )
                    if (
                        $organizations[$organizationSelectionForParts].teams[
                            $teamSelected
                        ].products[partName]
                    ) {
                        currentCount =
                            $organizations[$organizationSelectionForParts]
                                .teams[$teamSelected].products[partName];
                    }
            let newCount = currentCount + addingCount;
            if (newCount < 0) {
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

            // Log the event
            logEvent($organizationSelectionForParts, {
                type: "add part",
                part: partName,
                count: addingCount,
                team: $teamSelected,
            });

            document.body.removeChild(addMenu);
        };

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
        };
        cancelButton.onmouseout = () => {
            cancelButton.style.backgroundColor = "white";
        };
        cancelButton.onclick = () => {
            document.body.removeChild(addMenu);
        };

        // Add the input and buttons to the menu
        addMenu.appendChild(input);
        addMenu.appendChild(addButton);
        addMenu.appendChild(cancelButton);

        // Add the menu to the page
        document.body.appendChild(addMenu);
    }

    function remove(elm) {
        // Create the menu
        let removeMenu = document.createElement("div");
        removeMenu.classList = "removeMenu";
        removeMenu.style.position = "absolute";
        removeMenu.style.backgroundColor = "#84abb5";
        removeMenu.style.color = "white";
        removeMenu.style.textAlign = "center";
        removeMenu.style.padding = "5px";
        removeMenu.style.borderRadius = "10px";
        removeMenu.style.width = "200px";
        if ($isTouchscreen) {
            removeMenu.style.scale = "1.5";
        }

        // Set the left and top position of the menu based on the cursor. If the cursor is on the right side of te screen, use the right corners, otherwise the left corners. If it is on the bottom of the screen, use the bottom corners, otherwise the top corners.
        let left = elm.pageX;
        let top = elm.pageY;
        let leftMiddle = window.innerWidth / 2;
        let topMiddle = window.innerHeight / 2;
        if (elm.pageX > leftMiddle) {
            left = elm.pageX - 200;
            if ($isTouchscreen) {
                left -= 40;
            }
        }
        if (elm.pageY > topMiddle) {
            top = elm.pageY - 100;
        }
        removeMenu.style.left = left + "px";
        removeMenu.style.top = top + "px";

        // Create the input
        let input = document.createElement("input");
        input.type = "number";
        input.id = "removeMenuInput";
        input.value = 1;
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
            if (isNaN(event.target.value)) {
                event.target.value = 0;
            }
            if (!event.target.value) {
                event.target.value = 0;
            }
        };

        // Create the ok button
        let removeButton = document.createElement("button");
        removeButton.innerHTML = "Remove";
        removeButton.style.backgroundColor = "white";
        removeButton.style.transition = "background-color 0.25s ease-in-out";
        removeButton.style.cursor = "pointer";
        removeButton.style.marginTop = "5px";
        removeButton.style.marginBottom = "5px";
        removeButton.style.marginLeft = "5px";
        removeButton.style.marginRight = "5px";
        removeButton.style.paddingLeft = "5px";
        removeButton.style.paddingRight = "5px";
        removeButton.style.borderRadius = "10px";
        removeButton.style.border = "none";
        removeButton.style.outline = "none";
        removeButton.style.fontSize = "12px";
        removeButton.style.fontWeight = "bold";
        removeButton.style.color = "black";
        removeButton.style.transition = "background-color 0.25s ease-in-out";
        removeButton.onmouseover = () => {
            removeButton.style.backgroundColor = "lightgray";
        };
        removeButton.onmouseout = () => {
            removeButton.style.backgroundColor = "white";
        };
        removeButton.onclick = (event) => {
            let removingCount = Number(
                event.target.parentElement.children[0].value
            );
            if (removingCount == 0) {
                document.body.removeChild(removeMenu);
                return;
            }
            let partName = encodeProductName(partSelectedForMenu);
            let currentCount = 0;
            if (
                $organizations[$organizationSelectionForParts].teams[
                    $teamSelected
                ]
            )
                if (
                    $organizations[$organizationSelectionForParts].teams[
                        $teamSelected
                    ].products
                )
                    if (
                        $organizations[$organizationSelectionForParts].teams[
                            $teamSelected
                        ].products[partName]
                    ) {
                        currentCount =
                            $organizations[$organizationSelectionForParts]
                                .teams[$teamSelected].products[partName];
                    }
            let newCount = currentCount - removingCount;
            if (newCount <= 0) {
                setToDb(
                    "organizations/" +
                        $organizationSelectionForParts +
                        "/teams/" +
                        $teamSelected +
                        "/products/" +
                        partName,
                    null
                );
                if (!$showAllParts) {
                    applySearch();
                }
            } else {
                setToDb(
                    "organizations/" +
                        $organizationSelectionForParts +
                        "/teams/" +
                        $teamSelected +
                        "/products/" +
                        partName,
                    newCount
                );
            }

            // Log the event
            logEvent($organizationSelectionForParts, {
                type: "remove product",
                part: partName,
                count: removingCount,
                team: $teamSelected,
            });

            document.body.removeChild(removeMenu);
        };

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
        };
        cancelButton.onmouseout = () => {
            cancelButton.style.backgroundColor = "white";
        };
        cancelButton.onclick = () => {
            document.body.removeChild(removeMenu);
        };

        // Add the input and buttons to the menu
        removeMenu.appendChild(input);
        removeMenu.appendChild(removeButton);
        removeMenu.appendChild(cancelButton);

        // Add the menu to the page
        document.body.appendChild(removeMenu);
    }

    function transfer(elm) {
        // Create the menu
        let transferMenu = document.createElement("div");
        transferMenu.classList = "transferMenu";
        transferMenu.style.position = "absolute";
        transferMenu.style.backgroundColor = "#84abb5";
        transferMenu.style.color = "white";
        transferMenu.style.textAlign = "center";
        transferMenu.style.padding = "5px";
        transferMenu.style.borderRadius = "10px";
        transferMenu.style.width = "200px";
        if ($isTouchscreen) {
            transferMenu.style.scale = "1.5";
        }

        // Set the left and top position of the menu based on the cursor. If the cursor is on the right side of te screen, use the right corners, otherwise the left corners. If it is on the bottom of the screen, use the bottom corners, otherwise the top corners.
        let left = elm.pageX;
        let top = elm.pageY;
        let leftMiddle = window.innerWidth / 2;
        let topMiddle = window.innerHeight / 2;
        if (elm.pageX > leftMiddle) {
            left = elm.pageX - 200;
            if ($isTouchscreen) {
                left -= 40;
            }
        }
        if (elm.pageY > topMiddle) {
            top = elm.pageY - 100;
        }
        transferMenu.style.left = left + "px";
        transferMenu.style.top = top + "px";

        // Create the input
        let input = document.createElement("input");
        input.type = "number";
        input.id = "transferMenuInput";
        input.value = 1;
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
            if (isNaN(event.target.value)) {
                event.target.value = 0;
            }
            if (!event.target.value) {
                event.target.value = 0;
            }
        };

        // Create the team selection dropdown
        let teamSelection = document.createElement("select");
        teamSelection.id = "teamSelection";
        teamSelection.style.width = "60%";
        teamSelection.style.height = "4vh";
        teamSelection.style.fontSize = "125%";
        teamSelection.style.marginRight = "0";
        teamSelection.style.paddingRight = "0";
        teamSelection.style.marginTop = "5px";
        teamSelection.style.marginBottom = "5px";
        teamSelection.style.marginLeft = "5px";
        teamSelection.style.marginRight = "5px";
        teamSelection.style.paddingLeft = "5px";
        teamSelection.style.paddingRight = "5px";
        teamSelection.style.borderRadius = "10px";

        // Add Inventory as an option
        let option = document.createElement("option");
        option.value = "Inventory";
        option.innerHTML = "Inventory";
        teamSelection.appendChild(option);
        // Add the teams in the organization except for the current team as options
        for (let team of $organizations[$organizationSelectionForParts]
            .teamList) {
            if (team == $teamSelected || team == "Coach" || team == "Unsorted")
                continue;
            let option = document.createElement("option");
            option.value = team;
            option.innerHTML = team;
            teamSelection.appendChild(option);
        }
        if ($teamSelected == selectedTeamForTransfer) {
            selectedTeamForTransfer = "Inventory";
        }
        teamSelection.value = selectedTeamForTransfer;
        teamSelection.onchange = (event) => {
            selectedTeamForTransfer = event.target.value;
        };

        // Create the ok button
        let transferButton = document.createElement("button");
        transferButton.innerHTML = "Transfer";
        transferButton.style.backgroundColor = "white";
        transferButton.style.transition = "background-color 0.25s ease-in-out";
        transferButton.style.cursor = "pointer";
        transferButton.style.marginTop = "5px";
        transferButton.style.marginBottom = "5px";
        transferButton.style.marginLeft = "5px";
        transferButton.style.marginRight = "5px";
        transferButton.style.paddingLeft = "5px";
        transferButton.style.paddingRight = "5px";
        transferButton.style.borderRadius = "10px";
        transferButton.style.border = "none";
        transferButton.style.outline = "none";
        transferButton.style.fontSize = "12px";
        transferButton.style.fontWeight = "bold";
        transferButton.style.color = "black";
        transferButton.style.transition = "background-color 0.25s ease-in-out";
        transferButton.onmouseover = () => {
            transferButton.style.backgroundColor = "lightgray";
        };
        transferButton.onmouseout = () => {
            transferButton.style.backgroundColor = "white";
        };
        transferButton.onclick = (event) => {
            let transferCount = Number(
                event.target.parentElement.children[0].value
            );
            if (transferCount == 0) {
                document.body.removeChild(transferMenu);
                return;
            }

            let partName = encodeProductName(partSelectedForMenu);

            let transferTeam = event.target.parentElement.children[2].value;

            let currentCount = 0;
            if (
                $organizations[$organizationSelectionForParts].teams[
                    $teamSelected
                ]
            )
                if (
                    $organizations[$organizationSelectionForParts].teams[
                        $teamSelected
                    ].products
                )
                    if (
                        $organizations[$organizationSelectionForParts].teams[
                            $teamSelected
                        ].products[partName]
                    ) {
                        currentCount =
                            $organizations[$organizationSelectionForParts]
                                .teams[$teamSelected].products[partName];
                    }

            let currentCountForTransferTeam = 0;
            if (
                $organizations[$organizationSelectionForParts].teams[
                    transferTeam
                ]
            )
                if (
                    $organizations[$organizationSelectionForParts].teams[
                        transferTeam
                    ].products
                )
                    if (
                        $organizations[$organizationSelectionForParts].teams[
                            transferTeam
                        ].products[partName]
                    ) {
                        currentCountForTransferTeam =
                            $organizations[$organizationSelectionForParts]
                                .teams[transferTeam].products[partName];
                    }

            if (
                transferCount >
                $organizations[$organizationSelectionForParts].teams[
                    $teamSelected
                ].products[partName]
            ) {
                transferCount =
                    $organizations[$organizationSelectionForParts].teams[
                        $teamSelected
                    ].products[partName];
            }
            let newCount = currentCount - transferCount;
            let newCountForTransferTeam =
                currentCountForTransferTeam + transferCount;

            if (newCount <= 0) {
                setToDb(
                    "organizations/" +
                        $organizationSelectionForParts +
                        "/teams/" +
                        $teamSelected +
                        "/products/" +
                        partName,
                    null
                );
                if (!$showAllParts) {
                    applySearch();
                }
            } else {
                setToDb(
                    "organizations/" +
                        $organizationSelectionForParts +
                        "/teams/" +
                        $teamSelected +
                        "/products/" +
                        partName,
                    newCount
                );
            }

            setToDb(
                "organizations/" +
                    $organizationSelectionForParts +
                    "/teams/" +
                    transferTeam +
                    "/products/" +
                    partName,
                newCountForTransferTeam
            );

            let createdNewCustomPart = false;
            if (isCustomPart(partName)) {
                let skipProuctCreation = false;
                if (
                    $organizations[$organizationSelectionForParts].teams[
                        transferTeam
                    ].customParts
                ) {
                    if (
                        $organizations[$organizationSelectionForParts].teams[
                            transferTeam
                        ].customParts[partName]
                    ) {
                        skipProuctCreation = true;
                    }
                }

                if (!skipProuctCreation) {
                    let productData =
                        $organizations[$organizationSelectionForParts].teams[
                            $teamSelected
                        ].customParts[partName];
                    setToDb(
                        "organizations/" +
                            $organizationSelectionForParts +
                            "/teams/" +
                            transferTeam +
                            "/customParts/" +
                            partName,
                        productData
                    );
                    createdNewCustomPart = true;
                }
            }

            // Log the event
            logEvent($organizationSelectionForParts, {
                type: "transfer product",
                part: partName,
                count: transferCount,
                team: $teamSelected,
                newTeam: transferTeam,
                createdNewCustomPart: createdNewCustomPart,
            });

            document.body.removeChild(transferMenu);
        };

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
        };
        cancelButton.onmouseout = () => {
            cancelButton.style.backgroundColor = "white";
        };
        cancelButton.onclick = () => {
            document.body.removeChild(transferMenu);
        };

        // Add the input and buttons to the menu
        transferMenu.appendChild(input);
        transferMenu.appendChild(transferButton);
        transferMenu.appendChild(teamSelection);
        transferMenu.appendChild(cancelButton);

        // Add the menu to the page
        document.body.appendChild(transferMenu);
    }

    document.onclick = hideCustomContextMenu;
</script>

{#if !$organizationSelectionForParts}
    <div id="organizationSelection"
    in:fade={{duration: $animationTime / 2, delay: $animationTime}}
    out:fly={{y: -200, duration: $animationTime}}
    >
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
    <div id="teamSelection"
    in:fly={{x: -100, duration: $animationTime}}
    out:fly={{x: -100, duration: $animationTime}}
    >
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

    <!-- {#if $teamSelected && ($userData.organizations[$organizationSelectionForParts].rank == "Owner" || $userData.organizations[$organizationSelectionForParts].rank == "Coach")} -->
    <!-- <button
            id="addParts"
            on:click={addPartsClicked}
            on:keydown={addPartsClicked}>Add Parts</button
        > -->
    <button
        id="showAllParts"
        on:click={showAllPartsClicked}
        on:keydown={showAllPartsClicked}
        in:fly={{ y: -100, duration: $animationTime }}
        out:fly={{ y: -100, duration: $animationTime }}
        >{$showAllParts ? "Minimize Parts" : "Show All Parts"}</button
    >
    <!-- {/if} -->

    {#key $organizationSelectionForParts}
        {#key $teamSelected}
            <!-- {#key sortedParts} -->
            <div id="partsList"
            in:fly={{x: 500, duration: $animationTime}}
            out:fly={{x: 500, duration: $animationTime}}
            >
                {#each Object.values(sortedParts) as productValues, i (productValues.name)}
                    <div
                        class="part"
                        animate:flip={{ duration: $animationTime }}
                        in:fly={{ x: 100, duration: $animationTime }}
                        out:fly={{ x: 100, duration: $animationTime }}
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
                        <!-- <div id="countAndEdit"> -->
                        <p id="count">
                            Count: {$organizations[
                                $organizationSelectionForParts
                            ].teams[$teamSelected].products[
                                encodeProductName(productValues.name)
                            ] || 0}
                        </p>
                        {#if $isTouchscreen}
                            <img
                                id="edit"
                                src="menuButton.png"
                                alt="edit"
                                on:touchend={(elm) =>
                                    showCustomContextMenu(elm)}
                            />
                        {/if}
                        <!-- </div> -->
                    </div>
                {:else}
                    {#if !$teamSelected}
                        <p id="noPartsFound">
                            No team selected.<br />You need to select a team on
                            the left side of the screen.
                        </p>
                    {:else}
                        <p id="noPartsFound">
                            No parts found.<br />You need to add parts to this
                            team.
                        </p>
                    {/if}
                {/each}
            </div>
            <!-- {/key} -->
        {/key}
    {/key}
{/if}

{#if $organizations[$organizationSelectionForParts]}
    <input
        type="text"
        id="searchBar"
        placeholder="Search"
        in:fly={{ y: -100, duration: $animationTime }}
        out:fly={{ y: -100, duration: $animationTime }}
        on:input={(elm) => searchChanged(elm)}
    />

    <button
        id="createCustomPart"
        in:fly={{ y: 100, duration: $animationTime }}
        out:fly={{ y: 100, duration: $animationTime }}
        on:click={() => createCustomPart()}
        on:keydown={() => createCustomPart()}>Create Custom Part</button
    >
{/if}

<div id="customContextMenu" style="display: none;">
    <ul class="menuItems">
        <li
            class="items"
            on:click={(elm) => add(elm)}
            on:keydown={(elm) => add(elm)}
        >
            Add
        </li>
        <li
            class="items"
            on:click={(elm) => remove(elm)}
            on:keydown={(elm) => remove(elm)}
        >
            Remove
        </li>
        <li
            class="items"
            on:click={(elm) => transfer(elm)}
            on:keydown={(elm) => transfer(elm)}
        >
            Transfer
        </li>
        {#if isCustomPart(encodeProductName(partSelectedForMenu))}
            <li
                class="items"
                on:click={() =>
                    customPartSelected.set(
                        encodeProductName(partSelectedForMenu)
                    )}
                on:keypress={() =>
                    customPartSelected.set(
                        encodeProductName(partSelectedForMenu)
                    )}
            >
                Edit
            </li>
        {/if}
    </ul>
</div>

{#if $isTouchscreen}
    <style>
        #customContextMenu {
            scale: 2;
        }
    </style>
{:else}
    <style>
        #customContextMenu {
            scale: 1.25;
        }

        /* .part:nth-child(odd) {
            border-right: 2px solid white;
        }
        .part:nth-child(even) {
            border-left: 2px solid white;
        } */
    </style>
{/if}

<style>
    #customContextMenu {
        position: absolute;
        background-color: #84abb5;
        color: white;
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

    /* #countAndEdit {
        display: flex;
        flex-direction: column;
        align-items: center;
    } */

    #edit {
        width: 45px;
        height: 45px;
        cursor: pointer;
    }

    #searchBar {
        position: absolute;
        left: 24vw;
        top: 13vh;
        width: 66vw;
        /* width: 45vw; */
        height: 4vh;
        text-align: center;
        font-size: 4vmin;
    }

    #createCustomPart {
        position: absolute;
        left: 24vw;
        top: 93.5vh;
        width: 74vw;
        height: 5vh;
        color: white;
        background-color: #007bff;
        transition: background-color 0.125s ease-in-out;
        /* Center the text vertically and horizontally */
        display: flex;
        align-items: center;
        justify-content: center;
    }

    #createCustomPart:hover {
        background-color: #0056b3;
        transition: background-color 0.125s ease-in-out;
    }

    /* .partPList {
        width: 100%;
    } */

    #partsList {
        position: absolute;
        left: 24vw;
        top: 20vh;
        width: 74vw;
        /* height: 76vh; */
        height: 72vh;
        border-radius: 10px;
        background-color: #007bff;
        overflow-y: scroll;
        /* display: flex;
        flex-direction: column; */
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
    }

    input {
        width: 50%;
        margin-right: 0;
        padding-right: 0;
    }

    .part {
        border-radius: 10px;
        padding-left: 6px;
        padding-right: 6px;
        transition: background-color 0.125s ease-in-out;
        width: 32vw;
        /* border: 4px white solid; */
    }

    /* If the screen is less than a certain size, set the width of part to 100%, otherwise 32vw */
    @media screen and (max-width: 1000px) {
        .part {
            width: 100%;
            border: none;
        }
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

    .part p {
        margin-top: 0;
        margin-bottom: 2px;
        margin-left: 10px;
        margin-right: 10px;
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

    #showAllParts {
        position: absolute;
        top: 0;
        left: 35vw;
        color: white;
        background-color: #007bff;
        border-radius: 10px;
        margin-top: 1vh;
        margin-right: 1vw;
        font-size: 4vmin;
        width: 30vw;
        height: 10vh;
        /* Vertically align text */
        display: flex;
        justify-content: center;
        align-items: center;
        transition: background-color 0.125s ease-in-out;
    }

    #showAllParts:hover {
        background-color: #0056b3;
        transition: background-color 0.125s ease-in-out;
    }
</style>
