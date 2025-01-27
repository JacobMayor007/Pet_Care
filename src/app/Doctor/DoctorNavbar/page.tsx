"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Signout from "@/app/SignedOut/page";
import { useRouter } from "next/navigation";
import { faCircleChevronDown } from "@fortawesome/free-solid-svg-icons";
import {
  UserOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import Link from "next/link";

export default function DoctorNavigation() {
  const [logout, setLogout] = useState(false);
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

  return (
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
            <Link
              href="/Doctor"
              className="font-montserrat text-base text-[#006B95] font-bold"
            >
              Dashboard
            </Link>
          </li>
          <li className="w-28 h-14 flex items-center justify-center">
            <a
              href="/Patients"
              className="font-montserrat text-base text-[#006B95] font-bold"
            >
              Patients
            </a>
          </li>
          <li className="w-32 h-14 flex items-center justify-center px-2">
            <a
              href="/Appointments"
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
              Inbox
            </a>
          </li>
        </ul>
        <div className="flex items-center gap-4">
          <div className="relative  flex gap-2">
            <SearchOutlined className="text-[#006B95] font-bold text-lg cursor-pointer" />
            <UserOutlined className="text-[#006B95] font-bold text-lg cursor-pointer" />
            <ShoppingCartOutlined className="text-[#006B95] font-bold text-lg cursor-pointer" />
            <FontAwesomeIcon
              icon={faCircleChevronDown}
              className="absolute left-7 top-5 text-blue-950 cursor-pointer"
              onClick={() => setLogout((prev) => !prev)}
            />

            <div
              className={
                logout ? `flex absolute top-9 -left-3 cursor-pointer` : `hidden`
              }
              onClick={() => setLogout((prev) => !prev)}
            >
              <Signout />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
