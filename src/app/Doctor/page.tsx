"use client";
import { useEffect, useState } from "react";
import DoctorNavigation from "./DoctorNavbar/page";
import fetchUserData from "../fetchData/fetchUserData";
import {
  fetchMyAppointment,
  myNewPatient,
  myOldPatient,
} from "../fetchData/Doctor/fetchAppointment";
import { Calendar, Modal, List } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import dayjs, { Dayjs } from "dayjs";
import "@ant-design/v5-patch-for-react-19";

interface MyAppointment {
  id?: string;
  Appointment_Status?: string;
  Appointment_Date?: Dayjs | null;
  Appointment_DoctorName?: string;
  Appointment_DoctorPNumber?: string;
  Appointment_DoctorUID?: string;
  Appointment_Location?: string;
  Appointment_TypeOfAppointment?: string;
  Appointment_PatientEmail?: string;
  Appointment_PatientFullName?: string;
  Appointment_PatientFName?: string;
  Appointment_PatientPetName?: string;
}

export default function Doctor() {
  const [fullName, setFullName] = useState<string | null>("");
  const [loading, setLoading] = useState(true);
  const [myAppointment, setMyAppointment] = useState<MyAppointment[]>([]);
  const [newPatient, setNewPatient] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [appointmentsForDate, setAppointmentsForDate] = useState<
    MyAppointment[]
  >([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [oldPatient, setOldPatient] = useState(0);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const data = await fetchUserData();
        const fullName = data
          .map((data) => `${data?.User_FName} ${data?.User_LName}`)
          .join(",");

        setFullName(fullName);
      } catch (error) {
        console.error("Error on fetching UserData", error);
      }
    };
    getUserData();
  }, []);

  useEffect(() => {
    const getMyAppointments = async () => {
      try {
        setLoading(true);
        const fetchedAppointments = await fetchMyAppointment();
        setMyAppointment(
          fetchedAppointments.map((appointment: MyAppointment) => ({
            ...appointment,
            Appointment_Date: appointment.Appointment_Date
              ? dayjs(appointment.Appointment_Date.toDate()) // Convert Firestore Timestamp to Dayjs
              : null, // Handle missing or invalid dates
          }))
        );
      } catch (err) {
        console.error("Error fetching appointments:", err);
      } finally {
        setLoading(false);
      }
    };

    getMyAppointments();
  }, []);

  console.log("The dates of appointment:", myAppointment);

  useEffect(() => {
    const getMyNewPatient = async () => {
      try {
        const data = await fetchUserData();
        const doctorUID = data[0]?.User_UID;
        const doctorEmail = data[0]?.User_Email;

        const myNewPatients = await myNewPatient(doctorUID, doctorEmail);
        console.log("This is my my new patients", myNewPatients);

        setNewPatient(myNewPatients);
      } catch (err) {
        console.error(err);
      }
    };
    getMyNewPatient();
  }, []);

  useEffect(() => {
    const getMyOldPatient = async () => {
      try {
        const data = await fetchUserData();
        const doctorUID = data[0]?.User_UID;
        const doctorEmail = data[0]?.User_Email;

        const myOldPatients = await myOldPatient(doctorUID, doctorEmail);
        console.log("This is my old new patients", myOldPatients);

        setOldPatient(myOldPatients);
      } catch (err) {
        console.error(err);
      }
    };
    getMyOldPatient();
  }, []);

  const cellRender = (date: Dayjs) => {
    const formattedDate = date.format("YYYY-MM-DD");
    const appointmentsForDay = myAppointment.filter(
      (appointment) =>
        appointment.Appointment_Date?.format("YYYY-MM-DD") === formattedDate
    );

    // Show only the first appointment, and the rest with ellipsis
    const firstAppointment = appointmentsForDay[0];

    return (
      <div
        className="text-sm h-full flex justify-end"
        onClick={() => setIsModalOpen(true)}
      >
        {firstAppointment && (
          <div className="h-3 w-3 rounded-full bg-[#FF0000] animate-pulse" />
        )}
      </div>
    );
  };

  // Handle Date Select
  const onDateSelect = (date: Dayjs) => {
    const formattedDate = date.format("YYYY-MM-DD");
    setSelectedDate(formattedDate);
    const appointmentsForDay = myAppointment.filter(
      (appointment) =>
        appointment.Appointment_Date?.format("YYYY-MM-DD") === formattedDate
    );
    setAppointmentsForDate(appointmentsForDay);
  };

  // Modal Close
  const handleModalClose = () => {
    setIsModalOpen(false);
  };
  if (loading) return <LoadingPage />;

  return (
    <div className="h-full">
      <DoctorNavigation />
      <div className="ml-56 mr-48 grid grid-cols-7 gap-5 ">
        <h1 className="text-4xl font-bold font-montserrat text-[#393939] capitalize text-start col-span-7 mt-8">
          Hello, Dr. {fullName}
        </h1>
        <div className="h-full pt-5 pb-10 col-span-3">
          <div className="flex flex-col gap-14">
            <div className="h-80 bg-gradient-to-t from-[#006B95] to-[#61C4EB] rounded-3xl p-10 w-full">
              <h1 className="font-montserrat font-bold text-2xl text-white">
                {" "}
                Total Appointments{" "}
              </h1>
              <p className="font-hind font-medium text-3xl text-[#00126A] mt-2">
                {myAppointment.length}
              </p>
              <div className="grid grid-cols-2  ">
                <div className="h-[135px] w-[151px] bg-[#D3EDF7] p-4 rounded-2xl flex flex-col gap-4">
                  <h1 className="font-montserrat font-semibold text-base">
                    New Patients
                  </h1>
                  <p className="font-hind font-medium text-[#00126A] text-4xl">
                    {newPatient}
                  </p>
                </div>
                <div className="h-[135px] w-[151px] bg-[#D3EDF7] p-4 rounded-2xl flex flex-col gap-4">
                  <h1 className="font-montserrat font-semibold text-base">
                    Old Patients
                  </h1>
                  <p className="font-hind font-medium text-[#00126A] text-4xl">
                    {oldPatient}
                  </p>
                </div>
              </div>
            </div>
            <h1 className="font-montserrat font-semibold text-2xl text-[#393939]">
              Appointment List
            </h1>
            <div className="h-fit grid grid-cols-2 gap-2 py-4 px-10 bg-white drop-shadow-lg rounded-xl">
              <h1 className="font-montserrat font-semibold text-[#393939]">
                Today
              </h1>
              <div className="flex justify-end items-center">
                <FontAwesomeIcon
                  icon={faEllipsisVertical}
                  className="text-[#756D78]"
                />
              </div>
              <div className="border-[1px] border-[#b1b1b1] rounded-full w-full col-span-2" />
              {myAppointment.map((data) => {
                return (
                  <div key={data?.id} className="grid grid-cols-4 col-span-2">
                    <div className="col-span-3">
                      <div className="flex flex-row gap-3">
                        <div className="h-16 w-16 text-xs rounded-full font-hind drop-shadow-lg bg-white text-center flex items-center justify-center text-ellipsis overflow-hidden text-nowrap">
                          Image of <br /> {data?.Appointment_PatientFullName}
                        </div>
                        <div className="flex flex-col justify-center">
                          <p className="text-lg font-bold font-montserrat">
                            {data?.Appointment_PatientPetName}
                          </p>
                          <p className="font-hind text-sm text-[#096F85]">
                            {data?.Appointment_TypeOfAppointment}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-end">time</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className=" w-full col-span-4">
          <Calendar
            className="bg-white rounded-xl drop-shadow-xl h-fit px-10 pt-10 my-4 overflow-hidden calendar-no-scroll"
            cellRender={cellRender}
            onSelect={onDateSelect}
          />
          <Modal
            title={`Appointments for ${selectedDate}`}
            open={isModalOpen}
            onCancel={handleModalClose}
            footer={null}
            centered={true}
          >
            <List
              dataSource={appointmentsForDate}
              renderItem={(item, index) => (
                <List.Item key={item.id}>
                  <div className="">
                    <h1 className="font-montserrat font-bold text-lg">
                      Patient {index + 1}:
                    </h1>
                    <p className="font-montserrat text-[#393939]">
                      {item.Appointment_PatientFullName}
                    </p>
                    <h1 className="font-montserrat font-bold text-lg">Pet:</h1>
                    <p className="font-montserrat text-[#393939]">
                      {item.Appointment_PatientPetName}
                    </p>
                    <h1 className="font-montserrat font-bold text-lg">Type:</h1>
                    <p className="font-montserrat text-[#393939]">
                      {item.Appointment_TypeOfAppointment}
                    </p>

                    <h1 className="font-montserrat font-bold text-lg">
                      Location:
                    </h1>
                    <p className="font-montserrat text-[#393939]">
                      {item.Appointment_Location}
                    </p>
                  </div>
                </List.Item>
              )}
            />
          </Modal>
        </div>
      </div>
    </div>
  );
}

function LoadingPage() {
  return (
    <div className="h-screen">
      <nav className="ml-72 gap-8 h-fit flex flex-row items-center  animate-pulse">
        <ul className="flex flex-row h-full items-center gap-4">
          <li className="bg-slate-300 drop-shadow-xl rounded-full h-14 w-14" />
          <li className="bg-slate-300 h-10 w-32 drop-shadow-xl rounded-xl" />
        </ul>
        <ul className="flex flex-row h-full items-center gap-4">
          <li className="bg-slate-300 h-8 w-32 drop-shadow-xl rounded-xl"></li>
          <li className="bg-slate-300 h-8 w-32 drop-shadow-xl rounded-xl"></li>
          <li className="bg-slate-300 h-8 w-32 drop-shadow-xl rounded-xl"></li>
          <li className="bg-slate-300 h-8 w-32 drop-shadow-xl rounded-xl"></li>
        </ul>
        <ul className="flex flex-row h-full items-center gap-4">
          <li className="bg-slate-300 drop-shadow-xl rounded-full h-7 w-7" />
          <li className="bg-slate-300 drop-shadow-xl rounded-full h-7 w-7" />
          <li className="bg-slate-300 drop-shadow-xl rounded-full h-7 w-7" />
        </ul>
      </nav>
      <div className="ml-56 mr-48 grid grid-cols-7 gap-5 py-10 h-full animate-pulse">
        <div className="col-span-3 py-10 h-full w-full flex flex-col gap-10">
          <div className="h-80 rounded-3xl w-full bg-slate-300"></div>
          <div className="col-span-4 w-full h-full rounded-3xl bg-slate-300"></div>
        </div>
      </div>
    </div>
  );
}
