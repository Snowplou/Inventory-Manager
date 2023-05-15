<script>
    import {
        signInWithEmailAndPassword,
        createUserWithEmailAndPassword,
    } from "firebase/auth";
    import { auth, authWritable, userId, setToDb } from "../db";
    import { writable } from "svelte/store";

    function logIn() {
        let email = document.getElementById("email")["value"];
        let password = document.getElementById("password")["value"];

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                userId.set(userCredential.user.uid);
            })
            .catch((error) => {
                error = error.code;
                if (error == "auth/user-not-found") {
                    alert("User not found.");
                } else if (error == "auth/wrong-password") {
                    alert("Wrong password.");
                } else {
                    alert("An error has occured.");
                }
            });
        authWritable.set(auth);
    }

    function signUp() {
        let email = document.getElementById("email")["value"];
        let password = document.getElementById("password")["value"];

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                userId.set(userCredential.user.uid);
                setToDb(`users/${userCredential.user.uid}`, { email: email });
            })
            .catch((error) => {
                error = error.code;
                if (error == "auth/weak-password") {
                    alert("The password is too weak.");
                } else if (error == "auth/email-already-in-use") {
                    alert("This email is already in use.");
                } else {
                    alert("An error has occured.");
                }
            });
        authWritable.set(auth);
    }
</script>

<div id="mainPage">
    <p id="title">Sign In</p>
    <div id="inputsAndButtonsFlex">
        <div id="inputs">
            <input type="email" placeholder="Email" id="email" />
            <input type="password" placeholder="Password" id="password" />
        </div>
        <div id="buttons">
            <button on:click={logIn}>Log In</button>
            <button on:click={signUp}>Sign Up</button>
        </div>
    </div>
</div>

<style>
    #mainPage {
        display: absolute;
        margin-left: auto;
        margin-right: auto;
        width: 90vmin;
        height: 100vmin;
        background-color: #d4d4d4;
        border-radius: 10px;
        position: absolute;
        left: 50%;
        top: 0;
        transform: translateX(-50%) translateY(5vmin);
    }

    #title {
        font-size: 5vw;
        text-align: center;
        font-weight: bold;
        padding-top: 1vh;
        margin-bottom: 0;
    }

    input {
        display: block;
        margin-left: auto;
        margin-right: auto;
        width: 50vmin;
        height: 5vmin;
        border-radius: 10px;
        font-size: 3vw;
        text-align: center;
        margin-bottom: 10px;
    }

    button {
        display: block;
        margin-left: auto;
        margin-right: auto;
        width: 50vmin;
        height: 8vmin;
        border-radius: 10px;
        font-size: 4vmin;
        text-align: center;
        margin-bottom: 10px;
        /* Vertically align text */
        display: flex;
        justify-content: center;
        align-items: center;
    }

    #inputs {
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        height: 10vh;
    }

    #buttons {
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        margin: 5vw;
        height: 10vh;
    }

    #inputsAndButtonsFlex {
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        height: 100%;
    }
</style>
