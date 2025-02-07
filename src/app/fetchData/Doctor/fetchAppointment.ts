import { db } from "@/app/firebase/config";
import { doc, getDoc, getDocs, collection, where, query, updateDoc, Timestamp } from "firebase/firestore";
import fetchUserData from "../fetchUserData";

interface Appointment {
  id?: string;
  Appointment_CreatedAt?: string;
  Appointment_Date?: Timestamp | string | null;
  Appointment_DoctorEmail?: string;
  Appointment_DoctorName?: string;
  Appointment_DoctorPNumber?: string;
  Appointment_IsNewPatient?: boolean;
  Appointment_Location?: string;
  Appointment_PatientFName?: string;
  Appointment_PatientFullName?: string;
  Appointment_PatientPetAge?: {
    Month?: number;
    Year?: number;
  };
  Appointment_PatientPetBP?: {
    Hg?: number;
    mm?: number;
  };
  Appointment_PatientPetBreed?: string;
  Appointment_PatientPetName?: string;
  Appointment_PatientTypeOfPayment?: string;
  Appointment_PatientUserUID?: string;
  Appointment_Status?: string;
  Appointment_TypeOfAppointment?: string;
}


const fetchAppointment = async () =>{
    try{
        const docRef = collection(db, "appointments");
        const querySnapshot = await getDocs(docRef);
        const appointments = querySnapshot.docs.map((doc)=>({
            id:doc.id,
            ...doc.data()
        }));

        console.log(appointments);
        return appointments;
    }catch(err){
      console.log(err);
      
        return [];
    }
}

const fetchMyAppointment = async () =>{
    const data = await fetchUserData();
    const email = data[0]?.User_Email;
    const userUID = data[0]?.User_UID;
    

    try{
        const docRef = collection(db, "appointments");
        const q = query(docRef, where("Appointment_DoctorEmail", "==", email), where("Appointment_DoctorUID", "==", userUID));
        const querySnapshot = await getDocs(q);
        const myAppointments = querySnapshot.docs.map((doc)=>({
            id:doc.id,
            ...doc.data()
        }));

        return myAppointments;
    }catch(err){
      console.log(err);

        return [];
    }
}

const myNewPatient = async (doctorUID: string, doctorEmail: string) => {


    try {
      const patientsRef = collection(db, "appointments");
      const q = query(
        patientsRef,
        where("Appointment_DoctorUID", "==", doctorUID),
        where("Appointment_DoctorEmail", "==", doctorEmail)
      );
      const querySnapshot = await getDocs(q);
  
      let newPatientCount = 0;
  
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.Appointment_PatientUserUID && data.Appointment_IsNewPatient === true) {
             newPatientCount++; 
        }
      });
      return newPatientCount;
    } catch (err) {
      console.log(err);
      return 0;
    }
  };

const myOldPatient = async (doctorUID:string, doctorEmail:string) =>{
    try {
        const patientsRef = collection(db, "appointments");
        const q = query(
          patientsRef,
          where("Appointment_DoctorUID", "==", doctorUID),
          where("Appointment_DoctorEmail", "==", doctorEmail)
        );
        const querySnapshot = await getDocs(q);
    
        let newPatientCount = 0;
    
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.Appointment_PatientUserUID && data.Appointment_IsNewPatient === false) {
               newPatientCount++; 
          }
        });
        return newPatientCount;
      } catch (err) {
        console.log(err);

        return 0;
      }
}

const fetchPatientDetails = async (appointment_ID:string): Promise <Appointment | null>  =>  {
  

  try{
    const docRef = doc(db, "appointments", appointment_ID);
    const docSnap = await getDoc(docRef);


    if (docSnap.exists()) {
      return {id: docSnap.id, ...docSnap.data() as Appointment}
    }else{
      return null
    }
   
  }catch(error){
    console.log(error);
    return null;
  }
}


// const fetchProductById = async (id: string) => {
//     try {
//       const docRef = doc(db, "products", id); // Replace "products" with your collection name
//       const docSnap = await getDoc(docRef);

//       console.log("Product: ", docSnap);

//       if (docSnap.exists()) {
//         // Spread all fields into the Product type and update state
//         const fetchedProduct = { id: docSnap.id, ...docSnap.data() } as Product;
//         setProduct(fetchedProduct);
//         if (typeof fetchedProduct.Seller_PaymentMethod === "string") {
//           // If the features are stored as a string, split by comma and space to get the payment methods
//           setTypeOfPaymentArray(
//             fetchedProduct.Seller_PaymentMethod.split(", ")
//           );
//         } else {
//           // Fallback if it's already an array or null
//           setTypeOfPaymentArray(fetchedProduct.Seller_PaymentMethod || null);
//         }
//       } else {
//         setProduct(null);
//       }
//     } catch (error) {
//       console.error("Error fetching product:", error);
//       setProduct(null);
//     }
//   };


const postApprovedAppointment = async (appointment_ID:string, time: string) =>{
  console.log("Appointment ID ", appointment_ID);
  

  try{
    if (!appointment_ID) {
      throw new Error("Invalid appointment ID");
    }

    const docRef = doc(db, "appointments", appointment_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const updated = await updateDoc(docRef, {
        Appointment_Status: "Approved",
        Appointment_Time: time,
      });
      return updated;
    } else {
      throw new Error("Document does not exist");
    }
    }
  catch(error){
    console.log(error);
    
  }

  // try{
  //   const docRef = doc(db, "notifications", notification_UID);
  //   const docSnap = await getDoc(docRef);

  //   if(docSnap.exists()){
  //     const update = {
  //       hide: true,
  //     }

  //     const updated = await updateDoc(docRef, update);
  //     return updated;
  //   }
  // }catch(error){
  //   console.error(error);
    
  // }
}


export default fetchAppointment;

export {fetchMyAppointment, myNewPatient, myOldPatient, fetchPatientDetails, postApprovedAppointment};