import { auth } from "../firebase/config";
import Link from "next/link";

export default function Signout() {
  return (
    auth.currentUser && (
      <button
        className="w-24 h-10 bg-blue-950 text-white text-base font-hind font-medium tracking-wide rounded-md drop-shadow-lg"
        onClick={() => {
          auth
            .signOut()
            .then(() => {
              localStorage.clear();
              console.log("Signed out successfully.");
            })
            .catch((error) => {
              console.error("Error signing out: ", error);
            });
        }}
      >
        <Link href="/Login">Sign Out</Link>
      </button>
    )
  );
}
