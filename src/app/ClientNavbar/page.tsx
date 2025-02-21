"use client";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Signout from "../SignedOut/page";
import { useRouter } from "next/navigation";
import { faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import * as Notifications from "../fetchData/User/fetchNotification";
import {
  UserOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  BellOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import fetchUserData from "../fetchData/fetchUserData";

interface Notifications {
  id?: string;
  createdAt?: string;
  appointment_ID?: string;
  order_ID?: string;
  room_ID?: string;
  message?: string;
  sender?: string;
  receiver?: string;
  status?: string;
  open?: boolean;
  title?: string;
  type?: string;
  hide?: boolean;
}

export default function ClientNavbar() {
  const btnRef = useRef<HTMLDivElement | null>(null);

  const [logout, setLogout] = useState(false);
  const auth = getAuth();
  const router = useRouter();
  const [showNotif, setShowNotif] = useState(false);
  const [dropDown, setDropDown] = useState(false);
  const [unopenNotif, setUnopenNotif] = useState(0);
  const [userUID, setUserUID] = useState<string | null>("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/Login");
      } else {
        setUserUID(user?.uid);
      }
    });
    return () => unsubscribe();
  });

  useEffect(() => {
    const closeNotification = (e: MouseEvent) => {
      if (!btnRef.current?.contains(e.target as Node)) {
        setShowNotif(false);
      }
    };

    document.body.addEventListener("mousedown", closeNotification);

    return () => {
      document.body.removeEventListener("mouseover", closeNotification);
    };
  }, [showNotif]);

  useEffect(() => {
    let unsubscribe: () => void;

    const getUnopenNotifications = async () => {
      try {
        const data = await fetchUserData();
        const userUID = data[0]?.User_UID;

        if (!userUID) {
          console.log("Logged In First");
          return;
        }

        unsubscribe = Notifications.UnopenNotification(userUID, (newNotif) => {
          setUnopenNotif(newNotif.length);
        });
      } catch (error) {
        console.log(error);
      }
    };

    getUnopenNotifications();

    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return (
    <nav className="h-20 flex flex-row justify-center items-center">
      <div className="flex items-center justify-center gap-16 px-14 w-full">
        <div className="flex items-center">
          <Image src="/Logo.svg" height={54} width={54} alt="Logo" />
          <h1 className="text-2xl font-sigmar font-normal text-[#006B95]">
            Pet Care
          </h1>
        </div>
        <ul className="list-type-none flex items-center gap-3">
          <li className="w-28 h-14 flex items-center justify-center">
            <Link href="/" passHref legacyBehavior>
              <a className="font-montserrat text-base text-[#006B95] font-bold">
                Dashboard
              </a>
            </Link>
          </li>
          <li className="w-28 h-14 flex items-center justify-center">
            <a
              href="/Booking"
              className="font-montserrat text-base text-[#006B95] font-bold"
            >
              Booking
            </a>
          </li>
          <li className="w-28 h-14 flex items-center justify-center ">
            <a
              href="/Shopping"
              className="font-montserrat text-base text-[#006B95] font-bold"
            >
              Shopping
            </a>
          </li>
          <li className="w-28 h-14 flex items-center justify-center">
            <a
              className="font-montserrat text-base text-[#006B95] font-bold"
              href="/Appointments"
            >
              Appointments
            </a>
          </li>

          <li className="w-28 h-14 flex items-center justify-center">
            <a
              className="font-montserrat text-base text-[#006B95] font-bold"
              href="/Message"
            >
              Inbox
            </a>
          </li>
        </ul>
        <div className="flex items-center gap-4" ref={btnRef}>
          <div className="relative  flex gap-2">
            <SearchOutlined className="text-[#006B95] font-bold text-lg cursor-pointer" />
            <BellOutlined
              className="text-[#006B95] font-bold"
              onClick={() => {
                setShowNotif((prev) => !prev);
                setLogout(logout === true ? false : logout);
                Notifications.openNotification(userUID || "");
              }}
            />
            <UserOutlined
              className="text-[#006B95] font-bold text-lg cursor-pointer"
              onClick={() => setLogout((prev) => !prev)}
            />
            <ShoppingCartOutlined
              className="text-[#006B95] font-bold text-lg cursor-pointer"
              onMouseEnter={() => setDropDown(true)}
              onMouseLeave={() => setDropDown(false)}
            />

            {dropDown ? (
              <nav
                onMouseEnter={() => setDropDown(true)}
                onMouseLeave={() => setDropDown(false)}
                className="absolute top-4 flex flex-col left-10 gap-2 bg-white drop-shadow-md p-4 rounded-md"
              >
                <Link
                  href="/pc/cart"
                  className="font-montserrat font-bold text-[#006B95] text-sm"
                >
                  Cart
                </Link>
                <a
                  href="/pc/room"
                  className="font-montserrat font-bold text-[#006B95] text-sm"
                >
                  Rooms
                </a>
                <Link
                  href="/pc/schedule"
                  className="font-montserrat font-bold text-[#006B95] text-sm"
                >
                  Schedule
                </Link>
              </nav>
            ) : (
              <div className="hidden" />
            )}

            <div
              className={
                logout
                  ? `flex absolute top-10 -left-3 cursor-pointer`
                  : `hidden`
              }
              onClick={() => setLogout((prev) => !prev)}
            >
              <Signout />
            </div>
            <div
              className={
                unopenNotif > 0
                  ? `h-4 w-4 bg-red-500 text-white absolute left-9 -top-2 rounded-full flex justify-center items-center text-xs font-hind`
                  : `hidden`
              }
            >
              {unopenNotif < 0 ? `` : unopenNotif}
            </div>
            <div
              className={
                showNotif
                  ? `flex absolute top-5 right-12 cursor-pointer transform-gpu ease-in-out duration-300`
                  : `hidden`
              }
            >
              <UserNotification />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

const UserNotification = () => {
  const [myNotification, setMyNotification] = useState<Notifications[]>([]);

  useEffect(() => {
    let unsubscribe: () => void;

    const getMyNotifications = async () => {
      try {
        const data = await fetchUserData();
        const userUID = data[0]?.User_UID;

        if (!userUID) {
          console.log("Logged In First");
          return;
        }

        unsubscribe = Notifications.default(userUID, (newNotif) => {
          setMyNotification(newNotif);
        });
      } catch (error) {
        console.log(error);
      }
    };

    getMyNotifications();

    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return (
    <div className="max-w-[500px] w-[482px] h-fit max-h-[542px] bg-white drop-shadow-lg rounded-xl justify-self-center flex flex-col pb-1">
      <h1 className="font-hind text-lg mx-4 mt-4 mb-2">Notifications</h1>
      <div className="h-0.5 border-[#393939] w-full border-[1px] mb-2" />
      {myNotification.map((data) => {
        return (
          <div
            key={data?.id}
            className=" drop-shadow-lg grid grid-cols-12 p-1 items-center"
          >
            <div className="m-2 h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            <div className="grid grid-cols-12 my-2 col-span-11">
              <a
                href={`/pc/${
                  data?.appointment_ID
                    ? `schedule/${data.appointment_ID}`
                    : data?.order_ID
                    ? `cart/${data.order_ID}`
                    : `rooms/${data?.room_ID}`
                }`}
                className="col-span-11 grid grid-cols-12"
              >
                <div className="h-12 w-12 col-span-2 rounded-full bg-white drop-shadow-lg font-montserrat text-xs flex items-center justify-center text-center text-nowrap overflow-hidden">
                  Image of <br />
                  Pet
                </div>
                <div className="flex flex-col gap-1 font-montserrat text-wrap col-span-10 text-sm">
                  <h1 className="text-[#393939] font-medium">
                    {data?.message}
                  </h1>
                  <p className="text-xs text-[#797979]">{data?.createdAt}</p>
                </div>
              </a>
              <div className="flex justify-center mt-0.5 ">
                <FontAwesomeIcon icon={faEyeSlash} />
              </div>
            </div>
            {data?.type === "Change Appointment" ? (
              <div className="flex flex-row justify-end gap-4 col-span-12 mr-10">
                <button
                  type="button"
                  className="bg-[#61C4EB] py-1 px-5 text-white rounded-lg"
                >
                  Accept
                </button>
                <button
                  type="button"
                  className="bg-red-400 py-1 px-5 text-white rounded-lg"
                >
                  Reject
                </button>
              </div>
            ) : (
              <div className="hidden" />
            )}
          </div>
        );
      })}
    </div>
  );
};
