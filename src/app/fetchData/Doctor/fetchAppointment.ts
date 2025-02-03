import { db } from "@/app/firebase/config";
import { doc, getDoc, getDocs, collection, where, query } from "firebase/firestore";
import fetchUserData from "../fetchUserData";




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
        console.log("Error fetching appointments data", err);
        return [];
    }
}

const fetchMyAppointment = async () =>{
    const data = await fetchUserData();
    const email = data[0]?.User_Email;
    const userUID = data[0]?.User_UID;
    console.log(userUID);
    

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
      console.error("Error fetching new patients:", err);
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
        console.error("Error fetching old patients:", err);
        return 0;
      }
}

const fetchPatientDetails = async (appointment_ID:string) => {
  console.log("Appoinment ID in backend: ", appointment_ID);
  

  try{
    const docRef = doc(db, "appointments", appointment_ID);
    const docSnap = await getDoc(docRef);


    if (!docSnap.exists()) {
      console.log("No document found");
      return [];
    }

    const data = docSnap.data();
    console.log("Fetched Document Data:", data); // Debugging

    // Ensure appointments is an array, otherwise return full document
    return Array.isArray(data?.appointments) ? data.appointments : [data];
   
  }catch(error){
    console.error(error);
    return [];
  }
}

export default fetchAppointment;

export {fetchMyAppointment, myNewPatient, myOldPatient, fetchPatientDetails};