"use client";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEyeSlash, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { BellOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import fetchUserData from "../fetchData/fetchUserData";
import Signout from "../SignedOut/page";
import { notifications } from "../Provider/fetchNotification";
import { DocumentData } from "firebase/firestore";

interface Notifications {
  id?: string;
  createdAt?: string;
  order_ID?: string;
  message?: string;
  sender?: string;
  receiver?: string;
  status?: string;
  open?: boolean;
  title?: string;
  type?: string;
  hide?: boolean;
}

export default function ProductNavigation() {
  const [logout, setLogout] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [userData, setUserData] = useState<DocumentData>([]);

  useEffect(() => {
    const getName = async () => {
      const data = await fetchUserData();
      setUserData(data);
    };
    getName();
  }, []);

  return (
    <nav className="h-20 flex flex-row justify-center items-center relative z-20">
      <div className="flex items-center gap-16 px-24">
        <div className="flex items-center w-44">
          <Image src="/Logo.svg" height={54} width={54} alt="Logo" />
          <h1 className="text-2xl font-sigmar font-normal text-[#006B95]">
            Pet Care
          </h1>
        </div>
        <ul className="list-type-none flex items-center gap-3">
          <li className="w-28 h-14 flex items-center justify-center">
            <Link
              href="/Provider"
              className="font-montserrat text-base text-[#006B95] font-bold"
            >
              Dashboard
            </Link>
          </li>
          <li className="w-44 h-14 flex items-center justify-center font-bold">
            <Link
              href="/Inbox"
              className="font-montserrat text-base text-[#006B95] font-bold"
            >
              Inbox
            </Link>
          </li>
          <li className="w-30 h-14 flex items-center justify-center ">
            <Link
              className="font-montserrat text-base text-[#006B95] font-bold"
              href="/ListOfProducts"
            >
              List of Products
            </Link>
          </li>
          <li className="w-fit px-4 h-14 flex items-center justify-center">
            <Link
              className="font-montserrat text-base text-[#006B95] font-bold"
              href="/AddProduct"
            >
              Add New Product
            </Link>
          </li>
        </ul>
        <div className="flex flex-row items-center gap-4">
          <div className="relative cursor-pointer flex flex-row items-center gap-4  ">
            <BellOutlined
              onClick={() => {
                setShowNotif((prev) => !prev);
                setLogout(logout === true ? false : logout);
                // Notification.openNotification(doctor_UID);
              }}
              className="text-[#006B95] font-bold text-lg cursor-pointer relative"
            />
            <h1
              className="font-montserrat font-bold text-[#006B95] cursor-pointer"
              onClick={() => setLogout((prev) => !prev)}
            >
              {userData[0]?.User_Name} <FontAwesomeIcon icon={faChevronDown} />
            </h1>
            {/* <div
                    className={
                      unreadNotif > 0
                        ? `flex absolute -top-2 right-12 h-4 w-4 text-xs bg-red-500 cursor-pointer text-white rounded-full justify-center items-center`
                        : `hidden`
                    }
                  >
                    {unreadNotif < 0 ? `` : unreadNotif}
                  </div> */}
            <div
              className={logout ? `flex absolute top-9 -left-6` : `hidden`}
              onClick={() => setLogout((prev) => !prev)}
            >
              <Signout />
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
  const [notif, setNotif] = useState<Notifications[]>([]);
  const [newNotif, setNewNotif] = useState(0);
  console.log(newNotif);

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

        unsubscribe = notifications(userUID, (newNotif) => {
          setNotif(newNotif);
          setNewNotif(newNotif.length);
          console.log(newNotif);
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
      {notif.map((data) => {
        return (
          <div
            key={data?.id}
            className=" drop-shadow-lg grid grid-cols-12 p-1 items-center"
          >
            <div className="m-2 h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            <div className="grid grid-cols-12 my-2 col-span-11">
              <a
                href={`/Provider/Orders/${data?.order_ID}`}
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
