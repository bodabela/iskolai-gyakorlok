// firebase-logger.js

// ===================================================================================
// === KÖZPONTI FIREBASE KONFIGURÁCIÓ ÉS INICIALIZÁLÁS ===
// ===================================================================================

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBejJmG-XUACzCNFq0N95dvRm6n7TRiXrw",
  authDomain: "iskolai-gyakorlok.firebaseapp.com",
  projectId: "iskolai-gyakorlok",
  storageBucket: "iskolai-gyakorlok.firebasestorage.app",
  messagingSenderId: "85023189432",
  appId: "1:85023189432:web:184ad29cb39b9b68b5074d"
};

// Adatbázis referencia - globális a modulon belül
let db;

/**
 * Inicializálja a Firebase kapcsolatot ÉS a logger adatbázis kapcsolatát.
 * Ezt az egyetlen függvényt kell meghívni minden oldalról, ahol naplózni szeretnénk.
 */
function initializeFirebaseAndLogger() {
    // Ellenőrizzük, hogy a 'firebase' objektum egyáltalán betöltődött-e.
    if (typeof firebase === 'undefined' || typeof firebase.initializeApp !== 'function') {
        console.warn("Firebase script nem töltődött be vagy nem található. A naplózási funkciók nem lesznek elérhetőek.");
        return; // Kilépünk a függvényből, hogy a többi script futhasson.
    }

    try {
        // Firebase app inicializálása a fenti, központi konfigurációval
        firebase.initializeApp(firebaseConfig);

        // Az adatbázis objektumot a sikeres app inicializálás után kérjük le.
        db = firebase.firestore();
        console.log("Firebase & Logger sikeresen inicializálva.");

        // Opcionális: Emulátor használata fejlesztés közben (csak localhost-on)
        if (window.location.hostname === 'localhost') {
            db.useEmulator('localhost', 8080);
            console.log("Csatlakozva a helyi Firestore emulátorhoz.");
        }

    } catch (error) {
        // Kezeli azt az esetet is, ha már inicializálva van
        if (error.code !== 'app/duplicate-app') {
            console.error("Hiba a Firebase & Logger inicializálása közben:", error);
        } else {
            // Ha az app már létezik, csak szerezzük be újra az adatbázis referenciát
            db = firebase.firestore();
        }
    }
}


// ===================================================================================
// === NAPLÓZÓ FÜGGVÉNYEK (VÁLTOZATLAN) ===
// ===================================================================================

// Ideiglenes, beégetett email cím a naplózáshoz.
const HARDCODED_USER_EMAIL = "gyerek@teszt.hu";

/**
 * Esemény naplózása a Firestore 'user_events' kollekciójába.
 * @param {string} eventType Az esemény típusa.
 * @param {object} eventDetails Az eseményhez kapcsolódó adatok.
 */
async function logEvent(eventType, eventDetails) {
    if (!db) {
        console.error("Adatbázis nincs inicializálva. A naplózás nem lehetséges. Hívd meg az initializeFirebaseAndLogger() függvényt az oldal betöltődésekor.");
        return;
    }

    try {
        await db.collection("user_events").add({
            userEmail: HARDCODED_USER_EMAIL,
            eventType: eventType,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            page: window.location.pathname,
            details: eventDetails
        });
        console.log(`Esemény naplózva: ${eventType}`, eventDetails);
    } catch (error) {
        console.error("Hiba történt az esemény naplózása közben:", error);
    }
}

/**
 * Naplózza, amikor a gyerek belép egy feladat oldalra.
 * @param {string} taskName A feladat vagy az oldal neve.
 */
function logTaskEntry(taskName) {
    logEvent('TASK_ENTRY', { taskName: taskName });
}

/**
 * Naplózza, amikor egy új feladatot generálnak.
 * @param {string} taskName A feladat neve.
 * @param {object} taskDetails A generált feladat részletei.
 */
function logNewTask(taskName, taskDetails) {
    logEvent('GENERATE_TASK', { taskName: taskName, taskData: taskDetails });
}

/**
 * Naplózza, amikor egy feladatot ellenőriznek.
 * @param {string} taskName A feladat neve.
 * @param {object} checkDetails Az ellenőrzés eredményének részletei.
 */
function logTaskCheck(taskName, checkDetails) {
    logEvent('CHECK_TASK', { taskName: taskName, checkData: checkDetails });
}