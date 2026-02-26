// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBhO3I3WCA4wGWjb46UQRoTlO7USikV0KE",
    authDomain: "futbol-bahis-2f82d.firebaseapp.com",
    projectId: "futbol-bahis-2f82d",
    storageBucket: "futbol-bahis-2f82d.firebasestorage.app",
    messagingSenderId: "916786631432",
    appId: "1:916786631432:web:74b8cf4b360738f2b2d2bd",
    measurementId: "G-32SDXFMZXD"
};

// Firebase'i başlat
let db;

function initFirebase() {
    try {
        if (typeof firebase !== 'undefined' && !firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            db = firebase.firestore();
            console.log('✅ Firebase başlatıldı');
            return true;
        } else if (firebase.apps.length > 0) {
            db = firebase.firestore();
            console.log('✅ Firebase zaten başlatılmış');
            return true;
        }
    } catch (error) {
        console.error('❌ Firebase başlatma hatası:', error);
        return false;
    }
    return false;
}

// Sayfa yüklendiğinde Firebase'i başlat
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFirebase);
} else {
    initFirebase();
}
