<script>
    import {
        signInWithEmailAndPassword,
        createUserWithEmailAndPassword,
    } from "firebase/auth";
    import { auth, authWritable, userId, setToDb, emailChanger, resetPassword } from "../db";
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
                } else if(error == "auth/too-many-requests") {
                    alert("Too many attempts. Try again in a few minutes.");
                } else {
                    console.log(error);
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
                setToDb(`users/${userCredential.user.uid}`, {
                    email: email,
                });
                let newEmail = email;
                for (let i = 0; i < Object.keys(emailChanger).length; i++) {
                    newEmail = newEmail.replaceAll(
                        Object.keys(emailChanger)[i],
                        Object.values(emailChanger)[i]
                    );
                }
                setToDb(`emailToId/${newEmail}`, $userId)
                authWritable.set(auth);
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
    }

    function forgotPassword(){
        let email = prompt("What is the email of the account you forgot the password for?");
        if(email != "" && email != null){
            resetPassword(email);
        }
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
        <button on:click={() => forgotPassword()}>Forgot Password</button>
    </div>
</div>

<style>
    #mainPage {
        position: absolute;
        left: 10vw;
        top: 5vh;
        width: 80vw;
        height: 90vh;
        background-color: #d4d4d4;
        border-radius: 10px;
        margin-bottom: 0;
    }

    #title {
        position: absolute;
        width: 100%;
        left: 0;
        top: 4vh;
        margin: 0;
        font-size: 10vmin;
        font-weight: bold;
    }

    input {
        display: block;
        margin-left: auto;
        margin-right: auto;
        width: 50vmin;
        height: 5vmin;
        border-radius: 10px;
        font-size: 3vmin;
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
        position: absolute;
        left: 0;
        top: 14vh;
        width: 100%;
        height: 76vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
</style>
