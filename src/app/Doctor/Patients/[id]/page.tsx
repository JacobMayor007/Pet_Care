"use client";
import React, { useState, useEffect } from "react";
import { fetchPatientDetails } from "@/app/fetchData/Doctor/fetchAppointment";
import { DatePicker, Modal, TimePicker } from "antd";
import isAuthenticate from "@/app/fetchData/User/isAuthenticate";
import { useRouter } from "next/navigation";
import DoctorNavigation from "../../DoctorNavbar/page";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import "@ant-design/v5-patch-for-react-19";
import dayjs, { Dayjs } from "dayjs";
import * as Appoinment from "@/app/fetchData/Doctor/fetchAppointment";
import {
  addDoc,
  collection,
  DocumentData,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/app/firebase/config";
import fetchUserData from "@/app/fetchData/fetchUserData";

interface DetailsProps {
  params: Promise<{ id: string }>;
}

interface Appointment {
  id?: string;
  Appointment_CreatedAt?: string;
  Appointment_Date?: Dayjs | null;
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
  const now = dayjs();
  const [pendingAppointments, setPendingAppointments] =
    useState<Appointment | null>(null);
  const router = useRouter();
  const [changeDate, setChangeDate] = useState(false);
  const [userData, setUserData] = useState<DocumentData[]>([]);
  const [accept, setAccept] = useState(false);
  const [reject, setReject] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    const checkAuthentication = async () => {
      const login = await isAuthenticate();
      if (!login) {
        router.push("/Login"); // Redirect if not logged in
      }
    };

    checkAuthentication();
  }, [router]);

  useEffect(() => {});

  useEffect(() => {
    const getUserData = async () => {
      const fetchedUserData = await fetchUserData();
      setUserData(fetchedUserData);
    };
    getUserData();
  }, []);

  useEffect(() => {
    const getMyAppointments = async (id: string) => {
      console.log("Appointment_ID", id);

      try {
        const pendingAppointment = await fetchPatientDetails(id);

        setPendingAppointments({
          ...pendingAppointment,
          Appointment_Date: pendingAppointment?.Appointment_Date
            ? dayjs((pendingAppointment.Appointment_Date as Timestamp).toDate())
            : null,
        });
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
        setPendingAppointments(null);
      }
    };

    getMyAppointments(id);
  }, [id]);

  const notifyDate = async () => {
    try {
      const doctorUID = userData[0]?.User_UID;
      const fName = userData[0]?.User_FName;
      const lName = userData[0]?.User_LName;
      const fullName = `${fName} ${lName}`;
      const docRef = collection(db, "notifications");
      const date =
        pendingAppointments?.Appointment_Date?.format("MMMM DD, YYYY");
      const patient = pendingAppointments?.Appointment_PatientUserUID;
      const patient_FName = pendingAppointments?.Appointment_PatientFName;
      console.log(id);

      await addDoc(docRef, {
        appointment_ID: id,
        sender: doctorUID,
        sender_FName: fName,
        receiver_FName: patient_FName,
        receiver: patient,
        title: newDate
          ? `Change schedule from Dr. ${doctorUID} to ${patient}`
          : `Approved Appointment Request from ${patient} to Dr. ${doctorUID}`,
        message: newDate
          ? `Dr. ${fullName} change your schedule on ${newDate} ${time}`
          : `Dr. ${fullName} approved your appointment on ${date} ${time}`,
        type: newDate ? "Change Appointment" : "Approved Appointment",
        date: newDate ? newDate : date,
        time: time,
        createdAt: Timestamp.now(),
        hide: false,
        open: false,
        status: "unread",
        isApproved: true,
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="h-full pb-2">
      <div className="relative z-20">
        <DoctorNavigation />
      </div>
      <div className="z-10 grid grid-cols-12 mx-52 my-12 ">
        <a href="" className="col-span-12 flex flex-row gap-4 items-center">
          <FontAwesomeIcon icon={faArrowLeft} className="text-3xl" />
          <h1 className="font-montserrat text-[#393939] font-bold text-4xl ">
            Patient Details
          </h1>
        </a>
        <div className="h-fit mt-8 col-span-4">
          <div className="flex flex-col gap-6">
            <div className="border-[1px] border-[#C3C3C3] px-5 py-6 rounded-xl">
              <div className="flex flex-col items-center gap-2 mb-4">
                <div className="text-xs text-center font-montserrat font-bold text-[#393939] h-24 w-24 rounded-full bg-white drop-shadow-md flex items-center justify-center">
                  Image of {pendingAppointments?.Appointment_PatientPetName}
                </div>
                <h1 className="font-montserrat font-bold text-xl">
                  {pendingAppointments?.Appointment_PatientPetName}
                </h1>
                <p className="font-hind text-sm text-[#767676]">
                  Owner: {pendingAppointments?.Appointment_PatientFullName}
                </p>
                <p className="font-hind font-bold text-sm text-[#006B95]">
                  Patient Age:{" "}
                  <span>
                    {pendingAppointments?.Appointment_PatientPetAge?.Year ===
                      undefined ||
                    pendingAppointments?.Appointment_PatientPetAge?.Year === 0
                      ? ""
                      : pendingAppointments?.Appointment_PatientPetAge?.Year > 1
                      ? `${pendingAppointments?.Appointment_PatientPetAge.Year} years,`
                      : `${pendingAppointments?.Appointment_PatientPetAge.Year} year,`}{" "}
                  </span>
                </p>
              </div>
              {pendingAppointments?.Appointment_Status === "isPending" ? (
                <div className="grid grid-cols-2 gap-2 w-full  ">
                  <button
                    type="button"
                    className="h-fit bg-[#61C4EB] text-white py-3 rounded-lg font-hind font-medium"
                    onClick={() => setAccept(true)}
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => setReject(true)}
                    className="h-fit bg-red-400 text-white py-3 rounded-lg font-hind font-medium "
                  >
                    Reject
                  </button>
                </div>
              ) : (
                <button className="h-fit bg-[#006B95] text-white py-3 rounded-lg font-hind font-medium w-full">
                  Send Message
                </button>
              )}
            </div>
            <Modal
              open={accept}
              onCancel={() => setAccept(false)}
              centered={true}
              onClose={() => setAccept(false)}
              onOk={() => {
                notifyDate();
                setAccept(false);
                Appoinment.postApprovedAppointment(id || "", time);
                // window.location.reload();
              }}
            >
              <h1 className="font-montserrat text-[#393939] font-medium">
                What time of schedule you want the patient to appoint on{" "}
                {pendingAppointments?.Appointment_Date?.format("MMMM DD, YYYY")}
                ?{" "}
                <span
                  className="italic text-[#4ABEC5] cursor-pointer pb-3 bg-left-bottom bg-no-repeat bg-gradient-to-r from-[#4ABEC5] to-[#4ABEC5] bg-[length:0%_3px] hover:bg-[length:100%_3px] ease-in-out duration-300 transform"
                  onClick={() => {
                    setChangeDate(true);
                    setAccept(false);
                  }}
                >
                  Click here if you want to change the date.
                </span>
              </h1>
              <div className="flex flex-row gap-2 my-4 items-center">
                <label
                  htmlFor="TimeAppoint"
                  className="font-montserrat font-medium"
                >
                  Time:
                </label>
                <TimePicker
                  size="middle"
                  format={"hh:mm A"}
                  use12Hours
                  className="font-montserrat font-medium"
                  onChange={(time: Dayjs | null) =>
                    setTime(time ? time.format("hh:mm A") : "")
                  }
                />
              </div>
            </Modal>
            <Modal
              open={reject}
              onCancel={() => setReject(false)}
              onClose={() => setReject(false)}
              onOk={() => {
                setReject(false);
              }}
              centered
            >
              State the reason why you want to cancel?
            </Modal>{" "}
            <Modal
              open={changeDate}
              onCancel={() => setChangeDate(false)}
              onClose={() => setChangeDate(false)}
              onOk={() => {
                notifyDate();
                setChangeDate(false);
              }}
              centered
            >
              <h1 className="font-montserrat font-medium italic">
                Change date for patient appointment.
              </h1>
              <div className="grid grid-cols-2 gap-3 my-4 items-center justify-self-center">
                <label
                  htmlFor="TimeAppoint"
                  className="font-montserrat font-medium"
                >
                  Date:
                </label>
                <DatePicker
                  defaultValue={now}
                  size="middle"
                  use12Hours
                  onChange={(date: Dayjs | null) => {
                    setNewDate(date ? date.format("MMMM DD, YYYY") : "");
                  }}
                  className="font-montserrat font-medium"
                />
                <label
                  htmlFor="TimeAppoint"
                  className="font-montserrat font-medium"
                >
                  Time:
                </label>
                <TimePicker
                  defaultValue={now}
                  size="middle"
                  use12Hours
                  format={"hh:mm A"}
                  className="font-montserrat font-medium"
                  onChange={(time: Dayjs | null) =>
                    setTime(time ? time.format("hh:mm A") : "")
                  }
                />
              </div>
            </Modal>
            <div className="border-[1px] border-[#C3C3C3] p-4 rounded-xl">
              <div
                className={
                  pendingAppointments?.Appointment_Status === "Approved"
                    ? `flex flex-col gap-7`
                    : `hidden`
                }
              >
                <h1>Patient Information</h1>
                <div className="w-full border-[#B1B1B1] border-[1px]" />
                <div className="grid grid-cols-5 gap-2">
                  <label
                    htmlFor="speciesID"
                    className="font-hind text-base text-[#797979] col-span-2"
                  >
                    Species:
                  </label>
                  <input
                    type="text"
                    name="speci"
                    id="speciesID"
                    className="col-span-3 border-b-[1px] border-[#C3C3C3] outline-none text-center"
                  />
                  <label
                    htmlFor="sexID"
                    className="font-hind text-base text-[#797979] col-span-2"
                  >
                    Sex:
                  </label>
                  <input
                    type="text"
                    name="sex"
                    id="sexID"
                    className="col-span-3 border-b-[1px] border-[#C3C3C3] outline-none text-center"
                  />
                  <label
                    htmlFor="weightID"
                    className="font-hind text-base text-[#797979] col-span-2"
                  >
                    Weight:
                  </label>
                  <input
                    type="text"
                    name="weight"
                    id="weightID"
                    className="col-span-3 border-b-[1px] border-[#C3C3C3] outline-none text-center"
                  />
                  <label
                    htmlFor="heightID"
                    className="font-hind text-base text-[#797979] col-span-2"
                  >
                    Height:
                  </label>
                  <input
                    type="text"
                    name="height"
                    id="heightID"
                    className="col-span-3 border-b-[1px] border-[#C3C3C3] outline-none text-center"
                  />
                  <label
                    htmlFor="btID"
                    className="col-span-2 font-hind text-base text-[#797979] "
                  >
                    Blood Type:
                  </label>
                  <input
                    type="text"
                    name="bt"
                    id="btID"
                    className="col-span-3 border-b-[1px] border-[#C3C3C3] outline-none text-center"
                  />
                  <label
                    htmlFor="bpID"
                    className="col-span-2 font-hind text-base text-[#797979]"
                  >
                    Blood Pressure:
                  </label>
                  <input
                    type="text"
                    name="bp"
                    id="bpID"
                    className="col-span-3 border-b-[1px] border-[#C3C3C3] outline-none text-center"
                  />
                  <label
                    htmlFor="bgID"
                    className="col-span-2 font-hind text-base text-[#797979]"
                  >
                    Blood Glucose
                  </label>
                  <input
                    type="text"
                    name="bg"
                    id="bgID"
                    className="col-span-3 border-b-[1px] border-[#C3C3C3] outline-none text-center"
                  />
                  <label
                    htmlFor="diseaseID"
                    className="font-hind text-base text-[#797979] col-span-2"
                  >
                    Disease:
                  </label>
                  <input
                    type="text"
                    name="disease"
                    id="diseaseID"
                    className="col-span-3 border-b-[1px] border-[#C3C3C3] outline-none text-center"
                  />
                  <label
                    htmlFor="allergiesID"
                    className="font-hind text-base text-[#797979] col-span-2"
                  >
                    Allergies:
                  </label>
                  <input
                    type="text"
                    name="allergies"
                    id="allergiesID"
                    className="col-span-3 border-b-[1px] border-[#C3C3C3] outline-none text-center "
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-8 mt-8 border-[#C3C3C3] border-[1px] ml-3 rounded-2xl p-8">
          <h1 className="font-montserrat font-bold text-2xl text-[#393939]">
            Appointment History
          </h1>
          <div className="h-0.5 w-full rounded-full bg-[#C3C3C3] my-4" />
          {pendingAppointments?.Appointment_Status === "isPending" ? (
            <div></div>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </div>
  );
}
