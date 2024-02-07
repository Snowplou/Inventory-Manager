// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, child, get, set } from "firebase/database";
import { writable } from "svelte/store";
import { getAuth, setPersistence, browserLocalPersistence, onAuthStateChanged, sendPasswordResetEmail } from "firebase/auth";
import { get as writeableGet } from "svelte/store";

// Determine if the device is touchscreen or has a touchpad/mouse
export let isTouchscreen = writable(false);

// The animation duration
export let animationTime = writable(1250);

window.addEventListener("touchstart", function onFirstTouch() {
    isTouchscreen.set(true);
    window.removeEventListener("touchstart", onFirstTouch, false);
}, false);

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

export function resetPassword(email) {
    sendPasswordResetEmail(auth, email)
        .then(() => {
            alert("If an account with that email exists, a password reset email has been sent.")
        }
        ).catch((error) => {
            console.log(error)
            alert("If an account with that email exists, a password reset email has been sent.")
        });
}

export let pageState = writable("home");

export let userId = writable()
export let userData = writable();
export let organizations = writable({});
export let organizationSelectionForParts = writable("");
export let pathChanger = {
    ".": "a1802s3na79",
    "#": "8sb28218ab2",
    "$": "ab19a7ba18a",
    "[": "auba189a9na1",
    "]": "aab2723na81n",
    "/": "au198amab19a"
};
export let emailChanger = {
    ".": "unahuh18ab1z",
    "@": "89236taban19",
}
export let teamSelected = writable("");
export let customPartSelected = writable("");
export let showAllParts = writable(false);

export let logs = writable({})
organizationSelectionForParts.subscribe((value) => {
    if(value == "") return;
    let currentOrg = value;
    onValue(ref(db, `logs/${value}`), (snapshot) => {
        if(writeableGet(organizationSelectionForParts) != currentOrg) return;
        logs.set(snapshot.val())
    }, (err) => {
        console.log(err)
    })
})

export let isConnected = writable(true);
// When the firebase connection state changes, update the connectionState store
onValue(ref(db, ".info/connected"), (snapshot) => {
    isConnected.set(snapshot.val());
});

export async function logEvent(organization, eventDetails) {
    let time = new Date().getTime();
    // Create a local time string. Include date, time, and timezone.
    let localTime = new Date().toLocaleString("en-US", { timeZoneName: "short" }).split(", ")
    let localTimeStr = localTime[0] + ", " + localTime[1]
    eventDetails.time = localTimeStr
    eventDetails.userEmail = writeableGet(userData).email
    eventDetails.userId = writeableGet(userId)
    eventDetails.organization = organization
    setToDb(`logs/${organization}/${time}`, eventDetails)
}

export let products = writable({});
(async () => {
    products.set(await getFromDb("products"));
})();

authWritable.subscribe((value) => {
    if (value == undefined) return;
    userId.set(value.currentUser?.uid)
})

userId.subscribe(async (value) => {
    if (value == undefined) return;
    onValue(ref(db, `users/${writeableGet(userId)}`), (snapshot) => {
        userData.set(snapshot.val());
        if (writeableGet(userData).organizations) {
            let orgsKeys = Object.keys(writeableGet(userData).organizations);
            for (let i = 0; i < orgsKeys.length; i++) {
                onValue(ref(db, `organizations/${orgsKeys[i]}`), (snapshot) => {
                    organizations.update((organizations) => {
                        organizations[orgsKeys[i]] = snapshot.val();
                        return organizations;
                    })
                })
            }
        }
    });
})

export async function getFromDb(path) {
    let value = {};
    await get(child(ref(db), path)).then((snapshot) => {
        value = snapshot.val()
    })
    return value;
}

export function setToDb(path, data) {
    set(ref(db, path), data);
}