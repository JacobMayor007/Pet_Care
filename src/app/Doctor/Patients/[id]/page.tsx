"use client";
import React, { useState, useEffect } from "react";
import { fetchPatientDetails } from "@/app/fetchData/Doctor/fetchAppointment";
import isAuthenticate from "@/app/fetchData/User/isAuthenticate";
import { useRouter } from "next/navigation";
import DoctorNavigation from "../../DoctorNavbar/page";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

interface DetailsProps {
  params: Promise<{ id: string }>;
}

interface Appointment {
  id?: string;
  Appointment_CreatedAt?: string;
  Appointment_Date?: string;
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

// interface AppointmentHistory{

// }

export default function PatientDetails({ params }: DetailsProps) {
  const { id } = React.use(params);
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>(
    []
  );
  const router = useRouter();

  useEffect(() => {
    const checkAuthentication = async () => {
      const login = await isAuthenticate();
      if (!login) {
        router.push("/Login"); // Redirect if not logged in
      }
    };

    checkAuthentication();
  }, [router]);

  useEffect(() => {
    const getMyAppointments = async (id: string) => {
      console.log("Appointment_ID", id);

      try {
        const pendingAppointment = await fetchPatientDetails(id);
        setPendingAppointments(pendingAppointment || []);
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
        setPendingAppointments([]);
      }
    };

    getMyAppointments(id);
  }, [id]);

  console.log(pendingAppointments);

  return (
    <div className="h-screen">
      <div className="relative z-20">
        <DoctorNavigation />
      </div>
      <div className="z-10 grid grid-cols-12 mx-52 my-12">
        <a href="" className="col-span-12 flex flex-row gap-4 items-center">
          <FontAwesomeIcon icon={faArrowLeft} className="text-3xl" />
          <h1 className="font-montserrat text-[#393939] font-bold text-4xl ">
            Patient Details
          </h1>
        </a>
        <div className="h-fit mt-8 col-span-4">
          {pendingAppointments.map((data, index) => {
            return (
              <div key={index} className="flex flex-col gap-6">
                <div className="border-[1px] border-[#C3C3C3] px-5 py-6">
                  <div className="flex flex-col items-center gap-2 mb-4">
                    <div className="text-xs font-montserrat font-bold text-[#393939] h-24 w-24 rounded-full bg-white drop-shadow-md flex items-center justify-center">
                      Image of {data?.Appointment_PatientPetName}
                    </div>
                    <h1 className="font-montserrat font-bold text-xl">
                      {data?.Appointment_PatientPetName}
                    </h1>
                    <p className="font-hind text-sm text-[#767676]">
                      Owner: {data?.Appointment_PatientFullName}
                    </p>
                    <p className="font-hind font-bold text-sm text-[#006B95]">
                      Patient Age:{" "}
                      <span>
                        {data?.Appointment_PatientPetAge?.Year === undefined ||
                        data?.Appointment_PatientPetAge?.Year === 0
                          ? ""
                          : data?.Appointment_PatientPetAge?.Year > 1
                          ? `${data.Appointment_PatientPetAge.Year} years,`
                          : `${data.Appointment_PatientPetAge.Year} year,`}{" "}
                      </span>
                    </p>
                  </div>
                  {data?.Appointment_Status === "isPending" ? (
                    <div className="grid grid-cols-2 gap-2 w-full  ">
                      <button
                        type="button"
                        className="h-fit bg-[#006B95] text-white py-3 rounded-lg font-hind font-medium"
                      >
                        Finalize ?
                      </button>
                      <button
                        type="button"
                        className="h-fit bg-[#006B95] text-white py-3 rounded-lg font-hind font-medium "
                      >
                        Reject ?
                      </button>
                    </div>
                  ) : (
                    <button className="h-fit bg-[#006B95] text-white py-3 rounded-lg font-hind font-medium w-full">
                      Send Message
                    </button>
                  )}
                </div>
                <div className="border-[1px] border-[#C3C3C3] p-4">
                  <div className="flex flex-col gap-7">
                    <h1>Patient Information</h1>
                    <div className="w-full border-[#B1B1B1] border-[1px]" />
                    <div className="grid grid-cols-4"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="col-span-8 mt-8"></div>
      </div>
    </div>
  );
}
