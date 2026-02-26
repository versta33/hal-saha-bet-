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
let auth;

function initFirebase() {
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        auth = firebase.auth();
        console.log('✅ Firebase başlatıldı');
    } else {
        console.log('⚠️ Firebase yüklenmedi, localStorage kullanılıyor');
    }
}

// Sayfa yüklendiğinde Firebase'i başlat
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFirebase);
} else {
    initFirebase();
}
