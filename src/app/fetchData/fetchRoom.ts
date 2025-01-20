import { getDocs, collection } from "firebase/firestore";
import { db } from "../firebase/config";

const fetchRoom = async()=>{
    try{
        const roomRef = collection(db, "board");
        const querySnapshot = await getDocs(roomRef);

        const room = querySnapshot.docs.map((doc)=>({
            id: doc.id,
            ...doc.data(),
        }));

        return room;

    }catch(error){
        console.error("Fetching room has some error", error);
        return [];
    }
}

export default fetchRoom;