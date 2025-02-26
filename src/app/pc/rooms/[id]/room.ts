import { collection, getDoc, getDocs, doc, Timestamp, where, query } from "firebase/firestore"
import { db } from "@/app/firebase/config"
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime)

interface BoardDetails {
  boardId?: string;
  BC_BoarderUID?: string;
  BC_BoarderFullName?: string;
  BC_BoarderEmail?: string;
  BC_BoarderBoardedAt?: Timestamp | string | null;
  BC_BoarderCheckInTime?: Timestamp | string | null;
  BC_BoarderCheckOutTime?: Timestamp | string | null;
  BC_BoarderCheckInDate?: Timestamp | string | null;
  BC_BoarderCheckOutDate?: Timestamp | string | null;
  BC_BoarderChoiceFeature?: [
    {
      label?: string;
      name?: string;
      value?: number;
    }
  ];
  BC_BoarderDays?: number;
  BC_BoarderDietaryRestrictions?: string;
  BC_BoarderGuest?: string;
  BC_BoarderStatus?: string;
  BC_BoarderTotalPrice?:number;
  BC_BoarderUpdated?: Timestamp | string | null;
  BC_BoarderTypeRoom?: string;
  BC_RenterRoomID?: string;
  BC_RenterFullName?: string;
  BC_RenterUID?: string;
  BC_RenterRoomName?: string;
  BC_RenterPrice?: string;
  BC_RenterLocation?: string;
  BC_RenterEmail?: string;
}


const fetchBookedDetails = async (room_ID: string): Promise<BoardDetails | null> => {
    try{
        const docRef = doc(db, "boarders", room_ID);
        const docSnap = await getDoc(docRef)

        return docSnap ? ({boardId:docSnap.id, ...docSnap.data() as BoardDetails} ) :  null

    }catch(error){
        console.error(error);
        return null;
    }
}

const fetchMyBooked = async(userID: string) =>{
    try{
        const docRef = collection(db, "boarders");
        const q = query(docRef, where("BC_BoarderUID", "==", userID));
        const docSnap = await getDocs(q);

        const result =  docSnap.docs.map((doc)=>({
            id:doc.id,
            ...doc.data(),
        }));

        return result;

    }catch(error){
        console.error(error);
        return [];
    }
}


export {fetchBookedDetails, fetchMyBooked}