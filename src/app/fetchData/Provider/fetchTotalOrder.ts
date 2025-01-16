import { getDocs, query, where,collection } from "firebase/firestore";
import { db } from "@/app/firebase/config";

type id = string;

const totalOrder = async(id: id)=>{
    try{
        const orderRef = collection(db, "Orders");
        const totalOrderQuery = query(orderRef, where("OC_SellerID", "==", id))
        const totalOrderSnapshot = await getDocs(totalOrderQuery);

        const totalOrders = totalOrderSnapshot.docs.map((doc)=>({
            id:doc.id,
            ...doc.data(),
        }))
        console.log("Successfully Fetched the Total Orders", totalOrders)
        return totalOrders
    }catch(error){
        console.error("Error Fetching on Total Order", error)
    }
}




export {totalOrder}