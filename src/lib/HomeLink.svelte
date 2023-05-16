<script>
    import { pageState } from "../db";
</script>

<button on:click={() => pageState.set("home")}>
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
    }
</style>