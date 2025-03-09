"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faStar, faXmark } from "@fortawesome/free-solid-svg-icons";
import {
  BellOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import * as Notifications from "../fetchData/User/fetchNotification";
import { useEffect, useRef, useState } from "react";
import fetchUserData from "../fetchData/fetchUserData";
import Link from "next/link";
import Signout from "../SignedOut/page";
import { UserNotification } from "../ClientNavbar/page";
import Image from "next/image";

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

export default function foundMyBuddy() {
  const userRef = useRef<HTMLDivElement | null>(null);
  const [showNotif, setShowNotif] = useState(false);
  const [logout, setLogout] = useState(false);
  const [userUID, setUserUID] = useState("");
  const [dropDown, setDropDown] = useState(false);
  const [isHeart, setIsHeart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isReject, setIsReject] = useState(false);

  useEffect(() => {
    const getUserData = async () => {
      const user = await fetchUserData();
      setUserUID(user[0]?.User_UID);
    };
    getUserData();
  }, [userUID]);

  useEffect(() => {
    const closeUserDropdown = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setLogout(false);
        setShowNotif(false);
        setDropDown(false);
      }
    };

    document.body.addEventListener("mousedown", closeUserDropdown);

    return () => {
      document.body.removeEventListener("mousedown", closeUserDropdown);
    };
  }, []);

  return (
    <div className="h-screen relative bg-red-50">
      <nav className="h-16 flex flex-row items-center justify-between w-full pr-32 pl-24 fixed top-0">
        <div className="flex flex-row items-center gap-7">
          <FontAwesomeIcon
            icon={faXmark}
            className="text-xl text-red-900 cursor-pointer"
          />
          <h1 className="bg-gradient-to-r from-[#B32134] via-[#DC5987] text-transparent bg-clip-text to-[#F77FBE] font-montserrat font-bold text-3xl ">
            Find My Buddy
          </h1>
        </div>
        <div
          className="flex items-center flex-row gap-4 relative"
          ref={userRef}
        >
          <BellOutlined
            className="text-[#B32134] text-lg"
            onClick={() => {
              setShowNotif((prev) => !prev);
              setLogout(false);
              setDropDown(false);
              Notifications.openNotification(userUID || "");
            }}
          />
          <ShoppingCartOutlined
            className="text-[#B32134] font-bold text-lg cursor-pointer"
            onClick={() => {
              setDropDown((prev) => !prev);
              setLogout(false);
              setShowNotif(false);
            }}
          />
          {dropDown ? (
            <nav className="absolute top-5 right-10 grid grid-rows-3 items-center text-center gap-2 bg-white drop-shadow-md p-4 rounded-md w-60 h-48">
              <Link
                href="/pc/cart"
                className="font-montserrat font-bold text-[#006B95] text-lg border-b-[1px] border-[#B1B1B1] h-full flex justify-center items-center"
              >
                Cart
              </Link>
              <a
                href="/pc/room"
                className="font-montserrat font-bold text-[#006B95] text-lg border-b-[1px] border-[#B1B1B1] h-full flex justify-center items-center"
              >
                Rooms
              </a>
              <Link
                href="/pc/schedule"
                className="font-montserrat font-bold text-[#006B95] text-lg h-full flex justify-center items-center"
              >
                Schedule
              </Link>
            </nav>
          ) : (
            <div className="hidden" />
          )}
          <UserOutlined
            className="text-[#B32134] text-lg cursor-pointer"
            onClick={() => {
              setLogout((prev) => !prev);
              setDropDown(false);
              setShowNotif(false);
            }}
          />
          {logout && (
            <div
              className={
                logout
                  ? `grid grid-rows-6 justify-center items-center bg-[#F3F3F3] drop-shadow-xl rounded-lg absolute top-5 right-5 cursor-pointer h-fit w-56`
                  : `hidden`
              }
            >
              <Link
                href={`/Profile/Boarder/${userUID}`}
                className="text-center font-hind  h-full w-44 flex items-center justify-center border-b-[1px] border-[#B1B1B1]"
              >
                My Account
              </Link>
              <Link
                href={`/find-my-buddy`}
                className="text-center font-hind  h-full w-44 flex items-center justify-center border-b-[1px] border-[#B1B1B1]"
              >
                Want to find your buddy?
              </Link>
              <Link
                href={`/Doctor`}
                className="text-center font-hind  h-full w-44 flex items-center justify-center border-b-[1px] border-[#B1B1B1]"
              >
                Want to become part of our doctors?
              </Link>
              <Link
                href={`/Provider`}
                className="text-center font-hind  h-full w-44 flex items-center justify-center border-b-[1px] border-[#B1B1B1]"
              >
                Want to become part of our product sellers?
              </Link>
              <Link
                href={`/Renter`}
                className="text-center font-hind  h-full w-44 flex items-center justify-center border-b-[1px] border-[#B1B1B1]"
              >
                Want to become part of our renters?
              </Link>
              <Link
                href={`/Settings`}
                className="text-center font-hind  h-full w-44 flex items-center justify-center border-b-[1px] border-[#B1B1B1]"
              >
                Settings
              </Link>

              <Signout />
            </div>
          )}
          <div
            className={
              showNotif
                ? `flex absolute cursor-pointer top-5 right-20 transform-gpu ease-in-out duration-300`
                : `hidden`
            }
          >
            <UserNotification />
          </div>
        </div>
      </nav>
      <div className="relative top-8 z-20 w-[550px] h-[94%] mx-auto rounded-lg grid grid-cols-5 ">
        <div className="bg-red-300 px-4 h-full w-full col-span-4 flex items-center rounded-lg">
          <Image
            height={140}
            width={140}
            alt="yolo"
            src={`/yolo.jpg`}
            className="object-contain w-full rounded-md"
          />
          <div className="relative z-20"></div>
        </div>
        <div className="h-full flex items-end">
          <div className="h-1/2 w-full flex flex-col items-center">
            <div
              className={`${
                isHeart ? `border-none bg-[#B32134] ` : `border-red-200`
              } border-2 h-11 w-11 rounded-full flex items-center justify-center cursor-pointer mt-8 mb-6`}
              onClick={() => setIsHeart((prev) => !prev)}
            >
              <FontAwesomeIcon
                icon={faHeart}
                className={`text-3xl ${
                  isHeart ? `text-white` : `text-[#B32134]`
                } `}
              />
            </div>
            <div
              className={`${
                isFavorite
                  ? `border-none bg-[#006B95]`
                  : `border-blue-300 border-2`
              } h-11 w-11 rounded-full flex items-center justify-center cursor-pointer mb-6`}
              onClick={() => setIsFavorite((prev) => !prev)}
            >
              <FontAwesomeIcon
                icon={faStar}
                className={`text-2xl ${
                  isFavorite ? `text-white` : `text-[#006B95]`
                }`}
              />
            </div>
            <div
              className={`${
                isReject ? `bg-gray-700` : `border-gray-700 border-2`
              } h-11 w-11 rounded-full flex items-center justify-center cursor-pointer mb-6`}
              onClick={() => setIsReject((prev) => !prev)}
            >
              <FontAwesomeIcon
                icon={faXmark}
                className={`text-3xl  ${
                  isReject ? `text-white` : `text-gray-700`
                }`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
