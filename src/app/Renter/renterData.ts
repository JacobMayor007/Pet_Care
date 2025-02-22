import { db } from "../firebase/config"
import { collection, getDocs, orderBy, query, where, onSnapshot } from "firebase/firestore"
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
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

const myRooms = async (userID: string)=>{
    try{
        
        const roomsRef = collection(db, "board");
        const q = query(roomsRef, where("Renter_UserID", "==", userID), orderBy("Renter_CreatedAt", "desc"));
        const roomSnap = await getDocs(q);

        const rooms = roomSnap.docs.map((doc)=>({
            id:doc.id,
            ...doc.data(),
        }));

        console.log(rooms);
        return rooms;

    }catch(error){
        console.error(error);
        return [];
    }
}

const myRoomsEmph = async (userID: string, roomStatus: string) =>{
   try{
    const id = userID;
    const status = roomStatus;

    const docRef = collection(db, "board")
    const q = query(docRef, where("Renter_UserID", "==", id), 
    where("Renter_RoomStatus", "==", status));

    const docSnap = await getDocs(q);

    const roomEmph = docSnap.docs.map((doc)=>({
        id:doc.id,
        ...doc.data(),
    }));
    
    
    return roomEmph;

   }catch(error){
    console.error(error);
    return [];
   }
}

const MyNotification = (userUID: string, callback: (notifications: Notification[]) => void) => {
    if (!userUID) {
      console.log("No doctor UID found.");
      return () => {}; 
    }
  
    const notificationsRef = collection(db, "notifications");
    const q = query(notificationsRef, where("receiverID", "==", userUID));
  
    // Real-time listener
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const myNotif: Notification[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data?.createdAt
            ? dayjs(data.createdAt.toDate()).fromNow() 
            : "Unknown time",
        };
      });
  
      callback(myNotif); // Send data to frontend
    });
  
    return unsubscribe; // Return the unsubscribe function for cleanup
  };


export {myRooms, myRoomsEmph, MyNotification}