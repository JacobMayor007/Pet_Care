"use client";

import React, { useState, useEffect, useRef } from "react";
import ClientNavbar from "@/app/ClientNavbar/page";
import fetchUserData from "../../../fetchData/fetchUserData";
import { DocumentData } from "firebase/firestore";
import DoctorNavigation from "../../../Doctor/DoctorNavbar/page";
import BoardNavigation from "../../../BoardNavigation/page";
import ProductNavigation from "../../../ProductNavigation/page";
import fetchProfile, { fetchIsDoctor } from "./fetchProfile";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "@ant-design/v5-patch-for-react-19";
import {
  faArrowLeft,
  faCircleCheck,
  faEnvelope,
  faMapPin,
  faPhone,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
// import { useRouter } from "next/navigation";
import Link from "next/link";
import { DatePicker, Modal, TimePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";

interface doctorID {
  params: Promise<{ id: string }>;
}

interface Doctor {
  id?: string;
  CreatedAt?: string;
  User_AvailableHours?: {
    Days?: [number];
  };
  User_Email?: string;
  User_Name?: string;
  User_Location?: string;
  User_PNumber?: string;
  User_TypeOfAppointment?: [string];
  User_UID?: string;
  User_UserType?: string;
  User_Details?: string;
}

export default function ViewDoctor({ params }: doctorID) {
  const [userData, setUserData] = useState<DocumentData[]>([]);
  const userType = userData[0]?.User_UserType;
  const { id } = React.use(params);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserData = async () => {
      try {
        setLoading(true);
        const fetched = await fetchUserData();
        setUserData(fetched);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    getUserData();
  }, []);

  if (loading) {
    return (
      <div className="mt-5">
        <LoadingNavbar />
      </div>
    );
  }

  return (
    <div>
      <nav className="relative z-20">
        {userType === "Doctor" ? (
          <DoctorNavigation />
        ) : userType === "Board" ? (
          <BoardNavigation />
        ) : userType === "Product" ? (
          <ProductNavigation />
        ) : (
          <ClientNavbar />
        )}
      </nav>
      <div className="z-10">
        <DoctorProfile id={id} />
      </div>
    </div>
  );
}

function DoctorProfile(props: { id: string }) {
  const divRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const weeks = [
    {
      key: 0,
      label: "Sunday",
    },
    {
      key: 1,
      label: "Monday",
    },
    {
      key: 2,
      label: "Tuesday",
    },
    {
      key: 3,
      label: "Wednesday",
    },
    {
      key: 4,
      label: "Thursday",
    },
    {
      key: 5,
      label: "Friday",
    },
    {
      key: 6,
      label: "Saturday",
    },
  ];

  const appointments = [
    {
      key: 1,
      label: "Blood test",
    },
    {
      key: 2,
      label: "Heartworm test",
    },
    {
      key: 3,
      label: "Endoscopy",
    },
    {
      key: 4,
      label: "Magnetic Resonance Imaging",
    },
    {
      key: 5,
      label: "Urinalysis",
    },
    {
      key: 6,
      label: "X-ray",
    },
    {
      key: 7,
      label: "Biopsy",
    },
    {
      key: 8,
      label: "Vetirinary Appointment",
    },
    {
      key: 9,
      label: "Stool test",
    },
    {
      key: 10,
      label: "Ultrasound",
    },
    {
      key: 11,
      label: "Electrocardiography",
    },
  ];

  const [dateModal, setDateModal] = useState(false);
  const [bookModal, setBookModal] = useState(false);
  const [isDoctor, setIsDoctor] = useState<boolean | null>(false);
  const [userData, setUserData] = useState<DocumentData[]>([]);
  const [doctor, setDoctor] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState<Dayjs | null>(dayjs());
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  // const [typeOfPayment, setTypeOfPayment] = useState("");
  const [userAppointment, setUserAppointment] = useState("");
  const [other, setOther] = useState(false);
  const [showAppointments, setShowAppointments] = useState(false);
  const [seeMore, setSeeMore] = useState(false);

  useEffect(() => {
    const closeShowAppointments = (e: MouseEvent) => {
      // Check if the click is outside the divRef element
      if (divRef.current && !divRef.current.contains(e.target as Node)) {
        setShowAppointments(false);
      }
    };

    document.addEventListener("mousedown", closeShowAppointments);

    return () => {
      document.removeEventListener("mousedown", closeShowAppointments);
    };
  }, [showAppointments]);

  useEffect(() => {
    const getUserData = async () => {
      try {
        setLoading(true);
        const fetched = await fetchUserData();
        console.log(fetched ? "true" : "false");

        setUserData(fetched);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    getUserData();
  }, []);

  const userType = userData[0]?.User_UID;

  useEffect(() => {
    const itsDoctor = async () => {
      const doctor = await fetchIsDoctor(userType);
      setIsDoctor(doctor);
    };
    itsDoctor();
  }, [userType]);

  useEffect(() => {
    const getDoctor = async () => {
      const profile = await fetchProfile(props.id);

      setDoctor(profile);
    };

    getDoctor();
  }, [props.id]);

  if (loading) {
    return (
      <div className="">
        <LoadingProfile />
      </div>
    );
  }

  const submitAppointment = async () => {};

  // const convertTimeToTimestamp = (time: Dayjs | null) => {
  //   if (time) {
  //     return Timestamp.fromDate(time.toDate());
  //   }
  //   return null;
  // };

  // const convertDateToTimestamp = (date: Dayjs | null) => {
  //   if (date) {
  //     return Timestamp.fromDate(date.toDate());
  //   }
  //   return null;
  // };

  return (
    <div className="h-full mx-52 py-4">
      {isDoctor ? (
        <h1 className="font-montserrat mt-4 mb-8 font-bold text-4xl flex gap-5 items-center">
          {" "}
          <FontAwesomeIcon icon={faArrowLeft} /> My Profile
        </h1>
      ) : (
        <h1 className="font-montserrat mt-4 mb-8 font-bold text-4xl flex gap-5 items-center">
          <Link href="/">
            <FontAwesomeIcon icon={faArrowLeft} /> Doctor&#39;s Profile
          </Link>
        </h1>
      )}
      <div className="p-4">
        {doctor.map((data) => {
          return (
            <div key={data?.id} className="grid grid-cols-5 w-full">
              <div className="h-48 w-48 text-center rounded-full bg-white drop-shadow-lg flex justify-center items-center font-montserrat text-xl">
                Image of {data?.User_Name}
              </div>
              <div className="flex flex-col gap-4 w-full col-span-4">
                <h1 className="font-montserrat font-bold text-4xl flex justify-between">
                  Dr. {data?.User_Name}{" "}
                  <span
                    className="text-lg flex items-center gap-2 px-4 rounded-full cursor-pointer bg-green-500 text-white"
                    onClick={() => setDateModal(true)}
                  >
                    Consult Now <FontAwesomeIcon icon={faCircleCheck} />{" "}
                  </span>
                </h1>

                <div className="w-full border-[1px] border-[#C3C3C3]" />
                <p className="font-montserrat text-lg">
                  <FontAwesomeIcon
                    icon={faMapPin}
                    className="mr-2 text-red-500"
                  />{" "}
                  {data?.User_Location}
                </p>
                <p className="font-montserrat text-lg">
                  <FontAwesomeIcon icon={faPhone} className="mr-2" />{" "}
                  {data?.User_PNumber}
                </p>
                <p className="font-montserrat text-lg">
                  {" "}
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="mr-2 text-slate-400"
                  />{" "}
                  {data?.User_Email}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-col mt-8 ">
        {doctor.map((data, index) => {
          return (
            <div key={index} className="flex flex-col gap-20">
              <div className="flex flex-col gap-4 ">
                <h1 className="font-montserrat font-bold text-3xl flex justify-between cursor-pointer">
                  Details
                  {isDoctor ? (
                    <span className="mr-20">
                      <FontAwesomeIcon icon={faPlus} />
                    </span>
                  ) : (
                    <span className="hidden" />
                  )}
                </h1>
                <p className="flex flex-col gap-4 font-montserrat font-medium text-[#393939] pr-20 leading-7 text-justify">
                  {data?.User_Details}
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <h1 className="font-montserrat font-bold text-3xl flex justify-between cursor-pointer">
                  Services
                  {isDoctor ? (
                    <span className="mr-20">
                      <FontAwesomeIcon icon={faPlus} />
                    </span>
                  ) : (
                    <span className="hidden" />
                  )}
                </h1>
                <ul className="bg-white drop-shadow-lg w-80 py-4 rounded-md">
                  {data?.User_TypeOfAppointment?.map((data, index) => {
                    return (
                      <li
                        key={index}
                        className="font-hind list-disc mt-4 mx-10"
                      >
                        {" "}
                        {data.split(",")}{" "}
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="flex flex-col w-96 mb-8">
                <h1 className="font-montserrat font-bold text-4xl mb-5">
                  Working Hours
                </h1>
                {data?.User_AvailableHours?.Days?.map((day, dayIndex) => {
                  const weekDay = weeks.find((week) => week.key === day)?.label;
                  return (
                    <p
                      key={dayIndex}
                      className="font-montserrat font-bold ml-10 mb-1"
                    >
                      {weekDay}
                    </p>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <Modal
        open={dateModal}
        onCancel={() => setDateModal(false)}
        onClose={() => setDateModal(false)}
        onOk={() => {
          setDateModal(false);
          if (date || !time || !userAppointment) {
            alert("Please input fields");
          } else {
            setBookModal(true);
          }
        }}
        className="mt-32 relative z-10"
      >
        <h1 className="text-center my-8 font-montserrat font-bold text-[#006B95] text-xl">
          Select Date and Time
        </h1>
        <div className="flex items-center justify-around">
          <DatePicker
            format={"MMMM DD, YYYY"}
            needConfirm
            className="font-hind font-medium cursor-pointer"
            value={date}
            onChange={(date: Dayjs | null) => setDate(date)}
          />
          <TimePicker
            format={"hh:mm A"}
            needConfirm
            className="font-hind font-medium cursor-pointer"
            value={time}
            onChange={(time: Dayjs | null) => setTime(time)}
          />
        </div>
        <div>
          <div
            className={`h-8 w-96 bg-white rounded-lg drop-shadow-md ml-9 mt-8 cursor-pointer ${
              other ? `px-0` : `px-3`
            }`}
            onClick={() => setShowAppointments(true)}
          >
            {other ? (
              <input
                ref={inputRef}
                type="text"
                id="userAppointment"
                name="user-appointment"
                placeholder="Please select your type of service"
                onClick={() =>
                  setShowAppointments(userAppointment ? false : false)
                }
                className={`h-full w-full outline-none font-hind text-black font-medium autofill:bg-white px-3 rounded-lg ${
                  userAppointment
                    ? `bg-white cursor-pointer`
                    : `bg-[#D6EBEC] focus:outline-none focus:text-black`
                }`}
                value={userAppointment}
                onChange={(e) => setUserAppointment(e.target.value)}
              />
            ) : userAppointment ? (
              userAppointment
            ) : (
              `Please select your type of service`
            )}
          </div>
          <div
            ref={divRef}
            className="absolute top-[220px] left-0 bg-white w-full rounded-md drop-shadow-xl z-20"
          >
            {showAppointments ? (
              <div className=" flex flex-col gap-2 py-2 px-4 rounded-md ">
                {appointments
                  .slice(!seeMore ? 0 : 0, !seeMore ? 5 : 11)
                  .map((data) => {
                    return (
                      <div
                        key={data?.key}
                        className=" cursor-pointer hover:bg-slate-200 p-2 rounded-md"
                      >
                        <h1
                          className="font-hind text-base font-medium"
                          onClick={() => {
                            setUserAppointment(data?.label);
                            setShowAppointments(false);
                          }}
                        >
                          {data?.label}
                        </h1>
                      </div>
                    );
                  })}
                <button
                  className="mt-2 font-montserrat text-sm font-bold"
                  onClick={() => setSeeMore((prev) => !prev)}
                >
                  {seeMore ? `See Less..` : <h1>See More...</h1>}
                </button>
                <button
                  type="button"
                  className="mt-2 font-montserrat text-sm font-bold italic"
                  onClick={() => {
                    setOther(true);
                    inputRef.current?.focus();
                    setShowAppointments(false);
                  }}
                >
                  Others
                </button>
              </div>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      </Modal>
      <Modal
        open={bookModal}
        onCancel={() => setBookModal(false)}
        onClose={() => setBookModal(false)}
        onOk={() => submitAppointment}
      ></Modal>
    </div>
  );
}

function LoadingNavbar() {
  return (
    <div className="h-screen animate-pulse">
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
    </div>
  );
}

function LoadingProfile() {
  return (
    <div className="h-fit flex flex-row mx-48 pt-10 items-center animate-pulse">
      <div className="h-40 w-40 rounded-full bg-slate-300 drop-shadow-lg mr-20" />
      <div className="w-full flex flex-col gap-10 py-2">
        <div className="h-1 w-96  bg-slate-300" />
        <div className="h-1 w-96 bg-slate-300" />
        <div className="h-1 w-96 bg-slate-300" />
      </div>
    </div>
  );
}
