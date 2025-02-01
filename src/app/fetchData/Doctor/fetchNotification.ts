import { collection, where, query, onSnapshot  } from "firebase/firestore";
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

const myNotification = (doctorUID: string, callback: (notifications: Notification[]) => void) => {
    if (!doctorUID) {
      console.log("No doctor UID found.");
      return () => {}; 
    }
  
    const notificationsRef = collection(db, "notifications");
    const q = query(notificationsRef, where("doctor_UID", "==", doctorUID));
  
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
  
  const unreadNotification = (doctorUID: string, callback: (notifications: Notification[]) => void) => {
    if (!doctorUID) {
        console.log("No doctor UID found.");
        return () => {}; 
      }
      
      
      const notificationsRef = collection(db, "notifications");
      const q = query(notificationsRef, where("doctor_UID", "==", doctorUID), where("status", "==", "unread"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const myNotif: Notification[] = querySnapshot.docs.map((doc)=>({
            id:doc.id,
            ...doc.data(),
        }))
    
        callback(myNotif); // Send data to frontend
      });
      console.log(unsubscribe);
      return unsubscribe;
      
      
    };

    // const readNotifications = async (doctor_UID:string) =>{
    //     try{
    //         const docRef = doc(db, "notifications")
    //         const readNotifications = await updateDoc(docRef, {
    //             "status" : "read",
    //         })
    //     }catch(error){
    //         console.log(error);
            
    //     }
    // }


export default myNotification;

export {unreadNotification};

// export {unreadNotification, readNotifications};