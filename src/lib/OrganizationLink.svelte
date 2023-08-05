<script>
    import { pageState, animationTime } from "../db";

    import { fly } from "svelte/transition";

    function clicked(elm){
        pageState.set("organizations")
    }
</script>

<button on:click={(elm) => clicked(elm.target)}
    in:fly={{x: 200, duration: $animationTime}}
    out:fly={{x: 200, duration: $animationTime}}
    >
    Manage Organizations
</button>

<style>
    button {
        background-color: #007bff;
        transition: background-color 0.25s ease;
        height: 40vmin;
        width: 40vmin;
        border: none;
        color: white;
        padding: 15px 32px;
        text-align: center;
        text-decoration: none;
        font-size: 4vmin;
        margin: 1vmin;
        cursor: pointer;
        /* Center Text */
        display: flex;
        justify-content: center;
        align-items: center;
    }

    button:hover {
        background-color: #0069d9;
        transition: background-color 0.25s ease;
    }
</style>