<script>
    import {
        organizationSelectionForParts,
        getFromDb,
        setToDb,
        organizations,
        pageState,
        products,
        teamSelected,
        pathChanger,
        logEvent,
        customPartSelected,
        userData,
        embedSentence,
        sentenceDistance,
        productEmbeds,
        customPartEmbeds,
    } from "../db";

    async function backButtonPressed() {
        pageState.set("parts");
    }

    let partTypes = [
        "Game Elements",
        "Structure",
        "Motion",
        "Electronics",
        "Hardware",
        "Motors",
        "Pneumatics",
        "Other",
    ];

    let vexType = "All";
    let search = "";
    let filteredProducts = [];

    // Do the same thing but for custom parts
    let customParts =
        $organizations[$organizationSelectionForParts].teams[$teamSelected];
    if (customParts) {
        customParts = customParts.customParts;
        if (!customParts) {
            customParts = {};
        }

        let customPartsKeys = Object.keys(customParts);
        let customPartsValues = Object.values(customParts);
        for (let i = 0; i < Object.keys(customParts).length; i++) {
            let temp = {
                name: decodeProductName(customPartsKeys[i]),
                sku: customPartsValues[i].sku
                    ? customPartsValues[i].sku
                    : "SKU Not Found",
                url: customPartsValues[i].image,
            };
                filteredProducts.push(temp);
        }
    }

    // Do the same thing but for vex parts
    for (let i = 0; i < Object.keys($products).length; i++) {
        filteredProducts.push($products[i]);
    }
    let originalProducts = [...filteredProducts];

    let sortedProducts = [];
    applyFilter();

    async function partTypeSelected(elm) {
        vexType = elm.target.value;
        applyFilter();
    }

    async function searchChanged(elm) {
        search = elm.target.value;

        if (!search) {
            applyFilter();
            return;
        }

        let searchEmbed = await embedSentence(search);
        let allProductEmbeds = [...$productEmbeds, ...$customPartEmbeds];
        let searchTerms = search.split(" ");
        for (let i in filteredProducts) {
            filteredProducts[i].distance = sentenceDistance(
                allProductEmbeds[i],
                searchEmbed
            );
            filteredProducts[i].index = Number(i);
            for (let term of searchTerms) {
                filteredProducts[i].distance -= filteredProducts[i].name
                    .toLowerCase()
                    .includes(term.toLowerCase())
                    ? 0.25
                    : 0;
                if (
                    filteredProducts[i].sku
                        .toLowerCase()
                        .includes(term.toLowerCase()) && filteredProducts[i].sku != "No SKU Available"
                ) {
                    filteredProducts[i].distance -= 0.25;
                }
                if (
                    filteredProducts[i].sku.toLowerCase() == term.toLowerCase() && filteredProducts[i].sku != "No SKU Available"
                ) {
                    filteredProducts[i].distance -= 100;
                }
            }
        }

        applyFilter();
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

    async function applyFilter() {
        if (search) {
            // Sort the products by distance
            sortedProducts = [...filteredProducts];
            sortedProducts.sort((a, b) => {
                return a.distance - b.distance;
            });
        } else {
            // Sort the products by index
            sortedProducts = [...originalProducts]
            // sortedProducts = [...filteredProducts];
            // sortedProducts.sort((a, b) => {
            //     return a.index - b.index;
            // });
        }
    }

    async function addProduct(elm) {
        let product = elm.target.parentElement.children[1].innerHTML;
        let count = Number(elm.target.parentElement.children[4].value);
        if (!count) count = 1;

        // Replace the characters that firebase doesn't like
        for (let i = 0; i < Object.keys(pathChanger).length; i++) {
            product = product.replaceAll(
                Object.keys(pathChanger)[i],
                Object.values(pathChanger)[i]
            );
        }
        product = product.replaceAll("&amp;", "&");

        let teamProducts = await getFromDb(
            `organizations/${$organizationSelectionForParts}/teams/${$teamSelected}/products/${product}`
        );
        if (!teamProducts) {
            setToDb(
                `organizations/${$organizationSelectionForParts}/teams/${$teamSelected}/products/${product}`,
                count
            );
        } else {
            setToDb(
                `organizations/${$organizationSelectionForParts}/teams/${$teamSelected}/products/${product}`,
                Number(teamProducts) + count
            );
        }
        elm.target.parentElement.children[4].innerHTML = "Added!";
        setTimeout(() => {
            elm.target.parentElement.children[4].innerHTML = "Add";
        }, 500);

        logEvent($organizationSelectionForParts, {
            type: "add part",
            part: product,
            count: count,
            team: $teamSelected,
        });
    }

    async function addCustomProduct(elm) {
        let product =
            elm.target.parentElement.parentElement.children[1].innerHTML;
        let count = Number(
            elm.target.parentElement.parentElement.children[3].value
        );
        if (!count) count = 1;

        // Replace the characters that firebase doesn't like
        for (let i = 0; i < Object.keys(pathChanger).length; i++) {
            product = product.replaceAll(
                Object.keys(pathChanger)[i],
                Object.values(pathChanger)[i]
            );
        }
        product = product.replaceAll("&amp;", "&");

        let teamProducts = await getFromDb(
            `organizations/${$organizationSelectionForParts}/teams/${$teamSelected}/products/${product}`
        );
        if (!teamProducts) {
            setToDb(
                `organizations/${$organizationSelectionForParts}/teams/${$teamSelected}/products/${product}`,
                count
            );
        } else {
            setToDb(
                `organizations/${$organizationSelectionForParts}/teams/${$teamSelected}/products/${product}`,
                Number(teamProducts) + count
            );
        }
        elm.target.innerHTML = "Added!";
        setTimeout(() => {
            elm.target.innerHTML = "Add";
        }, 500);
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

    function encode(name) {
        for (let i = 0; i < Object.keys(pathChanger).length; i++) {
            name = name.replaceAll(
                Object.keys(pathChanger)[i],
                Object.values(pathChanger)[i]
            );
        }
        return name;
    }

    function getCount(productName) {
        productName = encode(productName);
        let count =
            $organizations[$organizationSelectionForParts].teams[$teamSelected]
                .products[productName];
        if (!count) {
            return 0;
        } else {
            return count;
        }
    }

    function nameToImage(productName) {
        if (
            $organizations[$organizationSelectionForParts].teams[$teamSelected]
                .customParts[productName].image == "none"
        ) {
            return "https://static.vecteezy.com/system/resources/previews/000/365/820/original/question-mark-vector-icon.jpg";
        }
        return $organizations[$organizationSelectionForParts].teams[
            $teamSelected
        ].customParts[productName].image;
    }

    function productDecode(productName) {
        for (let i = 0; i < Object.keys(pathChanger).length; i++) {
            productName = productName.replaceAll(
                Object.values(pathChanger)[i],
                Object.keys(pathChanger)[i]
            );
        }
        return productName;
    }

    function canEditCustomPartsFunc() {
        if (!$organizationSelectionForParts) return false;
        if (!$teamSelected) return false;
        return (
            $userData.organizations[$organizationSelectionForParts].rank ==
                "Owner" ||
            $userData.organizations[$organizationSelectionForParts].rank ==
                "Coach" ||
            $userData.organizations[$organizationSelectionForParts].rank ==
                $teamSelected
        );
    }

    let canEditCustomParts = canEditCustomPartsFunc();
    teamSelected.subscribe(() => {
        canEditCustomParts = canEditCustomPartsFunc();
    });

    // Determine if the part is a custom part
    function isCustomPart(name) {
        name = encode(name);
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
</script>

<button
    id="backToPartList"
    on:click={backButtonPressed}
    on:keydown={backButtonPressed}>Done Adding Parts</button
>
<buton
    id="createCustomPart"
    on:click={() => createCustomPart()}
    on:keydown={() => createCustomPart()}
>
    Create Custom Part
</buton>

<select id="partFilter" on:change={(elm) => partTypeSelected(elm)}>
    <option value="All">All</option>
    {#each partTypes as partType}
        <option value={partType}>{partType}</option>
    {/each}
</select>

<div id="productList">
    {#each sortedProducts as product, i}
        <div class="product">
            <img
                class={canEditCustomParts && isCustomPart(product.name)
                    ? "customPart"
                    : "notCustomPart"}
                src={product.url}
                alt={product.name}
                onerror="this.src='https://static.vecteezy.com/system/resources/previews/000/365/820/original/question-mark-vector-icon.jpg'"
                on:click={() => {
                    if (canEditCustomParts && isCustomPart(product.name)) {
                        customPartSelected.set(encode(product.name));
                    }
                }}
                on:keydown={() => {
                    if (canEditCustomParts && isCustomPart(product.name)) {
                        customPartSelected.set(encode(product.name));
                    }
                }}
            />
            <p>{product.name}</p>
            <p>{product.sku}</p>

            {#if $organizations[$organizationSelectionForParts].teams}
                {#if $organizations[$organizationSelectionForParts].teams[$teamSelected]}
                    {#if $organizations[$organizationSelectionForParts].teams[$teamSelected].products}
                        {#if $organizations[$organizationSelectionForParts].teams[$teamSelected].products[encode(product.name)]}
                            <p>
                                Count: {$organizations[
                                    $organizationSelectionForParts
                                ].teams[$teamSelected].products[
                                    encode(product.name)
                                ]}
                            </p>
                        {:else}
                            <p>Count: 0</p>
                        {/if}
                    {:else}
                        <p>Count: 0</p>
                    {/if}
                {:else}
                    <p>Count: 0</p>
                {/if}
            {:else}
                <p>Count: 0</p>
            {/if}

            <input
                type="number"
                placeholder="1"
                on:input={(elm) =>
                    (elm.target.value = Math.abs(Math.round(elm.target.value)))}
            />
            <button
                on:click={(elm) => addProduct(elm)}
                on:keydown={(elm) => addProduct(elm)}>Add</button
            >
        </div>
    {/each}
</div>

<input
    type="text"
    id="searchBar"
    placeholder="Search"
    on:input={(elm) => searchChanged(elm)}
/>

<style>
    #partFilter {
        position: absolute;
        top: 14vh;
        left: 20vw;
        width: 60vw;
        height: 6vh;
        margin: 0;
        padding: 0;
        background-color: #007bff;
        color: white;
        border-radius: 10px;
        text-align: center;
        font-size: 6vmin;
    }

    .product img {
        margin-top: 5px;
        width: 50%;
        height: auto;
        object-fit: contain;
        border-radius: 10px;

        /* Transition */
        transition: filter 0.25s ease-in-out;
    }

    .customPart:hover {
        /* Fade into a slight gray */
        filter: brightness(80%);

        cursor: pointer;

        /* Transition */
        transition: filter 0.25s ease-in-out;
    }

    .product p {
        margin-top: 0;
        margin-bottom: 2px;
    }

    .product input {
        width: 8vw;
    }

    .product button {
        background-color: white;
        transition: background-color 0.25s ease-in-out;
    }

    .product button:hover {
        background-color: lightgray;
        transition: background-color 0.25s ease-in-out;
    }

    .product {
        width: 30vw;
        margin-bottom: 5vh;
        position: relative;
    }

    #productList {
        position: absolute;
        left: 1vw;
        top: 31vh;
        width: 98vw;
        height: 67vh;
        border-radius: 10px;
        background-color: gray;
        overflow-y: auto;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
    }

    .addAndDelete {
        display: flex;
        justify-content: space-evenly;
    }

    #searchBar {
        position: absolute;
        left: 25vw;
        top: 22vh;
        width: 50vw;
        height: 6vh;
        text-align: center;
        font-size: 4vmin;
    }

    #backToPartList {
        position: absolute;
        top: 0;
        right: 52.5vw;
        color: white;
        background-color: #007bff;
        border-radius: 10px;
        margin-top: 1vh;
        margin-right: 1vw;
        font-size: calc(1.5vh + 1vw);
        width: 20vw;
        height: 10vh;
        /* Vertically align text */
        display: flex;
        justify-content: center;
        align-items: center;
        transition: background-color 0.25s ease-in-out;
    }

    #backToPartList:hover {
        background-color: #0069d9;
        transition: background-color 0.25s ease-in-out;
    }

    #createCustomPart {
        position: absolute;
        top: 0;
        right: 27.5vw;
        color: white;
        background-color: #007bff;
        border-radius: 10px;
        margin-top: 1vh;
        margin-right: 1vw;
        font-size: calc(1.5vh + 1vw);
        width: 20vw;
        height: 10vh;
        cursor: pointer;
        /* Vertically align text */
        display: flex;
        justify-content: center;
        align-items: center;
        transition: background-color 0.25s ease-in-out;
    }

    #createCustomPart:hover {
        background-color: #0069d9;
        transition: background-color 0.25s ease-in-out;
    }
</style>
