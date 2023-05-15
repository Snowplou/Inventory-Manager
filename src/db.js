// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, child, get, set } from "firebase/database";
import { writable } from "svelte/store";
import { getAuth, setPersistence, browserLocalPersistence, onAuthStateChanged } from "firebase/auth";

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
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);

export let authWritable = writable(auth);

// Run when auth state changes
onAuthStateChanged(auth, (user) => {
    authWritable.set(auth);
});

export let userId = writable()
export let userData = writable();

authWritable.subscribe((value) => {
    if(value == undefined) return;
    userId.set(value.currentUser?.uid)
})

userId.subscribe(async (value) => {
    if(value == undefined) return;
    userData.set(await getFromDb(`users/${value}`))
})

export async function getFromDb(path) {
    let value;
    await get(child(ref(db), path)).then((snapshot) => {
        value = snapshot.val()
    })
    return value;
}

export function setToDb(path, data) {
    set(ref(db, path), data);
}