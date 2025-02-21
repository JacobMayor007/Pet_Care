"use client";
import Link from "next/link";
import fetchUserData from "@/app/fetchData/fetchUserData";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { BellOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { DocumentData } from "firebase/firestore";
import Signout from "@/app/SignedOut/page";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

const RentersNavigation = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<DocumentData[]>([]);
  const [logout, setLogout] = useState(false);

  useEffect(() => {
    const getUserData = async () => {
      const user = await fetchUserData();
      setUserData(user);
    };

    getUserData();
  }, []);

  return (
    <nav className="h-20 flex flex-row justify-center items-center z-[2]">
      <div className="flex items-center justify-center gap-16 px-14 w-full">
        <div
          className="flex items-center cursor-pointer"
          onClick={() => {
            {
              router.push("/");
            }
          }}
        >
          <Image src="/Logo.svg" height={54} width={54} alt="Logo" />
          <h1 className="text-2xl font-sigmar font-normal text-[#006B95]">
            Pet Care
          </h1>
        </div>
        <ul className="list-type-none flex items-center gap-3">
          <Link href="/Renter" passHref legacyBehavior>
            <li className="w-28 h-14 flex items-center justify-center">
              <a className="font-montserrat text-base text-[#006B95] font-bold">
                Dashboard
              </a>
            </li>
          </Link>
          <Link href="/Renter/ListOfRooms" passHref legacyBehavior>
            <li className="w-28 h-14 flex items-center justify-center">
              <a className="font-montserrat text-base text-[#006B95] font-bold">
                List Of Rooms
              </a>
            </li>
          </Link>
          <li className="w-fit h-14 flex items-center justify-center px-2">
            <a
              href="/AddRoom"
              className="font-montserrat text-base text-[#006B95] font-bold"
            >
              Add New Room
            </a>
          </li>
          <Link href="/Renter/Transactions" passHref legacyBehavior>
            <li className="w-28 h-14 flex items-center justify-center">
              <a className="font-montserrat text-base text-[#006B95] font-bold">
                Transactions
              </a>
            </li>
          </Link>

          <Link href="/Renter/Messages" passHref legacyBehavior>
            <li className="w-28 h-14 flex items-center justify-center">
              <a className="font-montserrat text-base text-[#006B95] font-bold">
                Messages
              </a>
            </li>
          </Link>
        </ul>
        <div className="flex flex-row gap-4 relative">
          <BellOutlined className="text-lg text-[#006B95] font-bold cursor-pointer" />
          <h1
            className="font-montserrat font-bold text-[#006B95] cursor-pointer"
            onClick={() => setLogout((prev) => !prev)}
          >
            {userData[0]?.User_Name} <FontAwesomeIcon icon={faChevronDown} />
          </h1>
          {logout ? (
            <div className="absolute left-12 top-8">
              {" "}
              <Signout />{" "}
            </div>
          ) : (
            <div className="hidden" />
          )}
        </div>
      </div>
    </nav>
  );
};

export default RentersNavigation;
