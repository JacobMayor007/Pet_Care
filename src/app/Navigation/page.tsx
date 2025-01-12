"use client";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Signout from "../SignedOut/page";
import {
  faCircleChevronDown,
  faCircleUser,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Navigation() {
  const [logout, setLogout] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>();
  const auth = getAuth();
  const router = useRouter();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        router.push("/Login");
      }
    });

    return () => unsubscribe();
  });

  return (
    <div>
      <nav className="h-20 flex flex-row justify-center items-center">
        <div className="flex items-center gap-16">
          <div className="flex items-center">
            <Image src="/Logo.svg" height={54} width={54} alt="Logo" />
            <h1 className="text-2xl font-sigmar font-normal text-[#006B95]">
              Pet Care
            </h1>
          </div>
          <ul className="list-type-none flex items-center gap-3">
            <li className="w-28 h-14 flex items-center justify-center">
              <Link
                href="/"
                className="font-montserrat text-base text-[#006B95]"
              >
                Dashboard
              </Link>
            </li>
            <li className="w-28 h-14 flex items-center justify-center">
              <a
                href="/Inbox"
                className="font-montserrat text-base text-[#006B95]"
              >
                Inbox
              </a>
            </li>
            <li className="w-28 h-14 flex items-center justify-center">
              <a
                className="font-montserrat text-base text-[#006B95]"
                href="/Notifications"
              >
                Notifications
              </a>
            </li>
            <li className="w-36 h-14 flex items-center justify-center">
              <a
                className="font-montserrat text-base text-[#006B95]"
                href="/AddProduct"
              >
                Add New Product
              </a>
            </li>
            <li className="w-36 h-14 flex items-center justify-center">
              <a
                className="font-montserrat text-base text-[#006B95]"
                href="/AddRoom"
              >
                Add New Room
              </a>
            </li>
          </ul>
          <div className="flex items-center gap-4">
            <div className="relative cursor-pointer">
              <FontAwesomeIcon
                icon={faCircleUser}
                className="text-blue-950 text-3xl"
              />
              <FontAwesomeIcon
                icon={faCircleChevronDown}
                className="absolute left-5 top-5 text-blue-950"
                onClick={() => setLogout((prev) => !prev)}
              />
              <div
                className={logout ? `flex absolute top-9 -left-6` : `hidden`}
                onClick={() => setLogout((prev) => !prev)}
              >
                <Signout />
              </div>
            </div>

            <h1 className="font-montserrat text-base text-[#006B95]">
              {userEmail}
            </h1>
          </div>
        </div>
      </nav>
    </div>
  );
}
