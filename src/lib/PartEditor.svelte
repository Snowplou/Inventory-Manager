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
        customPartSelected
    } from "../db";

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

    function updateName(elm) {
        let name = elm.target.value;
        name = encodeProductName(name);

        if($organizations[$organizationSelectionForParts].teams[$teamSelected].customParts[name]) {
            alert("Part with that name already exists");
            return;
        }
        
        // If the team doesn't have a custom part, then they shouldn't have access to this page. This means that this shouldn't try to access null with a key.
        let part = $organizations[$organizationSelectionForParts].teams[$teamSelected].customParts[$customPartSelected];
        
        setToDb(
            "organizations/" +
                $organizationSelectionForParts +
                "/teams/" +
                $teamSelected +
                "/customParts/" +
                name,
            part
        )

        setToDb(
            "organizations/" +
                $organizationSelectionForParts +
                "/teams/" +
                $teamSelected +
                "/customParts/" +
                $customPartSelected,
            null
        )

        setToDb(
            "organizations/" +
                $organizationSelectionForParts +
                "/teams/" +
                $teamSelected +
                "/products/" +
                name,
            $organizations[$organizationSelectionForParts].teams[$teamSelected].products[$customPartSelected]
        )

        setToDb(
            "organizations/" +
                $organizationSelectionForParts +
                "/teams/" +
                $teamSelected +
                "/products/" +
                $customPartSelected,
            null
        )

        
        elm.target.parentElement.children[0].innerHTML = decodeProductName(name);
        // ("name").innerHTML = decodeProductName(name);
        customPartSelected.set(name);
    }

    function updateSku(elm){
        let sku = elm.target.value;
        setToDb(
            "organizations/" +
                $organizationSelectionForParts +
                "/teams/" +
                $teamSelected +
                "/customParts/" +
                $customPartSelected +
                "/sku",
            sku
        )
    }

    function updateImage(elm){
        let image = elm.target.value;
        setToDb(
            "organizations/" +
                $organizationSelectionForParts +
                "/teams/" +
                $teamSelected +
                "/customParts/" +
                $customPartSelected +
                "/image",
            image
        )
    }

    function getImageUrl(){
        let url = $organizations[$organizationSelectionForParts].teams[$teamSelected].customParts[$customPartSelected].image;
        if(url == null || url == "" || url == undefined || url == "none"){
            url = "https://static.vecteezy.com/system/resources/previews/000/365/820/original/question-mark-vector-icon.jpg";
        }
        return url;
    }
</script>

<button id="backToPartList" on:click={() => {
    customPartSelected.set("");
}}>Back to Part List</button>

<div id="list">
    <div class="item">
        <p>{decodeProductName($customPartSelected)}</p>
        <input type="text" id="nameChange" value={decodeProductName($customPartSelected)} on:change={(elm) => updateName(elm)}/>
    </div>
    <div class="item">
        <p>{$organizations[$organizationSelectionForParts].teams[$teamSelected].customParts[$customPartSelected].sku || "SKU Not Found"}</p>
        <input type="text" id="partNumber" value={$organizations[$organizationSelectionForParts].teams[$teamSelected].customParts[$customPartSelected].sku || "SKU Not Found"} on:change={(elm) => updateSku(elm)}/>
    </div>
    <div class="item">
        <img src={$organizations[$organizationSelectionForParts].teams[$teamSelected].customParts[$customPartSelected].image} alt="Custom Part"
        onerror="this.src='https://static.vecteezy.com/system/resources/previews/000/365/820/original/question-mark-vector-icon.jpg'"
        />
        <input type="url" value={getImageUrl()} on:change={(elm) => updateImage(elm)} />
    </div>
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
        width: 32vw;
        height: 32vw;
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