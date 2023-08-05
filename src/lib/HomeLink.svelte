<script>
    import { pageState, animationTime } from "../db";
    import { fade, fly } from "svelte/transition";
    import { flip } from "svelte/animate";

</script>

<button on:click={() => pageState.set("home")}
    in:fly={{x: -100, duration: $animationTime}}
    out:fly={{x: -100, duration: $animationTime}}
    >
    Home
</button>

<style>
    button {
        position: absolute;
        top: 0;
        left: 0;
        background-color: #d4d4d4;
        border-radius: 10px;
        margin-top: 1vh;
        margin-left: 1vw;
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