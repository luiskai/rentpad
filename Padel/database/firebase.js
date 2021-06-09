import firebase from "firebase";
var firebaseConfig = {
  apiKey: "AIzaSyCVPJWbbTNBfXyq7H4GpR00hU2kW39xq-U",
  authDomain: "rentpad.firebaseapp.com",
  databaseURL: "https://rentpad-default-rtdb.firebaseio.com",
  projectId: "rentpad",
  storageBucket: "rentpad.appspot.com",
  messagingSenderId: "144072951000",
  appId: "1:144072951000:web:c63ace8db655caacef03ad",
  measurementId: "G-JZ7HK4EG1S",
};
// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
export default {
  firebase,
};
