import { auth } from "../firebase/config";
import Link from "next/link";

export default function Signout() {
  const signOut = async () => {
    const user = auth;
    try {
      await user
        .signOut()
        .then(() => {
          localStorage.clear();
          console.log("Signed out successfully.");
        })
        .catch((error) => {
          console.error("Error signing out: ", error);
        });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    auth.currentUser && (
      <button
        className="w-24 h-10 bg-blue-950 text-white text-base font-hind font-medium tracking-wide rounded-md drop-shadow-lg"
        onClick={() => signOut}
      >
        <Link href="/Login">Sign Out</Link>
      </button>
    )
  );
}
