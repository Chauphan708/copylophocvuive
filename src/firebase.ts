import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Dán firebaseConfig của bạn từ Bước 1 vào đây
const firebaseConfig = {
  apiKey: "AIzaSyDpsrsWGrZGzqQR592Bf3nBrSMBrW_Wpkk",
  authDomain: "lop-hoc-vui-ve.firebaseapp.com",
  projectId: "lop-hoc-vui-ve",
  storageBucket: "lop-hoc-vui-ve.firebasestorage.app",
  messagingSenderId: "673452796465",
  appId: "1:673452796465:web:69e68b4665669cc0f7c310"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo Cloud Firestore và export nó để sử dụng trong ứng dụng
export const db = getFirestore(app);