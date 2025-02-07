import { collection, where, query, onSnapshot, getDocs, updateDoc } from "firebase/firestore";
// import fetchUserData from "../fetchUserData"
import { db } from "@/app/firebase/config";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
dayjs.extend(relativeTime)
interface Notification {
    id?: string;
    createdAt?: string;
    message?: string;
    doctor_UID?: string;
    notif_userUID?: string;
    status?: string;
    title?: string;
    type?: string;
  }

const MyNotification = (userUID: string, callback: (notifications: Notification[]) => void) => {
    if (!userUID) {
      console.log("No doctor UID found.");
      return () => {}; 
    }
  
    const notificationsRef = collection(db, "notifications");
    const q = query(notificationsRef, where("receiver", "==", userUID));
  
    // Real-time listener
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const myNotif: Notification[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data?.createdAt
            ? dayjs(data.createdAt.toDate()).fromNow() // Convert timestamp to "time ago"
            : "Unknown time",
        };
      });
  
      callback(myNotif); // Send data to frontend
    });
  
    return unsubscribe; // Return the unsubscribe function for cleanup
  };


  const UnopenNotification = (userUID: string, callback: (notifications: Notification[]) => void) => {
    if (!userUID) {
      console.log("No doctor UID found.");
      return () => {}; 
    }
  
    const notificationsRef = collection(db, "notifications");
    const q = query(notificationsRef, where("receiver", "==", userUID), where("open", "==", false));
  
    // Real-time listener
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
     const myNotif: Notification[] = querySnapshot.docs.map((doc)=>({
        id:doc.id,
        ...doc.data(),
     }))
      
      callback(myNotif); // Send data to frontend
    });
  
    return unsubscribe; // Return the unsubscribe function for cleanup
  };


  const openNotification = async (userUID:string) => {
    try{
        const docRef = collection(db, "notifications")
        const q = query(docRef, where("open", "!=", null), where("receiver", "==", userUID));
        const querySnapshot = await getDocs(q);

        const updated = querySnapshot.docs.map(async (doc)=>{
            const docRef = doc.ref;

            await updateDoc(docRef, {
                ["open"]: true,
            })
        })

        return updated;
    }catch(error){
        console.log(error);
        return [];
    }


  }

export default MyNotification;
export {UnopenNotification, openNotification};