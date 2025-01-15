"use client";

import { useEffect, useState } from "react";
import DoctorNavigation from "./DoctorNavbar/page";
import fetchUserData from "../fetchData/fetchUserData";

export default function Doctor() {
  const [fullName, setFullName] = useState<string | null>("");

  useEffect(() => {
    const getUserData = async () => {
      try {
        const data = await fetchUserData();
        const fullName = data
          .map((data) => `${data?.User_FName} ${data?.User_LName}`)
          .join(",");
        console.log(fullName);
        setFullName(fullName);
        console.log("User Data: ", data);
      } catch (error) {
        console.error("Error on fetching UserData", error);
      }
    };
    getUserData();
  }, []);

  return (
    <div className="">
      <DoctorNavigation />
      <h1 className="">Hello Dr. {fullName}</h1>
    </div>
  );
}
