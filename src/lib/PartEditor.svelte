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
    } from "../db";
    import LogIn from "./LogIn.svelte";

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

    let updatedName = false;
    function updateName(elm) {
        let name = elm.target.value;
        name = encodeProductName(name);

        if (!name) {
            alert("Name cannot be empty");
            return;
        }

        if (
            $organizations[$organizationSelectionForParts].teams[$teamSelected]
                .customParts[name]
        ) {
            alert("Part with that name already exists");
            return;
        }

        updatedName = true;

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

    function updateImage(elm) {
        let image = elm.target.value;
        let originalImage = elm.target.parentElement.children[0].src;
        setToDb(
            "organizations/" +
                $organizationSelectionForParts +
                "/teams/" +
                $teamSelected +
                "/customParts/" +
                $customPartSelected +
                "/image",
            image
        );

        logEvent($organizationSelectionForParts, {
            type: "edit custom part image",
            name: $customPartSelected,
            image: originalImage,
            newImage: image,
            team: $teamSelected,
        });
    }

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
        let currentState =
            $organizations[$organizationSelectionForParts].teams[$teamSelected]
                .customParts[$customPartSelected];

        if (!currentState) {
            if (!updatedName) {
                window.location.reload();
            }
            else{
                setTimeout(() => {
                    updatedName = false;
                }, 1500);
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
<div id="list">
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
            {$organizations[$organizationSelectionForParts].teams[$teamSelected]
                .customParts[$customPartSelected].sku || "SKU Not Found"}
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
            type="url"
            value={getImageUrl()}
            on:change={(elm) => updateImage(elm)}
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
        top: 14.5vh;
        left: 10vw;
        width: 80vw;
        height: 80vh;
        background-color: #007bff;
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
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
</style>
