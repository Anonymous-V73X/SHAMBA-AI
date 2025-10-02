// Firebase Configuration using traditional approach
const firebaseConfig = {
  apiKey: "AIzaSyDeRCU5QIApRw3bJYXjXpeZX4GCGo6Gp0o",
  authDomain: "cropwise-22d6d.firebaseapp.com",
  projectId: "cropwise-22d6d",
  storageBucket: "cropwise-22d6d.firebasestorage.app",
  messagingSenderId: "479669726465",
  appId: "1:479669726465:web:5e4ea3d29c83138b88bf00",
  measurementId: "G-7HJFYRN363",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Database
const auth = firebase.auth();
const database = firebase.database();

// Make them available globally
window.auth = auth;
window.database = database;
