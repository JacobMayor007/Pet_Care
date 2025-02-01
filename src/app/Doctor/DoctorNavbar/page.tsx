"use client";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
// import { db } from "@/app/firebase/config";
// import { collection, getDocs, query, where } from "firebase/firestore";
import Signout from "@/app/SignedOut/page";
import { useRouter } from "next/navigation";
import myNotification, {
  unreadNotification,
} from "@/app/fetchData/Doctor/fetchNotification";
import fetchUserData from "@/app/fetchData/fetchUserData";
import {
  UserOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  BellOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

// import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
dayjs.extend(relativeTime);

interface Notifications {
  id?: string;
  createdAt?: string;
  message?: string;
  doctor_UID?: string;
  notif_userUID?: string;
  status?: string;
  title?: string;
  type?: string;
}

export default function DoctorNavigation() {
  const btnNotif = useRef<HTMLDivElement | null>(null);
  const [doctor_UID, setDoctor_UID] = useState("");
  const [unreadNotif, setUnreadNotif] = useState(0);
  const [logout, setLogout] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const auth = getAuth();
  const router = useRouter();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/Login");
      }
    });
    return () => unsubscribe();
  });

  useEffect(() => {
    const closeNotification = (e: MouseEvent) => {
      if (!btnNotif.current?.contains(e.target as Node)) {
        setShowNotif(false);
        console.log(btnNotif.current);
      }
    };

    document.addEventListener("mousedown", closeNotification);

    return () => {
      document.removeEventListener("mousedown", closeNotification);
    };
  }, [showNotif]);

  useEffect(() => {
    let unsubscribe: () => void;

    const getMyNotification = async () => {
      try {
        const data = await fetchUserData();
        const doctorUID = data[0]?.User_UID;
        setDoctor_UID(doctorUID);
        console.log(doctor_UID);

        if (!doctorUID) {
          console.log("No doctor UID found.");
          return;
        }

        // Call backend function and pass a callback to update state
        unsubscribe = unreadNotification(doctorUID, (newNotif) => {
          setUnreadNotif(newNotif.length);
        });
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    getMyNotification();

    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return (
    <div>
      <nav className="h-20 flex flex-row justify-center items-center z-[2]">
        <div className="flex items-center justify-center gap-16 px-14 w-full">
          <div className="flex items-center">
            <Image src="/Logo.svg" height={54} width={54} alt="Logo" />
            <h1 className="text-2xl font-sigmar font-normal text-[#006B95]">
              Pet Care
            </h1>
          </div>
          <ul className="list-type-none flex items-center gap-3">
            <li className="w-28 h-14 flex items-center justify-center">
              <a
                href="/Doctor"
                className="font-montserrat text-base text-[#006B95] font-bold"
              >
                Dashboard
              </a>
            </li>
            <li className="w-28 h-14 flex items-center justify-center">
              <a
                href="/Doctor/Patients"
                className="font-montserrat text-base text-[#006B95] font-bold"
              >
                Patients
              </a>
            </li>
            <li className="w-32 h-14 flex items-center justify-center px-2">
              <a
                href="/Doctor/Appointments"
                className="font-montserrat text-base text-[#006B95] font-bold"
              >
                Appointments
              </a>
            </li>
            <li className="w-32 h-14 px-2 flex items-center justify-center">
              <a
                className="font-montserrat text-base text-[#006B95] font-bold"
                href="/Doctor/Transactions"
              >
                Transactions
              </a>
            </li>

            <li className="w-28 h-14 flex items-center justify-center">
              <a
                className="font-montserrat text-base text-[#006B95] font-bold"
                href="/Doctor/Message"
              >
                Messages
              </a>
            </li>
          </ul>
          <div className="flex items-center gap-4" ref={btnNotif}>
            <div className="relative flex gap-2">
              <SearchOutlined className="text-[#006B95] font-bold text-lg cursor-pointer" />

              <BellOutlined
                onClick={() => {
                  setShowNotif((prev) => !prev);
                  setUnreadNotif(0);
                }}
                className="text-[#006B95] font-bold text-lg cursor-pointer relative"
              />
              <div
                className={
                  unreadNotif > 0
                    ? `flex absolute -top-2 right-12 h-4 w-4 text-xs bg-red-500 cursor-pointer text-white rounded-full justify-center items-center`
                    : `hidden`
                }
              >
                {unreadNotif < 0 ? `` : unreadNotif}
              </div>

              <UserOutlined
                className="text-[#006B95] font-bold text-lg cursor-pointer"
                onClick={() => setLogout((prev) => !prev)}
              />
              <ShoppingCartOutlined className="text-[#006B95] font-bold text-lg cursor-pointer" />

              <div
                className={
                  logout
                    ? `flex absolute top-9 left-3 cursor-pointer`
                    : `hidden`
                }
                onClick={() => setLogout((prev) => !prev)}
              >
                <Signout />
              </div>
              <div
                className={
                  showNotif
                    ? `flex absolute top-9 right-16 cursor-pointer `
                    : `hidden`
                }
              >
                <div>
                  <NotificationList />
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

function NotificationList() {
  const [notif, setNotif] = useState<Notifications[]>([]);
  // const [userUID, setUserUID] = useState("");
  // useEffect(() => {
  //   const auth = getAuth();

  //   const unsubscribe = onAuthStateChanged(auth, (user) => {
  //     if (user) {
  //       setUserUID(user?.uid);
  //     } else {
  //       router.push("/Login");
  //     }
  //   });
  //   return () => unsubscribe();
  // });

  //

  useEffect(() => {
    let unsubscribe: () => void;

    const getMyNotification = async () => {
      try {
        const data = await fetchUserData();
        const doctorUID = data[0]?.User_UID;

        if (!doctorUID) {
          console.log("No doctor UID found.");
          return;
        }

        // Call backend function and pass a callback to update state
        unsubscribe = myNotification(doctorUID, (newNotif) => {
          setNotif(newNotif);
        });
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    getMyNotification();

    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  console.log(notif);

  return (
    <div className="max-w-[500px] w-[482px] h-fit max-h-[542px] bg-white drop-shadow-lg rounded-xl justify-self-center flex flex-col">
      <h1 className="font-hind text-lg mx-4 mt-4 mb-2">Notifications</h1>
      <div className="h-0.5 border-[#393939] w-full border-[1px]" />
      {notif.map((data) => {
        return (
          <div key={data?.id} className="grid grid-cols-5 items-center my-4 ">
            <div>
              <div className="h-10 w-10 rounded-full bg-white drop-shadow-md justify-self-center text-xs flex items-center justify-center text-center">
                Image of pet
              </div>
            </div>
            <div className="col-span-4 flex flex-row">
              <div className="flex flex-col">
                <h1 className="font-hind ">For you: {data?.message}</h1>
                <p className="font-hind text-xs text-[#393939]">
                  {data?.createdAt}
                </p>
              </div>
              <div className="flex-grow flex justify-center">
                <FontAwesomeIcon icon={faEllipsisVertical} className="" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
