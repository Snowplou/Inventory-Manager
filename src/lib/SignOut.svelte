<!-- Sign Out button floating on the top right of the screen -->
<script>
    import { auth } from "../db.js";

    function signOut() {
        auth.signOut();
        // Refresh the page
        location.reload();
    }
</script>

<button on:click={signOut}>Sign Out</button>

<style>
    button {
        position: absolute;
        top: 0;
        right: 0;
        background-color: #d4d4d4;
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

    button:hover {
        background-color: #bfbfbf;
        transition: background-color 0.25s ease-in-out;
    }
</style>