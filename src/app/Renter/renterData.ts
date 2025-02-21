import { db } from "../firebase/config"
import { collection, getDocs, orderBy, query, where } from "firebase/firestore"


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

export {myRooms, myRoomsEmph}