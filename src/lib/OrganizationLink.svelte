<script>
    import { pageState } from "../db";

    function clicked(elm){
        // pageState.set("organizations")

        // Translate element down
        let amount = 0;
        let interval = setInterval(() => {
            elm.style.transform = `translateY(${amount}vh)`;
            amount++;
            if(amount >= 75){
                // Delete elm
                elm.remove();
                clearInterval(interval)
            }
        }, 10);
        
    }
</script>

<button on:click={(elm) => clicked(elm.target)}>
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