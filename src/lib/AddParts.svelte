<script>
    import {
        organizationSelectionForParts,
        getFromDb,
        setToDb,
        userData,
        userId,
        pageState,
        products,
        teamSelected
    } from "../db";

    async function backButtonPressed() {
        pageState.set("parts");
    }

    let vexCategories = {
        VIQC: "https://www.vexrobotics.com/static/version1685052342/frontend/Ifi/vexrobotics/en_US/Magento_Catalog/images/product/product-line-icons/iq.svg",
        VRC: "https://www.vexrobotics.com/static/version1685052342/frontend/Ifi/vexrobotics/en_US/Magento_Catalog/images/product/product-line-icons/v5.svg",
    };

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

    let categorySelected = "";
    let vexType = "All";
    let filteredProducts = [];

    async function categoryClicked(elm) {
        categorySelected = elm.target.alt;
        applyFilter();
    }

    async function partTypeSelected(elm) {
        vexType = elm.target.value;
        applyFilter();
    }

    async function applyFilter() {
        filteredProducts = [];
        for (let i = 0; i < Object.keys($products).length; i++) {
            if ($products[i].category) {
                if ($products[i].category.includes(categorySelected)) {


                    if(vexType == "All"){
                        filteredProducts.push($products[i]);
                    }
                    else if($products[i].type){
                        for(let j = 0; j < $products[i].type.length; j++){
                            if($products[i].type[j].includes(vexType)){
                                filteredProducts.push($products[i]);
                            }
                        }
                    }

                }
            }
        }
    }

    let pathChanger = {
        ".": "a1802s3na79",
        "#": "8sb28218ab2",
        "$": "ab19a7ba18a",
        "[": "auba189a9na1",
        "]": "aab2723na81n",
    }

    async function addProduct(elm){
        let product = elm.target.parentElement.children[1].innerHTML;

        // Replace the characters that firebase doesn't like
        for(let i = 0; i < Object.keys(pathChanger).length; i++){
            product = product.replaceAll(Object.keys(pathChanger)[i], Object.values(pathChanger)[i]);
        }
        
        let teamProducts = await getFromDb(`organizations/${$organizationSelectionForParts}/teams/${$teamSelected}/products/${product}`);
        if(!teamProducts){
            setToDb(`organizations/${$organizationSelectionForParts}/teams/${$teamSelected}/products/${product}`, 1);
        }
        else{
            setToDb(`organizations/${$organizationSelectionForParts}/teams/${$teamSelected}/products/${product}`, Number(teamProducts) + 1);
        }
        elm.target.parentElement.children[3].innerHTML = "Added!";
        setTimeout(() => {
            elm.target.parentElement.children[3].innerHTML = "Add";
        }, 500);
    }
    
</script>

<button
    id="backToPartList"
    on:click={backButtonPressed}
    on:keydown={backButtonPressed}>Done Adding Parts</button
>

<div id="categorySelect">
    {#each Object.values(vexCategories) as category, i}
        <img
            class="categoryImage"
            src={category}
            alt={Object.keys(vexCategories)[i]}
            on:click={(elm) => categoryClicked(elm)}
            on:keydown={(elm) => categoryClicked(elm)}
        />
    {/each}
</div>

<select id="partFilter" on:change={(elm) => partTypeSelected(elm)}>
    <option value="All">All</option>
    {#each partTypes as partType}
        <option value={partType}>{partType}</option>
    {/each}
</select>

{#key categorySelected}
    <div id="productList">
        {#each filteredProducts as product, i}
            <div class="product">
                <img
                    class="productImage"
                    src={product.url}
                    alt={product.name}
                />
                <p class="productName">{product.name}</p>
                <p class="productPrice">${product.price}</p>
                <button class="addProductButton" on:click={(elm) => addProduct(elm)} on:keydown={(elm) => addProduct(elm)}>Add</button>
            </div>
        {:else}
            <p id="noCategorySelected">No Category Selected</p>
        {/each}
    </div>
{/key}

<style>
    #noCategorySelected {
        display: flex;
        align-items: center;
        margin-left: auto;
        margin-right: auto;
        color: white;
        font-size: 8vmin;
        font-weight: bold;
    }

    #partFilter {
        position: absolute;
        top: 19vh;
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

    #categorySelect {
        position: absolute;
        left: 0;
        top: 13vh;
        width: 100%;
        height: 5vh;
        margin: 0;
        padding: 0;
        background-color: gray;
        display: flex;
        align-items: center;
        justify-content: space-evenly;
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
        height: calc(35vh + 3vw);
        margin-bottom: 5vh;
        position: relative;
    }

    #productList {
        position: absolute;
        left: 0;
        top: 26vh;
        width: 100%;
        height: 72vh;
        background-color: gray;
        overflow-y: auto;
        display: flex;
        flex-wrap: wrap;
    }

    #backToPartList {
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

    #backToPartList:hover {
        background-color: #0069d9;
        transition: background-color 0.25s ease-in-out;
    }

    .categoryImage {
        width: 8vh;
        margin: 0;
        padding: 0;
        cursor: pointer;
    }
</style>
