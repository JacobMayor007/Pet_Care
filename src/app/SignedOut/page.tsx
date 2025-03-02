import { getAuth, signOut } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Signout() {
  const router = useRouter();

  const signOutFunction = async () => {
    const auth = getAuth();
    try {
      await signOut(auth).then(() => {
        router.push("/Login");
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <button
      className="w-24 h-10 bg-blue-950 text-white text-base font-hind font-medium tracking-wide rounded-md drop-shadow-lg"
      onClick={() => signOutFunction}
    >
      <Link href="/Login">Sign Out</Link>
    </button>
  );
}
