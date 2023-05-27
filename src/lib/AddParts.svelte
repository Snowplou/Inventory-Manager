<script>
    import {
        organizationSelectionForParts,
        getFromDb,
        setToDb,
        userData,
        userId,
        pageState,
        products,
    } from "../db";

    async function backButtonPressed() {
        pageState.set("parts");
    }

    let vexCategories = {
        // 123: "https://www.vexrobotics.com/static/version1685052342/frontend/Ifi/vexrobotics/en_US/Magento_Catalog/images/product/product-line-icons/123.svg",
        // GO: "https://www.vexrobotics.com/static/version1685052342/frontend/Ifi/vexrobotics/en_US/Magento_Catalog/images/product/product-line-icons/go.svg",
        VIQC: "https://www.vexrobotics.com/static/version1685052342/frontend/Ifi/vexrobotics/en_US/Magento_Catalog/images/product/product-line-icons/iq.svg",
        // EXP: "https://www.vexrobotics.com/static/version1685052342/frontend/Ifi/vexrobotics/en_US/Magento_Catalog/images/product/product-line-icons/exp.svg",
        VRC: "https://www.vexrobotics.com/static/version1685052342/frontend/Ifi/vexrobotics/en_US/Magento_Catalog/images/product/product-line-icons/v5.svg",
        // PRO: "https://www.vexrobotics.com/static/version1685052342/frontend/Ifi/vexrobotics/en_US/Magento_Catalog/images/product/product-line-icons/pro.svg",
    };

    let categorySelected = "";
    let filteredProducts = [];

    async function categoryClicked(elm) {
        categorySelected = elm.target.alt;

        filteredProducts = [];
        for (let i = 0; i < Object.keys($products).length; i++) {
            if ($products[i].category) {
                if ($products[i].category.includes(categorySelected)) {
                    filteredProducts.push($products[i]);
                }
            }
        }
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
                <button class="addProductButton">Add</button>
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
        top: 20vh;
        width: 100%;
        height: 75vh;
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
