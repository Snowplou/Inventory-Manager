<script>
    import { login, createUser } from "../db";

    async function logIn() {
        let email = document.getElementById("email")["value"];
        let password = document.getElementById("password")["value"];
        let passwordConfirm = document.getElementById("confirmPassword")["value"];

        if (password == passwordConfirm) {
            let result = await login(email, password);
            console.log(result);
        } else {
            alert("The passwords must match.");
        }
    }

    async function signUp() {
        let email = document.getElementById("email")["value"];
        let password = document.getElementById("password")["value"];
        let passwordConfirm = document.getElementById("confirmPassword")["value"];

        if (password == passwordConfirm) {
            let result = await createUser(email, password);
        } else {
            alert("The passwords must match.");
        }
    }
</script>

<div id="mainPage">
    <p id="title">Sign In</p>
    <div id="inputs">
        <input type="email" placeholder="Email" id="email" />
        <input type="password" placeholder="Password" id="password" />
        <input
            type="password"
            placeholder="Confirm Password"
            id="confirmPassword"
        />
    </div>
    <div id="buttons">
        <button on:click={logIn}>Log In</button>
        <button on:click={signUp}>Sign Up</button>
    </div>
</div>

<style>
    #mainPage {
        display: block;
        margin-left: auto;
        margin-right: auto;
        width: 75vw;
        height: 75vh;
        background-color: #d4d4d4;
        border-radius: 10px;
        margin-top: -10vh;
    }

    #title {
        font-size: 5vw;
        text-align: center;
        font-weight: bold;
    }

    input {
        display: block;
        margin-left: auto;
        margin-right: auto;
        width: 50vw;
        height: 5vh;
        border-radius: 10px;
        margin-top: 5vh;
        font-size: 4vw;
        text-align: center;
    }

    button {
        display: block;
        margin-left: auto;
        margin-right: auto;
        width: 50vw;
        height: 5vh;
        border-radius: 10px;
        margin-top: 5vh;
        font-size: 4vh;
        text-align: center;
        padding-top: 0vh;
    }

    #inputs{
        display: flex;
        flex-direction: column;
    }

    #buttons{
        display: flex;
        flex-direction: column;
    }
</style>
