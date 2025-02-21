import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

interface Notification {
    createdAt?: string;
    productID?: string;
    message?: string;
    sender?: string;
    receiver?: string;
    status?: string;
    open?: boolean;
    title?: string;
    type?: string;
    hide?: boolean;
  }

const notifications = (sellerUID: string, callback: (notifications: Notification[]) => void) => {
  if (!sellerUID) {
    console.log("No Seller UID found.");
    return () => {}; 
  }else{
    console.log("Backend: ", sellerUID);
    
  }

  const notificationsRef = collection(db, "notifications");
  const q = query(notificationsRef, where("receiverID", "==", sellerUID));

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

  return unsubscribe; // Return unsubscribe function
};

export { notifications };
