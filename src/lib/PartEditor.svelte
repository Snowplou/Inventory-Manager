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
        products,
        customPartSelected,
        logEvent,
        animationTime,
    } from "../db";
    import { fade } from "svelte/transition";
    import LogIn from "./LogIn.svelte";

    const imgbbApiKey = "da8b4bf1847073505720c55d1387ebae"
    function getImgBBSupport(fileName){
        let allowedExtensions = ["jpg", "jpeg", "png", "bmp", "gif","webp", "heic", "tiff"]
        for(let i = 0; i < allowedExtensions.length; i++){
            if(fileName.includes(allowedExtensions[i])) return true
        }
        return false
    }
    
    function updateImage(elm){
        // get the file name
        let file = elm.target.files[0];
        if(!file) return
        if(getImgBBSupport(file.name)){
            let url = `https://api.imgbb.com/1/upload?key=${imgbbApiKey}`
            let formData = new FormData();
            formData.append("image", file);
            fetch(url, {
                method: "POST",
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                let url = data.data.url
                setToDb(
                    "organizations/" +
                        $organizationSelectionForParts +
                        "/teams/" +
                        $teamSelected +
                        "/customParts/" +
                        $customPartSelected +
                        "/image",
                    url
                );
            })
            .catch(error => {
                console.error(error);
            });
        }
        else{
            alert("File type not supported\nCurrent file uploaded: " + file.name)
            // remove the file from the input
            elm.target.value = null;
        }
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

    function encodeProductName(name) {
        let encodedName = name;
        for (let i = 0; i < Object.keys(pathChanger).length; i++) {
            encodedName = encodedName.replaceAll(
                Object.keys(pathChanger)[i],
                Object.values(pathChanger)[i]
            );
        }
        return encodedName;
    }

    let updatedPart = false;
    function updateName(elm) {
        let name = elm.target.value;
        name = encodeProductName(name);

        if (!name) {
            alert("The name cannot be empty.");
            return;
        }

        // Check if the part already exists in official parts
        if($products.filter(product => product.name == name).length > 0){
            alert("A part with this name already exists.");
            return;
        }

        // Check if the part already exists in custom parts
        if (
            $organizations[$organizationSelectionForParts].teams[$teamSelected]
                .customParts[name]
        ) {
            alert("A part with this name already exists.");
            return;
        }

        updatedPart = true;

        // If the team doesn't have a custom part, then they shouldn't have access to this page. This means that this shouldn't try to access null with a key.
        let part =
            $organizations[$organizationSelectionForParts].teams[$teamSelected]
                .customParts[$customPartSelected];

        setToDb(
            "organizations/" +
                $organizationSelectionForParts +
                "/teams/" +
                $teamSelected +
                "/customParts/" +
                name,
            part
        );

        setToDb(
            "organizations/" +
                $organizationSelectionForParts +
                "/teams/" +
                $teamSelected +
                "/customParts/" +
                $customPartSelected,
            null
        );

        if (
            $organizations[$organizationSelectionForParts].teams[$teamSelected]
                .products
        ) {
            if (
                $organizations[$organizationSelectionForParts].teams[
                    $teamSelected
                ].products[$customPartSelected]
            ) {
                setToDb(
                    "organizations/" +
                        $organizationSelectionForParts +
                        "/teams/" +
                        $teamSelected +
                        "/products/" +
                        name,
                    $organizations[$organizationSelectionForParts].teams[
                        $teamSelected
                    ].products[$customPartSelected]
                );
            }
        }

        setToDb(
            "organizations/" +
                $organizationSelectionForParts +
                "/teams/" +
                $teamSelected +
                "/products/" +
                $customPartSelected,
            null
        );

        logEvent($organizationSelectionForParts, {
            type: "edit custom part name",
            name: $customPartSelected,
            newName: name,
            team: $teamSelected,
        });
        elm.target.parentElement.children[0].innerHTML =
            decodeProductName(name);
        customPartSelected.set(name);
    }

    function updateSku(elm) {
        let sku = elm.target.value;
        let originalSku = elm.target.parentElement.children[0].innerHTML;
        setToDb(
            "organizations/" +
                $organizationSelectionForParts +
                "/teams/" +
                $teamSelected +
                "/customParts/" +
                $customPartSelected +
                "/sku",
            sku
        );

        logEvent($organizationSelectionForParts, {
            type: "edit custom part sku",
            name: $customPartSelected,
            sku: originalSku,
            newSku: sku,
            team: $teamSelected,
        });
    }

    // function updateImage(elm) {
    //     let image = elm.target.value;
    //     let originalImage = elm.target.parentElement.children[0].src;
    //     setToDb(
    //         "organizations/" +
    //             $organizationSelectionForParts +
    //             "/teams/" +
    //             $teamSelected +
    //             "/customParts/" +
    //             $customPartSelected +
    //             "/image",
    //         image
    //     );

    //     logEvent($organizationSelectionForParts, {
    //         type: "edit custom part image",
    //         name: $customPartSelected,
    //         image: originalImage,
    //         newImage: image,
    //         team: $teamSelected,
    //     });
    // }

    function getImageUrl() {
        let url =
            $organizations[$organizationSelectionForParts].teams[$teamSelected]
                .customParts[$customPartSelected].image;
        if (url == null || url == "" || url == undefined || url == "none") {
            url =
                "https://static.vecteezy.com/system/resources/previews/000/365/820/original/question-mark-vector-icon.jpg";
        }
        return url;
    }

    async function deleteCustomProduct() {
        let product = $customPartSelected;

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

        customPartSelected.set("");
        setToDb(
            `organizations/${$organizationSelectionForParts}/teams/${$teamSelected}/customParts/${encodeProductName(
                product
            )}`,
            null
        );
        setToDb(
            `organizations/${$organizationSelectionForParts}/teams/${$teamSelected}/products/${encodeProductName(
                product
            )}`,
            null
        );

        logEvent($organizationSelectionForParts, {
            type: "delete custom part",
            name: product,
            team: $teamSelected,
        });
    }

    function updateCount(elm) {
        let count = elm.target.value;
        let originalCount =
            $organizations[$organizationSelectionForParts].teams[$teamSelected]
                .products[$customPartSelected];
        let partName = encodeProductName($customPartSelected);

        updatedPart = true;

        if (count != 0) {
            setToDb(
                "organizations/" +
                    $organizationSelectionForParts +
                    "/teams/" +
                    $teamSelected +
                    "/products/" +
                    partName,
                Number(count)
            );
        } else {
            setToDb(
                "organizations/" +
                    $organizationSelectionForParts +
                    "/teams/" +
                    $teamSelected +
                    "/products/" +
                    partName,
                null
            );
        }

        logEvent($organizationSelectionForParts, {
            type: "edit custom part count",
            name: $customPartSelected,
            count: originalCount || 0,
            newCount: Number(count),
            team: $teamSelected,
        });
    }

    organizations.subscribe(() => {
        let currentState = {};
        if (
            $organizations[$organizationSelectionForParts].teams[$teamSelected]
        ) {
            if (
                $organizations[$organizationSelectionForParts].teams[
                    $teamSelected
                ].customParts
            ) {
                if (
                    $organizations[$organizationSelectionForParts].teams[
                        $teamSelected
                    ].customParts[$customPartSelected]
                ) {
                    currentState =
                        $organizations[$organizationSelectionForParts].teams[
                            $teamSelected
                        ].customParts[$customPartSelected];
                }
            }
        }

        if (!currentState) {
            if (!updatedPart) {
                window.location.reload();
            } else {
                setTimeout(() => {
                    updatedPart = false;
                }, 3000);
            }
        }
    });
</script>

<button
    id="backToPartList"
    on:click={() => {
        customPartSelected.set("");
    }}>Back to Part List</button
>
<div
    id="list"
    in:fade={{ duration: $animationTime, delay: $animationTime / 2 }}
    out:fade={{ duration: $animationTime / 4 }}
>
    <div class="item">
        <p>{decodeProductName($customPartSelected)}</p>
        <input
            type="text"
            id="nameChange"
            value={decodeProductName($customPartSelected)}
            on:change={(elm) => updateName(elm)}
        />
    </div>
    <div class="item">
        <p>
            {#if $organizations[$organizationSelectionForParts].teams}
                {#if $organizations[$organizationSelectionForParts].teams[$teamSelected]}
                    {#if $organizations[$organizationSelectionForParts].teams[$teamSelected].customParts}
                        {#if $organizations[$organizationSelectionForParts].teams[$teamSelected].customParts[$customPartSelected]}
                            {$organizations[$organizationSelectionForParts]
                                .teams[$teamSelected].customParts[
                                $customPartSelected
                            ].sku || "SKU Not Found"}
                        {:else}
                            SKU Not Found
                        {/if}
                    {:else}
                        SKU Not Found
                    {/if}
                {:else}
                    SKU Not Found
                {/if}
            {:else}
                SKU Not Found
            {/if}
        </p>
        <input
            type="text"
            id="partNumber"
            value={$organizations[$organizationSelectionForParts].teams[
                $teamSelected
            ].customParts[$customPartSelected].sku || "SKU Not Found"}
            on:change={(elm) => updateSku(elm)}
        />
    </div>
    <div class="item">
        <img
            src={$organizations[$organizationSelectionForParts].teams[
                $teamSelected
            ].customParts[$customPartSelected].image}
            alt="Custom Part"
            onerror="this.src='https://static.vecteezy.com/system/resources/previews/000/365/820/original/question-mark-vector-icon.jpg'"
        />
        <input
            type="file"
            accept="image/*"
            on:change={(elm) => updateImage(elm)}
            id="imageUpload"
        />
    </div>
    <div class="item">
        <p id="countEditor">
            Count: {$organizations[$organizationSelectionForParts].teams[
                $teamSelected
            ].products[$customPartSelected] || 0}
        </p>
        <input
            type="number"
            value={$organizations[$organizationSelectionForParts].teams[
                $teamSelected
            ].products[$customPartSelected] || 0}
            on:change={(elm) => updateCount(elm)}
        />
    </div>
    <button
        id="deleteProduct"
        on:click={() => deleteCustomProduct()}
        on:keydown={() => deleteCustomProduct()}>Delete</button
    >
</div>

<style>
    #list {
        position: absolute;
        top: 12.5vh;
        left: 10vw;
        width: 80vw;
        height: 85vh;
        background-color: #007bff;
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
    }

    #imageUpload {
        display: block;
        margin-left: auto;
        margin-right: auto;
        text-align: center;
        width: 100%;
    }

    #countEditor {
        width: 100%;
        margin-top: 1vh;
        margin-bottom: 1vh;
    }

    .item {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    input {
        text-align: center;
        width: 50vw;
        scale: 1.5;
        border: none;
        border-radius: 10px;
    }

    p {
        color: white;
        background-color: #007bff;
        border: none;
        width: 95%;
        margin-left: 0;
        margin-right: 0;
        text-align: center;
        font-size: 150%;
    }

    img {
        width: 20vh;
        height: 20vh;
        margin-bottom: 3.5vh;
        margin-top: 3vh;
    }

    #backToPartList {
        position: absolute;
        top: 0;
        left: 40vw;
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

    #deleteProduct {
        margin-top: 1vh;
        margin-bottom: 1vh;
    }
</style>
