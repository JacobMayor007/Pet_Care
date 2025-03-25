"use client";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import ClientNavbar from "@/app/ClientNavbar/page";
import fetchUserData from "../../../fetchData/fetchUserData";
import {
  addDoc,
  collection,
  DocumentData,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
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
import { DatePicker, Modal } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { db } from "@/app/firebase/config";
import { getMyPets } from "@/app/Appointments/mypet";

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

interface MyPets {
  id?: string;
  pet_age?: {
    month?: number;
    year?: number;
  };
  pet_breed?: string;
  pet_name?: string;
  pet_ownerEmail?: string;
  pet_ownerName?: string;
  pet_ownerUID?: string;
  pet_sex?: string;
  pet_type?: string;
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
  const options = [
    {
      id: 1,
      label: "Cash On Hand",
      img: "./Cash On Hand Image.svg",
    },
    {
      id: 2,
      label: "GCash",
      img: "./GCash Image.svg",
    },
    {
      id: 3,
      label: "Debit Or Credit",
      img: "./Debit Or Credit Image.svg",
    },
  ];

  const [typeOfPayment, setTypeOfPayment] = useState("");
  const [petName, setPetName] = useState("");
  const [petBreed, setPetBreed] = useState("");
  const [petYear, setPetYear] = useState(0);
  const [petMonth, setPetMonth] = useState(0);
  const [petMM, setPetMM] = useState(0);
  const [petHg, setPetHg] = useState(0);
  const [dateModal, setDateModal] = useState(false);
  const [bookModal, setBookModal] = useState(false);
  const [isDoctor, setIsDoctor] = useState<boolean | null>(false);
  const [userData, setUserData] = useState<DocumentData[]>([]);
  const [doctor, setDoctor] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const [myPets, setMyPets] = useState<MyPets[]>([]);
  const [petTypeAnimal, setPetTypeAnimal] = useState("");
  // const [typeOfPayment, setTypeOfPayment] = useState("");
  const [userAppointment, setUserAppointment] = useState("");
  const [showAppointments, setShowAppointments] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState<MyPets | null>(null);

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

  useEffect(() => {
    const fetchedMyPets = async () => {
      try {
        const getPets = await getMyPets(userData[0]?.User_UID);
        setMyPets(getPets);
      } catch (error) {
        console.error(error);
      }
    };
    fetchedMyPets();
  }, [userData]);

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

  const submitDateAppointment = () => {
    if (!date || !userAppointment) {
      alert("Please input fields");
      return;
    } else {
      setBookModal(true);
    }
  };

  if (loading) {
    return (
      <div className="">
        <LoadingProfile />
      </div>
    );
  }

  const onSubmit = async (id: string) => {
    const fullName = userData[0]?.User_Name;

    try {
      setLoading(true);

      if (!date) {
        throw new Error("Appointment date is required.");
      }

      const appointmentDate = Timestamp.fromDate(
        dayjs.isDayjs(date)
          ? date.toDate() // Convert Dayjs to Date
          : new Date(date) // Convert to Date if it's a string
      );

      const matchingDoctor = doctor.find((data) => data.User_UID === id);

      if (!matchingDoctor) {
        throw new Error("Matching doctor not found.");
      }

      const patientUserUID = userData[0]?.User_UID || "";
      const docRef = collection(db, "appointments");
      const docNotifRef = collection(db, "notifications");
      const q = query(
        docRef,
        where("Appointment_DoctorUID", "==", matchingDoctor.User_UID),
        where("Appointment_PatientUserUID", "==", patientUserUID)
      );
      const querySnapshot = await getDocs(q);

      const isNewPatient = querySnapshot.empty; // If no prior appointments, the patient is new

      // Add the appointment to Firestore
      const addAppointments = await addDoc(docRef, {
        Appointment_PatientFullName: fullName,
        Appointment_CreatedAt: Timestamp.now(),
        Appointment_PatientUserUID: patientUserUID,
        Appointment_DoctorEmail: matchingDoctor?.User_Email,
        Appointment_DoctorName: matchingDoctor?.User_Name,
        Appointment_TypeOfAppointment: userAppointment,
        Appointment_Date: appointmentDate,
        Appointment_DoctorUID: matchingDoctor.User_UID,
        Appointment_Location: matchingDoctor.User_Location,
        Appointment_DoctorPNumber: matchingDoctor.User_PNumber,
        Appointment_PatientPetAge: {
          Year: selectedPet ? selectedPet?.pet_age?.year : petYear,
          Month: selectedPet ? selectedPet.pet_age?.month : petMonth,
        },
        Appointment_PatientPetBreed: selectedPet
          ? selectedPet?.pet_breed
          : petBreed,
        Appointment_PatientPetName: selectedPet
          ? selectedPet.pet_name
          : petName,
        Appointment_PatientPetBP: {
          Hg: petHg,
          mm: petMM,
        },
        Appointment_PetTypeAnimal: selectedPet
          ? selectedPet?.pet_type
          : petTypeAnimal,
        Appointment_Status: "isPending",
        Appointment_PatientTypeOfPayment: typeOfPayment,
        Appointment_IsNewPatient: isNewPatient,
      });

      const notifAppointments = await addDoc(docNotifRef, {
        appointment_ID: addAppointments.id,
        createdAt: Timestamp.now(),
        receiverID: matchingDoctor.User_UID,
        hide: false,
        message: `${fullName} requesting to have a schedule`,
        senderID: patientUserUID,
        open: false,
        status: "unread",
        title: `Appointment Request with ${matchingDoctor?.User_UID}`,
        type: userAppointment,
        sender_FullName: fullName,
        receiver_FullName: matchingDoctor?.User_Name,
        isApprove: false,
      });

      console.log("Appointment added:");

      // Log whether the patient is new or old
      console.log(
        isNewPatient ? "New patient added." : "Old patient appointment added."
      );

      console.log("New notification added", notifAppointments);
    } catch (error) {
      console.log("Error adding data to Firebase:", error);
    } finally {
      setLoading(false);
    }
  };

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
          submitDateAppointment();
        }}
        className="mt-32 relative z-10"
      >
        <h1 className="text-center my-8 font-montserrat font-bold text-[#006B95] text-xl">
          Select Date
        </h1>
        <div className="flex items-center justify-around">
          <DatePicker
            format={"MMMM DD, YYYY"}
            needConfirm
            className="font-hind font-medium cursor-pointer"
            value={date}
            onChange={(date: Dayjs | null) => setDate(date)}
          />
        </div>
        <div>
          <div
            className={`h-8 w-96 bg-white rounded-lg drop-shadow-md ml-9 mt-8 cursor-pointer `}
            onClick={() => setShowAppointments(true)}
          >
            <input
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
            />
          </div>
          <div
            ref={divRef}
            className={`absolute top-[220px] left-0 bg-white w-full rounded-md drop-shadow-xl z-20 `}
          >
            {showAppointments && (
              <div>
                {doctor.map((data, index) => {
                  return (
                    <div key={index}>
                      {/* <h1
                        className="font-hind text-base font-medium flex flex-col"
                        onClick={() => {
                          setUserAppointment(
                            data?.User_TypeOfAppointment?.[0] || ""
                          );
                          setShowAppointments(false);
                        }}
                      >
                        {data?.User_TypeOfAppointment?.map((data) => data)}
                      </h1> */}
                      {data?.User_TypeOfAppointment?.map((data, index) => {
                        return (
                          <h1
                            key={index}
                            className="font-hind font-medium flex flex-col py-2 px-4 cursor-pointer hover:bg-slate-300"
                            onClick={() => {
                              setUserAppointment(data);
                              setShowAppointments(false);
                            }}
                          >
                            {data}
                          </h1>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Modal>
      <Modal
        open={bookModal}
        onCancel={() => setBookModal(false)}
        onClose={() => setBookModal(false)}
        onOk={() => {
          setBookModal(false);
          setConfirmModal(true);
        }}
      >
        <p className="font-montserrat font-bold text-[#393939]">
          Do you wish to have an appointment with {doctor[0]?.User_Name}
        </p>
        <div className="grid grid-cols-3 items-center w-fit my-5 gap-4">
          {myPets.length > 0 ? (
            <div className="col-span-3 grid grid-cols-3 items-center w-fit my-5 gap-4">
              {myPets.map((data) => {
                return (
                  <label
                    key={data?.id}
                    htmlFor={data?.id}
                    className={` cursor-pointer w-fit`}
                  >
                    <Image
                      src={`/${data?.pet_name?.toLowerCase()}.jpg`}
                      height={105}
                      width={130}
                      alt={`${data?.pet_name} Image`}
                      className={`${
                        data?.id === selectedPet?.id
                          ? "border-8 border-blue-300"
                          : "border-none border-0"
                      } object-cover rounded-lg`}
                    />
                    <h1 className="absolute bottom-1 left-5 font-bold font-montserrat text-2xl text-white">
                      {data?.pet_name}
                    </h1>
                    <input
                      type="radio"
                      name="select-pet"
                      id={data?.id}
                      className="hidden"
                      value={data?.id}
                      onClick={() => setSelectedPet(data)}
                    />
                  </label>
                );
              })}
            </div>
          ) : (
            <div className="col-span-3 grid grid-cols-3 items-center w-fit my-5 gap-4">
              <label
                htmlFor="petID"
                className="font-montserrat font-bold text-lg text-[#393939]"
              >
                Pet Name
              </label>
              <input
                className="h-9 w-56 rounded-lg col-span-2 drop-shadow-md font-hind text-[#393939] bg-white outline-none px-2 placeholder:font-hind"
                type="text"
                name="pet"
                id="petID"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                placeholder="Enter the name of your pet"
              />
              <label
                htmlFor="petTypeAnimal"
                className="font-montserrat font-bold text-lg text-[#393939]"
              >
                Pet Animal Type
              </label>
              <input
                className="h-9 w-56 rounded-lg col-span-2 drop-shadow-md font-hind text-[#393939] bg-white outline-none px-2 placeholder:font-hind"
                type="text"
                name="typeAnimal"
                id="petTypeAnimal"
                value={petTypeAnimal}
                onChange={(e) => setPetTypeAnimal(e.target.value)}
                placeholder="Ex. Dog"
              />
              <label
                htmlFor="petBreed"
                className="font-montserrat font-bold text-lg text-[#393939]"
              >
                Pet Breed
              </label>
              <input
                className="h-9 w-56 rounded-lg col-span-2 drop-shadow-md font-hind text-[#393939] bg-white outline-none px-2 placeholder:font-hind"
                type="text"
                name="breed"
                id="petBreed"
                value={petBreed}
                onChange={(e) => setPetBreed(e.target.value)}
                placeholder="Enter the breed of your pet"
              />
              <h1 className="col-span-3 font-montserrat font-bold text-lg text-[#393939] mt-8">
                Input your pet age
              </h1>
              <label
                htmlFor="petYear"
                className="text-end font-montserrat font-bold text-base text-[#393939]"
              >
                Year
              </label>
              <input
                type="number"
                name="year"
                id="petYear"
                placeholder="Ex. 1"
                value={petYear == 0 ? "" : petYear}
                onChange={(e) => setPetYear(Number(e.target.value))}
                className=" h-9 w-56 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none rounded-lg col-span-2 drop-shadow-md font-hind text-[#393939] bg-white outline-none px-2 placeholder:font-hind"
              />
              <label
                htmlFor="petMonth"
                className="text-end font-montserrat font-bold text-base text-[#393939]"
              >
                Month
              </label>
              <input
                type="number"
                name="month"
                id="petMonth"
                placeholder="Ex. 3"
                value={petMonth == 0 ? "" : petMonth}
                onChange={(e) => setPetMonth(Number(e.target.value))}
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none h-9 w-56 rounded-lg col-span-2 drop-shadow-md font-hind text-[#393939] bg-white outline-none px-2 placeholder:font-hind"
              />
            </div>
          )}
          <h1 className="col-span-3 font-montserrat font-bold text-lg text-[#393939] mt-6">
            Input the blood pressure of your pet
          </h1>
          <label
            htmlFor="mmBP"
            className="text-end font-montserrat font-bold text-base text-[#393939]"
          >
            mm
          </label>
          <input
            type="number"
            name="mm"
            id="mmBP"
            value={petMM == 0 ? "" : petMM}
            onChange={(e) => setPetMM(Number(e.target.value))}
            placeholder="(optional)  Ex. 120"
            className=" h-9 w-56 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none rounded-lg col-span-2 drop-shadow-md font-hind text-[#393939] bg-white outline-none px-2 placeholder:font-hind"
          />
          <label
            htmlFor="HgBP"
            className="text-end font-montserrat font-bold text-base text-[#393939]"
          >
            Hg
          </label>
          <input
            type="number"
            name="Hg"
            id="HgBP"
            placeholder="(optional) Ex. 90"
            value={petHg == 0 ? "" : petHg}
            onChange={(e) => {
              setPetHg(Number(e.target.value));
            }}
            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none h-9 w-56 rounded-lg col-span-2 drop-shadow-md font-hind text-[#393939] bg-white outline-none px-2 placeholder:font-hind"
          />
        </div>
        <h1 className="col-span-3 font-montserrat font-bold text-lg text-[#393939] mt-10">
          Choose Type Of Payment
        </h1>
        <div className="col-span-3 grid grid-cols-3 px-2 mt-4">
          {options.map((data) => {
            return (
              <div key={data.id} className="flex flex-row items-center gap-2 ">
                <input
                  type="radio"
                  name="payment-method"
                  id={data?.label}
                  value={data?.label}
                  checked={typeOfPayment === data?.label}
                  onChange={() => {
                    setTypeOfPayment(data?.label);
                  }}
                  className="cursor-pointer"
                />
                <Image
                  src={`/${data?.img}`}
                  height={30}
                  width={30}
                  alt={data?.label}
                />
                <label
                  htmlFor={data?.label}
                  className="font-montserrat font-semibold text-sm cursor-pointer"
                >
                  {data?.label}
                </label>
              </div>
            );
          })}
        </div>
      </Modal>

      <Modal
        open={confirmModal}
        onCancel={() => setConfirmModal(false)}
        onOk={() => {
          onSubmit(doctor[0]?.User_UID || "");
          setConfirmModal(false);
        }}
        centered={true}
      >
        Please confirm your appointment on {doctor[0]?.User_Name}
      </Modal>
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
