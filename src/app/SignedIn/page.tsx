import Image from "next/image";
import Link from "next/link";

export default function SignedIn() {
  return (
    <div>
      <nav className="h-20 flex flex-row justify-center items-center">
        <div className="flex items-center gap-16">
          <div className="flex items-center">
            <Image src="./Logo.svg" height={54} width={54} alt="Logo" />
            <h1 className="text-2xl font-sigmar font-normal text-[#006B95]">
              Pet Care
            </h1>
          </div>
          <ul className="list-type-none flex items-center gap-3">
            <li className="w-28 h-14 flex items-center justify-center">
              <a
                href="/Userpage"
                className="font-montserrat text-base text-[#006B95]"
              ></a>
            </li>
            <li className="w-28 h-14 flex items-center justify-center">
              <a
                href="/Inbox"
                className="font-montserrat text-base text-[#006B95]"
              ></a>
            </li>
            <li className="w-28 h-14 flex items-center justify-center">
              <a
                className="font-montserrat text-base text-[#006B95]"
                href="/Notifications"
              ></a>
            </li>
            <li className="w-36 h-14 flex items-center justify-center">
              <a
                className="font-montserrat text-base text-[#006B95]"
                href="/AddProduct"
              ></a>
            </li>
          </ul>
          <div className="flex items-center gap-4">
            <div className="relative cursor-pointer"></div>
            <h1 className="font-montserrat text-base text-[#006B95]">
              <Link href="/">Sign In</Link>
            </h1>
          </div>
        </div>
      </nav>
    </div>
  );
}
