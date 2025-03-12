// import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
// import { db } from "../firebase/config";

// // const petToMatch = async()=>{
// //     try{
// //         const docRef = collection(db, "pet-to-match");
// //         const q = query(docRef, where("isRejected", "==", null), 
// //         where("isHeart", "==", null), 
// //         where("isFavorite", "==", null))
        
// //         const unsubscribe = onSnapshot(q, (querySnapshot)=>{
// //           return querySnapshot.docs.map((doc)=>({
// //                 id:doc.id,
// //                 ...doc.data()
// //             }))
// //         });

// //         return unsubscribe;
        
        

// //         // const randomizedData = data[Math.floor(Math.random()*data.length)]
// //         // return randomizedData;

// //     }catch{
// //         return null
// //     }
// // }

// export {petToMatch}