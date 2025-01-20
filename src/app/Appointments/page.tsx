"use client";

import ClientNavbar from "../ClientNavbar/page";
import Image from "next/image";
import { DatePicker, TimePicker } from "antd";
import "@ant-design/v5-patch-for-react-19";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import isAuthenticate from "../fetchData/User/isAuthenticate";

export default function Doctors() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [seeMore, setSeeMore] = useState(false);
  const [showAppointments, setShowAppointments] = useState(false);
  const [userAppointment, setUserAppointment] = useState("");
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
            />
            <TimePicker
              use12Hours={true}
              format="h:mm a"
              needConfirm
              className=" outline-none border-none font-montserrat text-lg bg-transparent active:bg-transparent"
            />
          </div>
          <div className="h-12 bg-[#D6EBEC] w-full rounded-xl flex justify-around items-center px-2">
            <div className="h-full w-full flex justify-between items-center relative gap-2">
              <div className="flex items-center h-full w-full">
                {userAppointment}
              </div>
              <FontAwesomeIcon
                icon={faCaretDown}
                className="text-lg cursor-pointer"
                onClick={() => {
                  setShowAppointments((prev) => !prev);
                  setSeeMore(false);
                }}
              />
              {showAppointments ? (
                <div className="absolute top-12 flex flex-col gap-2">
                  {appointments
                    .slice(!seeMore ? 0 : 0, !seeMore ? 5 : 11)
                    .map((data) => {
                      return (
                        <div key={data?.key} className=" cursor-pointer">
                          <h1 onClick={() => setUserAppointment(data?.label)}>
                            {data?.label}
                          </h1>
                        </div>
                      );
                    })}
                  <button
                    className="mt-2"
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
          <div>asd</div>
          <div>asd</div>
        </div>
      </div>
    </div>
  );
}
