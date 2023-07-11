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

        
        document.getElementById("name").innerHTML = decodeProductName(name);
        customPartSelected.set(name);
    }
</script>

<button id="backToPartList" on:click={() => {
    customPartSelected.set("");
}}>Back to Part List</button>

<div>
    <p id="name">{decodeProductName($customPartSelected)}</p>
    <input type="text" id="nameChange" value={decodeProductName($customPartSelected)} on:change={(elm) => updateName(elm)}/>

    <p>The ability to edit part number (SKU) and image url will be added soon.</p>
</div>

<style>
    div {
        position: absolute;
        top: 14.5vh;
        left: 10vw;
        width: 80vw;
        height: 80vh;
        background-color: #007bff;
        border-radius: 10px;
    }

    #nameChange {
        text-align: center;
        width: 50vw;
        scale: 1.5;
        border: none;
        border-radius: 10px;
    }

    #name {
        background-color: #007bff;
        border: none;
        width: 95%;
        margin-top: 1vh;
        margin-bottom: 2vh;
        margin-left: 0;
        margin-right: 0;
        text-align: center;
        font-size: 150%;
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