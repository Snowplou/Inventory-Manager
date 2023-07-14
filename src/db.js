// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, child, get, set } from "firebase/database";
import { writable } from "svelte/store";
import { getAuth, setPersistence, browserLocalPersistence, onAuthStateChanged } from "firebase/auth";
import { get as writeableGet } from "svelte/store";
import { compute_slots } from "svelte/internal";

// Load use model
let model;
await use.load().then(async val => {
    model = val;
    await embedSentence("a") // Warm up model
    await embedSentence("b") // Warm up model
})

export function sentenceDistance(dim1, dim2) {
    let distance = 0;
    for (let i = 0; i < dim1.length; i++) {
        distance += Math.pow(dim1[i] - dim2[i], 2);
    }
    return Math.sqrt(distance);
}

export async function embedSentence(sentence) {
    let embeddings = await model.embed([sentence]);
    let embeddingsDimensions = (await embeddings.array())[0]
    return embeddingsDimensions;
}

export async function embedSentences(sentences) {
    let embeddings = await model.embed(sentences);
    let embeddingsDimensions = await embeddings.array()
    return embeddingsDimensions;
}

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
    // userData.set(await getFromDb(`users/${value}`))
    // Update userData whenever the firebase `users/${userId}` changes
    onValue(ref(db, `users/${writeableGet(userId)}`), (snapshot) => {
        userData.set(snapshot.val());
        if (writeableGet(userData).organizations) {
            // for (let organization of writeableGet(userData).organizations) {
            //     onValue(ref(db, `organizations/${organization.name}`), (snapshot) => {
            //         organizations.update((organizations) => {
            //             organizations[organization.name] = snapshot.val();
            //             return organizations;
            //         })
            //     }
            //     )
            // }
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

function decodeProductName(name) {
    let decodedName = name;
    for (let i = 0; i < Object.keys(pathChanger).length; i++) {
        decodedName = decodedName.replaceAll(
            Object.values(pathChanger)[i],
            Object.keys(pathChanger)[i]
        );
    }
    return decodedName;
}

// Get product embeds
export let productEmbeds = writable([]);
export let customPartEmbeds = writable([]);
products.subscribe(async (val) => {
    // @ts-ignore
    if (!val.length) return;

    let productNames = [];
    // @ts-ignore
    for (let product of val) {
        productNames.push(product.name);
    }
    productEmbeds.set(await embedSentences(productNames))
})
teamSelected.subscribe(async (val) => {
    if (!val) return;

    let productNames = [];
    if (writeableGet(organizations)[writeableGet(organizationSelectionForParts)].teams[writeableGet(teamSelected)]) {
        if (writeableGet(organizations)[writeableGet(organizationSelectionForParts)].teams[writeableGet(teamSelected)].customParts) {
            for (let product of Object.keys(writeableGet(organizations)[writeableGet(organizationSelectionForParts)].teams[writeableGet(teamSelected)].customParts)) {
                productNames.push(decodeProductName(product));
            }
            customPartEmbeds.set(await embedSentences(productNames))
        }
    }
})

productEmbeds.subscribe(async (val) => {
    console.log("product: " + val.length)
})
customPartEmbeds.subscribe(async (val) => {
    console.log("custom: " + val.length)
})