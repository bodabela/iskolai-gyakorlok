// firebase-logger.js

// Ellenőrizzük, hogy a Firebase és a Firestore inicializálva van-e már.
// A feltételezés az, hogy a HTML fájlokban már szerepelnek a Firebase SDK betöltő szkriptek.
if (typeof firebase === 'undefined' || typeof firebase.firestore === 'undefined') {
    console.error("Firebase vagy Firestore nincs betöltve! Kérlek, győződj meg róla, hogy a Firebase szkriptek be vannak ágyazva a HTML fájlba.");
}

const db = firebase.firestore();

// Ideiglenes, beégetett email cím a naplózáshoz.
// Később ezt a regisztrációs rendszerből kapott email címre kell cserélni.
const HARDCODED_USER_EMAIL = "gyerek@teszt.hu";

/**
 * Esemény naplózása a Firestore 'user_events' kollekciójába.
 * Az események a beégetett email cím alatt lesznek csoportosítva.
 * @param {string} eventType Az esemény típusa (pl. 'TASK_ENTRY', 'GENERATE_TASK', 'CHECK_TASK').
 * @param {object} eventDetails Az eseményhez kapcsolódó részletes adatok.
 */
async function logEvent(eventType, eventDetails) {
    if (!db) {
        console.error("Firestore adatbázis nincs inicializálva. A naplózás nem lehetséges.");
        return;
    }

    try {
        await db.collection("user_events").add({
            userEmail: HARDCODED_USER_EMAIL,
            eventType: eventType,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            page: window.location.pathname, // Melyik oldalon történt az esemény
            details: eventDetails // Az esemény-specifikus adatok
        });
        console.log(`Esemény naplózva: ${eventType}`, eventDetails);
    } catch (error) {
        console.error("Hiba történt az esemény naplózása közben:", error);
    }
}

/**
 * Naplózza, amikor a gyerek belép egy feladat oldalra.
 * Ezt a függvényt minden feladatot tartalmazó HTML oldal betöltődésekor meg kell hívni.
 * @param {string} taskName A feladat vagy az oldal neve.
 */
function logTaskEntry(taskName) {
    logEvent('TASK_ENTRY', {
        taskName: taskName
    });
}

/**
 * Naplózza, amikor egy új feladatot generálnak.
 * @param {string} taskName A feladat neve (pl. "Római számok átírása").
 * @param {object} taskDetails A generált feladat részletei (pl. a számok, a helyes megoldás).
 */
function logNewTask(taskName, taskDetails) {
    logEvent('GENERATE_TASK', {
        taskName: taskName,
        taskData: taskDetails
    });
}

/**
 * Naplózza, amikor egy feladatot ellenőriznek.
 * @param {string} taskName A feladat neve.
 * @param {object} checkDetails Az ellenőrzés eredményének részletei (felhasználó válaszai, helyes-e).
 */
function logTaskCheck(taskName, checkDetails) {
    logEvent('CHECK_TASK', {
        taskName: taskName,
        checkData: checkDetails
    });
}