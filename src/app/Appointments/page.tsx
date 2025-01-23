"use client";

import ClientNavbar from "../ClientNavbar/page";
import Image from "next/image";
import { DatePicker, TimePicker } from "antd";
import "@ant-design/v5-patch-for-react-19";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import isAuthenticate from "../fetchData/User/isAuthenticate";
import { Dayjs } from "dayjs";
import { collection, doc, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/config";
// import fetchDoctor from "../fetchData/Doctor/fetchDoctor";
// import { log } from "console";

interface Doctor {
  id?: string;
  User_AvailableHours?: {
    Days?: number[];
  };
  User_Email?: string;
  User_FName?: string;
  User_LName?: string;
  User_UID?: string;
  User_UserType?: string;
}

export default function Doctors() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [seeMore, setSeeMore] = useState(false);
  const [showAppointments, setShowAppointments] = useState(false);
  const [doctor, setDoctor] = useState<Doctor[]>([]);
  const [showXMark, setShowXMark] = useState(false);
  const [userAppointment, setUserAppointment] = useState("");
  const [userAppointmentDate, setUserAppointmentDate] = useState<Dayjs | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [userWeek, setUserWeek] = useState("");
  const [userAppointmentTime, setUserAppointmentTime] = useState<Dayjs | null>(
    null
  );

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

  // useEffect(() => {
  //   const getDoctors = async () => {
  //     const fetchedDoctors = await fetchDoctor();
  //     setDoctor(fetchedDoctors);
  //   };
  //   getDoctors();
  // }, []);

  const searchDoctor = async (day: number) => {
    try {
      setLoading(true);
      console.log(
        `Searching for doctors available on day: ${day} (${typeof day})`
      );

      const doctorQuery = query(
        collection(db, "doctor"),
        where("User_AvailableHours.Days", "array-contains", day)
      );
      const querySnapshot = await getDocs(doctorQuery);

      const availableDoctors = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("Available Doctors", availableDoctors);
      setDoctor(availableDoctors);
    } catch (err) {
      console.error("Error fetching the week data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const appointmentDate = userAppointmentDate; // Ensure this is properly retrieved
    if (appointmentDate) {
      console.log("userAppointmentDate:", appointmentDate);
      const day = appointmentDate.day(); // Adjust method to get the day correctly
      console.log("Searching for day:", day);
      searchDoctor(day);
    } else {
      console.log("userAppointmentDate is null or undefined.");
    }
  }, [userAppointmentDate]);

  useEffect(() => {
    const checkAuthentication = async () => {
      const login = await isAuthenticate();
      if (!login) {
        router.push("/Login"); // Redirect if not logged in
      } else {
        setIsLoggedIn(true); // Set state if logged in
      }
    };

    checkAuthentication();
  }, [router]);

  const dateChange = (date: Dayjs | null) => {
    setUserAppointmentDate(date);
  };

  const timeChange = (time: Dayjs | null) => {
    setUserAppointmentTime(time);
  };

  if (!isLoggedIn) {
    return (
      <div>
        <div></div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="relative z-[3]">
        <ClientNavbar />
      </div>
      <div className="h-2/3 bg-[#006B95] relative z-[2] flex flex-row justify-between px-14">
        <div className="flex flex-col z-[2] gap-10 mt-14">
          <div className="flex flex-col ">
            <h1 className="text-5xl text-white font-montserrat tracking-wider font-bold leading-[60px] w-96">
              Schedule an appointment with vet now
            </h1>
            <p className="font-montserrat text-lg text-white">
              Setup an appointment with our experts
            </p>
          </div>
          <span className="h-12 px-4 w-fit py-2 border-2 border-white font-hind text-lg text-white rounded-full">
            Book an appointment
          </span>
        </div>
        <Image
          src="/Stethoscope.svg"
          height={390}
          width={390}
          alt="Stethoscope svg"
          className="absolute object-contain left-1"
        />
        <Image
          src="/Paw Group.svg"
          height={290}
          width={290}
          alt="Paw Print Group"
          className="absolute object-contain right-1"
        />
        <div className="relative z-[2] h-[420px] w-[500px]">
          <Image
            src="/Doctor Pet Check.svg"
            layout="fill"
            objectFit="fill"
            alt="Doctor Checking Pet with Stethoscope"
          />
        </div>
      </div>
      <div className="-mt-8 relative w-full h-fit z-[2] ">
        <div className="mx-auto bg-white w-[85%] grid grid-cols-4 rounded-2xl drop-shadow-xl h-fit py-2 px-6 items-center gap-2">
          <div className="flex h-12 bg-[#D6EBEC] p-2 gap-1 rounded-xl w-full">
            <DatePicker
              needConfirm
              format="MMMM - DD - YYYY"
              className="  outline-none border-none font-montserrat text-lg bg-transparent active:bg-transparent"
              onChange={dateChange}
            />
            <TimePicker
              use12Hours={true}
              format="h:mm a"
              needConfirm
              className=" outline-none border-none font-montserrat text-lg bg-transparent active:bg-transparent"
              onChange={timeChange}
            />
          </div>
          <div
            className={`h-12 ${
              !userAppointment ? `bg-[#D6EBEC]` : `bg-white`
            } w-full rounded-xl flex justify-around items-center px-2`}
          >
            <div className="h-full w-full flex justify-between items-center relative gap-2">
              <div
                className={`flex items-center h-full w-full px-5 ${
                  userAppointment
                    ? `font-hind font-medium`
                    : `text-slate-400 font-hind text-base`
                }`}
              >
                {userAppointment ? userAppointment : `Select type of service `}
              </div>
              <div
                onMouseOver={() => setShowXMark(userAppointment ? true : false)}
                onMouseOut={() => setShowXMark(false)}
              >
                {showXMark ? (
                  <div className="h-6 w-6 hover:bg-slate-300 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faXmark}
                      className="text-lg cursor-pointer bg-slate-300 rounded-full "
                      onClick={() => {
                        setUserAppointment("");
                      }}
                    />
                  </div>
                ) : (
                  <FontAwesomeIcon
                    icon={faCaretDown}
                    className="text-lg cursor-pointer"
                    onClick={() => {
                      setShowAppointments((prev) => !prev);
                      setSeeMore(false);
                    }}
                  />
                )}
              </div>
              <div className="absolute top-14 bg-white w-full rounded-md drop-shadow-xl">
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
                                setShowAppointments((prev) => !prev);
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
                      {seeMore ? `See Less..` : `See More...`}
                    </button>
                  </div>
                ) : (
                  <div></div>
                )}
              </div>
            </div>
          </div>
          <div className="h-full ">
            <input
              type="text"
              name=""
              id=""
              className="bg-[#D6EBEC] h-full w-full rounded-xl outline-none placeholder:text-slate-400 px-4"
              placeholder="Ex. J & G Building, H Abellana, Canduman, Mandaue City, 6014 Cebu"
            />
          </div>
          <button
            type="button"
            className="h-full w-full rounded-md bg-[#77D8DD] hover:bg-[#62c9cf]  font-montserrat text-xl font-bold text-white hover:text-[#eaefec]"
          >
            Search
          </button>
        </div>
      </div>
      <div></div>
    </div>
  );
}
