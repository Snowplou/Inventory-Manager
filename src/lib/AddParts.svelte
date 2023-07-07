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
    applyFilter();

    async function partTypeSelected(elm) {
        vexType = elm.target.value;
        applyFilter();
    }

    function searchChanged(elm) {
        search = elm.target.value;
        applyFilter();
    }

    function searchFilter(product) {
        let searchTerms = search.split(" ");
        for (let i = 0; i < searchTerms.length; i++) {
            if (
                !product.name
                    .toLowerCase()
                    .includes(searchTerms[i].toLowerCase())
                && !product.sku.toLowerCase().includes(searchTerms[i].toLowerCase())
            ) {
                return false;
            }
        }
        return true;
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
        filteredProducts = [];

        // Do the same thing but for custom parts
        let customParts = $organizations[$organizationSelectionForParts].teams[$teamSelected]
                .customParts
        let customPartsKeys = Object.keys(customParts)
        let customPartsValues = Object.values(customParts)
        for (let i = 0; i < Object.keys(customParts).length; i++) {
            let temp = {name: decodeProductName(customPartsKeys[i]), sku: customPartsValues[i].sku ? customPartsValues[i].sku : "SKU Not Found", url: customPartsValues[i].image}
            if (searchFilter(temp)) {
                filteredProducts.push(temp);
            }
        }

        // Do the same thing but for vex parts
        for (let i = 0; i < Object.keys($products).length; i++) {
            if (vexType == "All") {
                if (searchFilter($products[i])) {
                    filteredProducts.push($products[i]);
                }
            } else if ($products[i].type) {
                for (let j = 0; j < $products[i].type.length; j++) {
                    if ($products[i].type[j].includes(vexType)) {
                        if (searchFilter($products[i])) {
                            filteredProducts.push($products[i]);
                        }
                    }
                }
            }
        }
    }

    async function addProduct(elm) {
        let product = elm.target.parentElement.children[1].innerHTML;
        let count = Number(elm.target.parentElement.children[3].value);
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
        let partName = prompt(
            "What is the name of the part you would like to add?"
        );
        if (!partName) return;
        let partCount;
        while (true) {
            partCount = Number(prompt("How many of this part do you have?"));
            if (!partCount && !isNaN(partCount)) return;
            if (!isNaN(partCount) && partCount >= 1) break;
        }
        let partImage = prompt(
            "What is the image url of the part you would like to add? (optional)\nIf you do not have an image, leave this blank."
        );

        if (!partImage) partImage = "none";

        // Replace the characters that firebase doesn't like
        for (let i = 0; i < Object.keys(pathChanger).length; i++) {
            partName = partName.replaceAll(
                Object.keys(pathChanger)[i],
                Object.values(pathChanger)[i]
            );
        }
        partName = partName.replaceAll("&amp;", "&");

        let teamProducts = await getFromDb(
            `organizations/${$organizationSelectionForParts}/teams/${$teamSelected}/products/${partName}`
        );
        if (!teamProducts) {
            setToDb(
                `organizations/${$organizationSelectionForParts}/teams/${$teamSelected}/products/${partName}`,
                partCount
            );
        } else {
            setToDb(
                `organizations/${$organizationSelectionForParts}/teams/${$teamSelected}/products/${partName}`,
                Number(teamProducts) + partCount
            );
        }
        setToDb(
            `organizations/${$organizationSelectionForParts}/teams/${$teamSelected}/customParts/${partName}`,
            { image: partImage }
        );
    }

    async function deleteCustomProduct(elm) {
        let product =
            elm.target.parentElement.parentElement.children[1].innerHTML;

        // Replace the characters that firebase doesn't like
        for (let i = 0; i < Object.keys(pathChanger).length; i++) {
            product = product.replaceAll(
                Object.values(pathChanger)[i],
                Object.keys(pathChanger)[i]
            );
        }
        product = product.replaceAll("&amp;", "&");

        let confirm = window.confirm(
            `Are you sure you want to delete ${product}? Doing so will permanently delete it, making it impossible to undo.`
        );
        if (!confirm) return;

        setToDb(
            `organizations/${$organizationSelectionForParts}/teams/${$teamSelected}/customParts/${product}`,
            null
        );
        setToDb(
            `organizations/${$organizationSelectionForParts}/teams/${$teamSelected}/products/${product}`,
            null
        );
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
    <!-- {#if $organizations[$organizationSelectionForParts].teams}
        {#if $organizations[$organizationSelectionForParts].teams[$teamSelected]}
            {#if $organizations[$organizationSelectionForParts].teams[$teamSelected].customParts}
                {#each Object.keys($organizations[$organizationSelectionForParts].teams[$teamSelected].customParts) as product, i}
                    <div class="product">
                        <img
                            class="productImage"
                            src={nameToImage(product)}
                            onerror="this.src='https://static.vecteezy.com/system/resources/previews/000/365/820/original/question-mark-vector-icon.jpg'"
                            alt={productDecode(product)}
                        />
                        <p>{productDecode(product)}</p> -->
                        <!-- <p>{product.sku ? product.sku : "SKU Not Found"}</p> -->

                        <!-- {#if $organizations[$organizationSelectionForParts].teams}
                            {#if $organizations[$organizationSelectionForParts].teams[$teamSelected]}
                                {#if $organizations[$organizationSelectionForParts].teams[$teamSelected].products[encode(product)]}
                                    <p>
                                        Count: {$organizations[
                                            $organizationSelectionForParts
                                        ].teams[$teamSelected].products[
                                            encode(product)
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

                        <input
                            type="number"
                            placeholder="1"
                            on:input={(elm) =>
                                (elm.target.value = Math.abs(
                                    Math.round(elm.target.value)
                                ))}
                        />
                        <div class="addAndDelete">
                            <button
                                on:click={(elm) => addCustomProduct(elm)}
                                on:keydown={(elm) => addCustomProduct(elm)}
                                >Add</button
                            >
                            <button
                                on:click={(elm) => deleteCustomProduct(elm)}
                                on:keydown={(elm) => deleteCustomProduct(elm)}
                                >Delete</button
                            >
                        </div>
                    </div>
                {/each}
            {/if}
        {/if}
    {/if} -->
    {#each filteredProducts as product, i}
        <div class="product">
            <img class="productImage" src={product.url} alt={product.name}
            onerror="this.src='https://static.vecteezy.com/system/resources/previews/000/365/820/original/question-mark-vector-icon.jpg'"
            />
            <p>{product.name}</p>
            <p>{product.sku}</p>

            {#if $organizations[$organizationSelectionForParts].teams}
                {#if $organizations[$organizationSelectionForParts].teams[$teamSelected]}
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
