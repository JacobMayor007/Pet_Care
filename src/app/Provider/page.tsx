"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Signout from "../SignedOut/page";
import { app } from "../firebase/config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import fetchProduct from "../fetchData/fetchProducts";

import {
  faArrowUp,
  faCircleChevronDown,
  faCircleUser,
  faFileShield,
  faPesoSign,
} from "@fortawesome/free-solid-svg-icons";

interface Product {
  id: string;
  PaymentMethod?: string;
  ProductDescription?: string;
  ProductFeatures?: string; // Assuming this is a string representation of an array or object
  ProductName?: string;
  ProductPrice?: string; // Assuming the price comes as a string from Firebase
  TotalPrice?: number;
  UserID?: string;
}

export default function Overview() {
  const [userId, setUserId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [logout, setLogout] = useState(false);

  useEffect(() => {
    const getProducts = async () => {
      const fetchedProducts = await fetchProduct();
      setProducts(fetchedProducts);
    };
    getProducts();
  }, []);

  console.log(products);

  const router = useRouter();
  const units: number = 240;
  const pendingUnits = 24;
  const pending: number = (pendingUnits / units) * 100;
  const shippedUnits = 96;
  const shipped: number = (shippedUnits / units) * 100;
  const deliveredUnits = 120;
  const delivered: number = (deliveredUnits / units) * 100;

  console.log(`${shipped} \n${delivered}\n${pending}`);

  useEffect(() => {
    const auth = getAuth(app);

    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Retrieve the user's unique ID
        setUserId(user.email);
      } else {
        // No user is signed in
        setUserId("");
        router.push("/");
      }
    });

    // Cleanup the subscription when the component is unmounted
    return () => unsubscribe();
  });

  return (
    <div className={userId ? `bg-[#FEFEFE] pb-5` : `hidden`}>
      <nav className="h-20 flex flex-row justify-center items-center">
        <div className="flex items-center gap-16 px-24">
          <div className="flex items-center w-44">
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
              >
                Dashboard
              </a>
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
              {userId}
            </h1>
          </div>
        </div>
      </nav>
      <div className="flex flex-col px-36 pt-10 pb-5 gap-4">
        <div className="grid grid-cols-3 grid-rows-[auto_135px] gap-4">
          <h1 className="col-span-3 font-montserrat font-bold text-4xl">
            This month&lsquo;s overview
          </h1>
          <div className="flex items-center justify-center flex-col bg-white drop-shadow-xl  shadow-black rounded-xl">
            <h1 className="text-[#26A2AB] text-3xl font-montserrat font-semibold">
              240
              <span className="ml-4">
                <FontAwesomeIcon
                  icon={faArrowUp}
                  className="text-[rgb(0,255,0)]"
                />
              </span>
            </h1>
            <p className="font-montserrat font-semibold text-lg text-[#565656]">
              Total Orders
            </p>
          </div>
          <div className="flex flex-col items-center justify-center bg-white drop-shadow-xl  shadow-black rounded-xl">
            <div className="flex flex-row gap-2">
              <FontAwesomeIcon
                icon={faPesoSign}
                className="text-3xl font-semibold font-montserrat text-[#26A2AB]"
              />{" "}
              <h1 className="text-3xl font-semibold font-montserrat text-[#26A2AB] tracking-widest">
                95460
              </h1>
              <FontAwesomeIcon
                icon={faArrowUp}
                className="text-[rgb(0,255,0)] text-3xl font-semibold font-montserrat ml-2"
              />
            </div>
            <p className="font-montserrat font-semibold text-lg text-[#565656]">
              Total Sell
            </p>{" "}
          </div>
          <div className="flex flex-col items-center justify-center bg-white drop-shadow-xl  shadow-black rounded-xl">
            <h1 className="text-3xl font-semibold font-montserrat text-[#26A2AB] tracking-widest">
              20
            </h1>
            <p className="font-montserrat font-semibold text-lg text-[#565656] ">
              Products Listed
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 grid-rows-[auto_135px] gap-4">
          <h1 className="col-span-3 font-montserrat font-bold text-4xl">
            Last Month&lsquo;s Overview
          </h1>
          <div className="flex items-center justify-center flex-col bg-white drop-shadow-xl  shadow-black rounded-xl">
            <h1 className="text-[#26A2AB] text-3xl font-montserrat font-semibold">
              225
            </h1>
            <p className="font-montserrat font-semibold text-lg text-[#565656]">
              Total Orders
            </p>
          </div>
          <div className="flex items-center justify-center flex-col bg-white drop-shadow-xl  shadow-black rounded-xl">
            <div className="flex flex-row gap-2">
              <FontAwesomeIcon
                icon={faPesoSign}
                className="text-3xl font-semibold font-montserrat text-[#26A2AB]"
              />
              <h1 className="text-3xl font-semibold font-montserrat text-[#26A2AB] tracking-widest">
                89460
              </h1>
              <FontAwesomeIcon
                icon={faArrowUp}
                className="text-[rgb(0,255,0)] text-3xl font-semibold font-montserrat ml-2"
              />
            </div>
            <p className="font-montserrat font-semibold text-lg text-[#565656]">
              Total Sell
            </p>
          </div>
          <div className="flex items-center justify-center flex-col bg-white drop-shadow-xl  shadow-black rounded-xl">
            <h1 className="text-3xl font-semibold font-montserrat text-[#26A2AB] tracking-widest">
              20
            </h1>
            <p className="font-montserrat font-semibold text-lg text-[#565656]">
              Products Listed
            </p>
          </div>
        </div>
        <div className="grid grid-cols-[30%_66%] gap-8 w-full h-full">
          <div>
            {" "}
            <h1 className="font-montserrat font-bold text-4xl row-span-1">
              Order Summary
            </h1>
            <div className="h-[572px] grid grid-rows-[140px_140px_140px] gap-14">
              <div className="bg-white drop-shadow-xl shadow-black rounded-xl p-5 flex flex-col gap-3">
                <p className="text-xl font-montserrat font-bold text-[#565656]">
                  Pending Orders
                </p>
                <div className="flex flex-row items-center justify-between ">
                  <h1 className="text-3xl font-hind font-semibold">
                    {pending}%
                  </h1>
                  <p className="font-montserrat font-bold text-lg text-[#565656]">
                    {pendingUnits} / {units}
                  </p>
                </div>
                <div className={`h-2 w-full bg-gray-300 rounded-full`}>
                  <div
                    className={`h-full bg-[#22A9FD] rounded-full`}
                    style={{ width: `${pending}%` }}
                  />
                </div>
              </div>
              <div className="bg-white drop-shadow-xl shadow-black rounded-xl p-5 flex flex-col gap-3">
                <p className="text-xl font-montserrat font-bold text-[#565656]">
                  Shipped Orders
                </p>
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-hind font-semibold">
                    {shipped}%
                  </h1>

                  <p className="font-montserrat font-bold text-lg text-[#565656]">
                    {shippedUnits} / {units}
                  </p>
                </div>
                <div className={`h-2 w-full bg-gray-300 rounded-full`}>
                  <div
                    className={`h-full bg-[#22A9FD] rounded-full`}
                    style={{ width: `${shipped}%` }}
                  />
                </div>
              </div>
              <div className="bg-white drop-shadow-xl shadow-black rounded-xl p-5 flex flex-col gap-3">
                <p className="text-xl font-montserrat font-bold text-[#565656]">
                  Delivered Orders
                </p>
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-hind font-semibold">
                    {delivered}
                  </h1>
                  <p className="font-montserrat font-bold text-lg text-[#565656]">
                    {deliveredUnits} / {units}
                  </p>
                </div>
                <div className={`h-2 w-full bg-gray-300 rounded-full`}>
                  <div
                    className={`h-full bg-[#22A9FD] rounded-full`}
                    style={{ width: `${shipped}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="h-[572px]">
            <h1>Review Orders</h1>
          </div>
        </div>
        <div className="pb-5">
          <div className="grid grid-cols-4 gap-6 grid-rows-[300px]">
            {products.map((data) => {
              return (
                <div
                  key={data?.id}
                  className="bg-white drop-shadow-xl shadow-black rounded-xl p-4 grid grid-rows-[110px_auto_auto_auto_auto]"
                >
                  <div className="flex justify-center ">
                    <FontAwesomeIcon icon={faFileShield} className="text-8xl" />
                  </div>
                  <h1 className="font-hind text-[#006B95] tracking-wide">
                    37 Orders {`(This month)`}
                  </h1>
                  <p className="text-[#565656] font-hind font-semibold text-sm">
                    {data?.ProductName}
                  </p>
                  <p className="text-sm font-hind font-semibold text-[#565656]">
                    <span>
                      <FontAwesomeIcon icon={faPesoSign} />
                    </span>
                    {data?.ProductPrice}
                  </p>
                  <button className="bg-[#006B95] text-white p-1 rounded-md">
                    Edit Item
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
