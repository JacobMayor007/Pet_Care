"use client";

import { getAuth, signOut } from "firebase/auth";
import Link from "next/link";

export default function Signout() {
  const signOutFunction = () => {
    const auth = getAuth();
    try {
      signOut(auth).then(() => {
        console.log("Logged Out Successful");
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Link
      className="w-24 h-10 bg-blue-950 text-white text-base font-hind font-medium tracking-wide rounded-md drop-shadow-lg"
      href="/Login"
      onClick={() => signOutFunction}
    >
      Sign Out
    </Link>
  );
}
