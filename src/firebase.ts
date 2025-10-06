// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// DÁN ĐỐI TƯỢNG firebaseConfig CỦA BẠN VÀO ĐÂY
const firebaseConfig = {
  apiKey: "AIzaSyD9hLoGagqOth6SC2eTXN1unqTS7S-MWgU",
  authDomain: "lop-hoc-vui-ve-2.firebaseapp.com",
  projectId: "lop-hoc-vui-ve-2",
  storageBucket: "lop-hoc-vui-ve-2.firebasestorage.app",
  messagingSenderId: "450616433377",
  appId: "1:450616433377:web:585573ed0e49171301f5a0"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);