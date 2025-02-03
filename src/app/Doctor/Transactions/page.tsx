"use client";
import DoctorNavigation from "../DoctorNavbar/page";
import { fetchMyAppointment } from "@/app/fetchData/Doctor/fetchAppointment";
import { useState, useEffect } from "react";
import { Dayjs } from "dayjs";

interface myAppointments {
  id?: string;
  Appointment_CreatedAt?: Dayjs | null;
  Appointment_Date?: Dayjs | null;
  Appointment_DoctorEmail?: string;
  Appointment_DoctorName?: string;
  Appointment_DoctorPNumber?: string;
  Appointment_DoctorUID?: string;
  Appointment_IsNewPatient?: string;
  Appointment_Location?: string;
  Appointment_PatientFName?: string;
  Appointment_PatientFullName?: string;
  Appointment_PatientPetAge?: {
    Month: number;
    Year: number;
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

export default function Transaction() {
  const [myAppointments, setMyAppointments] = useState<myAppointments[]>([]);

  useEffect(() => {
    const getMyAppointment = async () => {
      const myAppointments = await fetchMyAppointment();
      setMyAppointments(myAppointments);
    };
    getMyAppointment();
  }, []);

  return (
    <div>
      <div className="relative z-20">
        <DoctorNavigation />
      </div>
      <div className="flex mx-52 my-10 flex-col gap-8 z-10">
        <h1 className="font-bold font-montserrat text-4xl ">Transactions</h1>
        <div className="grid grid-cols-5 bg-white drop-shadow-lg h-fit rounded-2xl p-8 gap-5">
          <h1 className="col-span-3 font-montserrat text-3xl font-bold text-[#393939]">
            Pet
          </h1>
          <h1 className="font-montserrat text-3xl font-bold text-[#393939] justify-self-center">
            Price
          </h1>
          <h1 className="font-montserrat text-3xl font-bold text-[#393939] justify-self-center">
            Status
          </h1>
          <div className="w-full h-0.5 rounded-full bg-[#B1B1B1] col-span-5 flex flex-col" />
          {myAppointments.map((data) => {
            return (
              <div
                key={data?.id}
                className="grid grid-cols-5 col-span-5 items-center"
              >
                <div className="">
                  <h1>Image of {data?.Appointment_PatientPetName}</h1>
                </div>
                <div className="col-span-2 flex flex-col">
                  <p>Owner: {data?.Appointment_PatientFullName}</p>
                  <h1>{data?.Appointment_TypeOfAppointment}</h1>
                  <p>{data?.Appointment_PatientTypeOfPayment}</p>
                </div>
                <div className="justify-self-center">Appointment Price</div>
                <button type="button" className="justify-self-center">
                  {data?.Appointment_Status}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
