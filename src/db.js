// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, child, get, set } from "firebase/database";
import { writable } from "svelte/store";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCF98GdBXFKq1RpPKANelnvaGorZ4P0ZLc",
    authDomain: "inventory-manager-ab833.firebaseapp.com",
    projectId: "inventory-manager-ab833",
    storageBucket: "inventory-manager-ab833.appspot.com",
    messagingSenderId: "225163194502",
    appId: "1:225163194502:web:42b6de8e0f44f3fe4c6107",
    measurementId: "G-TMTFXYWCQG",
    databaseURL: "https://inventory-manager-ab833-default-rtdb.firebaseio.com",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

export let data = writable({});
let dbCallbacks = []
onValue(ref(db, "a"), (snapshot) => {
    data.set(snapshot.val());
    for (let i = 0; i < dbCallbacks.length; i++) {
        dbCallbacks[i]()
    }
});

export function addDbCallback(callback) {
    dbCallbacks.push(callback)
}

export function getFromDb(path) {
    get(child(ref(db), path)).then((snapshot) => {
        return snapshot.val()
    })
}

export function setToDb(path, data) {
    set(ref(db, path), data);
}

// Check if user is logged in
export function isLoggedIn() {
    return auth.currentUser != null;
}

// Log user in
export async function login(email, password) {
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            return userCredential
        })
        .catch((error) => {
            return error.code
        });
}

// Create user
export async function createUser(email, password) {
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            return userCredential
        })
        .catch((error) => {
            return error.code
        });
}

// Log user out
export async function logout() {
    auth.signOut().then(() => {
        return
    }).catch((error) => {
        return error.code
    });
}