<script>
    import { organizationSelectionForParts, getFromDb, setToDb, userData, userId, pageState, products } from "../db";

    async function backButtonPressed(){
        pageState.set("parts");
    }

    let vexCategories = {
        // 123: "https://www.vexrobotics.com/static/version1685052342/frontend/Ifi/vexrobotics/en_US/Magento_Catalog/images/product/product-line-icons/123.svg",
        // GO: "https://www.vexrobotics.com/static/version1685052342/frontend/Ifi/vexrobotics/en_US/Magento_Catalog/images/product/product-line-icons/go.svg",
        VideoPlaybackQuality: "https://www.vexrobotics.com/static/version1685052342/frontend/Ifi/vexrobotics/en_US/Magento_Catalog/images/product/product-line-icons/iq.svg",
        // EXP: "https://www.vexrobotics.com/static/version1685052342/frontend/Ifi/vexrobotics/en_US/Magento_Catalog/images/product/product-line-icons/exp.svg",
        VRC: "https://www.vexrobotics.com/static/version1685052342/frontend/Ifi/vexrobotics/en_US/Magento_Catalog/images/product/product-line-icons/v5.svg",
        // PRO: "https://www.vexrobotics.com/static/version1685052342/frontend/Ifi/vexrobotics/en_US/Magento_Catalog/images/product/product-line-icons/pro.svg",
    }

    let categorySelected = "";
    let filteredProducts = [];

    async function categoryClicked(elm){
        categorySelected = elm.target.alt;
    }

    // for(let i = 0; i < $products.length; i++){
    //     console.log($products[i].category);
    //     // if(products[i].category == categorySelected){
    //     //     filteredProducts.push(products[i]);
    //     // }
    // }

</script>


<button id="backToPartList" on:click={backButtonPressed} on:keydown={backButtonPressed}>Done Adding Parts</button>

<div id = "categorySelect">
    {#each Object.values(vexCategories) as category, i}
        <img class="categoryImage" src={category} alt={Object.keys(vexCategories)[i]} on:click={(elm) => categoryClicked(elm)} on:keydown={(elm) => categoryClicked(elm)}>
    {/each}
</div>

<style>

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