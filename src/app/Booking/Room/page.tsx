"use client";
import { Suspense } from "react";
import ClientNavbar from "@/app/ClientNavbar/page";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import "@ant-design/v5-patch-for-react-19";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "@/app/firebase/config";
import { format } from "date-fns";
import dayjs from "dayjs";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import Loading from "@/app/Loading/page";

interface Room {
  id?: string;
  Boarder_CreatedAt?: Timestamp | string;
  Boarder_Location?: string;
  Boarder_PaymentMethod?: string;
  Boarder_RoomDescription?: string;
  Boarder_RoomFeatures?: string;
  Boarder_RoomName?: string;
  Boarder_RoomPrice?: number;
  Boarder_TotalPrice?: number;
  Boarder_TypeOfRoom?: string;
  Boarder_UserFullName?: string;
  Boarder_UserID?: string;
}

export default function Room() {
  const [room, setRoom] = useState<Room | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>();
  const [typeOfPaymentArray, setTypeOfPaymentArray] = useState<string[] | null>(
    null
  );
  const [userUID, setUserUID] = useState("");

  console.log(userUID);
  console.log(userEmail);
  console.log(typeOfPaymentArray);

  // State to store search parameters after the component mounts
  const [params, setParams] = useState<{
    RoomID: string | null;
    CheckIn: string | null;
    CheckOut: string | null;
    Guests: string | null;
    Days: string | null;
  }>({
    RoomID: null,
    CheckIn: null,
    CheckOut: null,
    Guests: null,
    Days: null,
  });

  const searchParams = useSearchParams();

  useEffect(() => {
    setParams({
      RoomID: searchParams.get("RoomID"),
      CheckIn: searchParams.get("CheckIn"),
      CheckOut: searchParams.get("CheckOut"),
      Guests: searchParams.get("Guest"),
      Days: searchParams.get("Days"),
    });
  }, [searchParams]);

  const router = useRouter();
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
        setUserUID(user.uid);
      } else {
        router.push("/Login");
      }
    });

    return () => unsubscribe();
  });

  const formatDate = (date: string | null): string => {
    if (!date) return "";
    const dayjsDate = dayjs(date);
    const month = dayjsDate.format("MMMM"); // Full month name
    const day = dayjsDate.format("D"); // Day of the month
    const year = dayjsDate.format("YYYY"); // Year
    return `${month} ${day}, ${year}`;
  };

  const formattedCheckIn = formatDate(params.CheckIn);
  const formattedCheckOut = formatDate(params.CheckOut);

  const fetchRoomById = async (id: string) => {
    try {
      const docRef = doc(db, "board", id); // Replace "products" with your collection name
      const docSnap = await getDoc(docRef);

      console.log("Room: ", docSnap);

      if (docSnap.exists()) {
        // Spread all fields into the Product type and update state
        const fetchedRoom = { id: docSnap.id, ...docSnap.data() } as Room;
        setRoom(fetchedRoom);
        if (typeof fetchedRoom.Boarder_PaymentMethod === "string") {
          // If the features are stored as a string, split by comma and space to get the payment methods
          setTypeOfPaymentArray(fetchedRoom.Boarder_PaymentMethod.split(","));
        } else {
          // Fallback if it's already an array or null
          setTypeOfPaymentArray(fetchedRoom.Boarder_PaymentMethod || null);
        }
      } else {
        setRoom(null);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setRoom(null);
    }
  };

  useEffect(() => {
    if (params.RoomID) {
      fetchRoomById(params.RoomID); // Fetch product based on the ID from the link
    }
  });

  return (
    <Suspense fallback={<Loading />}>
      <ClientNavbar />
      <div className="mx-44 gap-4 mt-8">
        <div className=" grid grid-cols-2 gap-4">
          <div>
            <h1 className="font-montserrat text-base text-[#565656] font-bold">
              {room?.Boarder_RoomName}
            </h1>
            <h1 className="font-montserrat text-2xl font-bold">
              {room?.Boarder_TypeOfRoom}
            </h1>
          </div>
          <div className="flex justify-end">
            <a className="font-hind text-base font-bold text-end text-[#006B95]">
              Leave a Review
            </a>
          </div>
          <div className="h-96 flex justify-center items-center font-montserrat text-xl font-bold bg-white rounded-2xl drop-shadow-2xl">
            <h1 className="font-montserrat text-xl font-bold">
              Image of room {room?.Boarder_RoomName}
            </h1>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex justify-center items-center bg-white rounded-2xl drop-shadow-2xl">
              <h1 className="font-montserrat text-xl font-bold">
                Image of room {room?.Boarder_RoomName}
              </h1>
            </div>
            <div className="flex justify-center items-center bg-white rounded-2xl drop-shadow-2xl">
              <h1 className="font-montserrat text-xl font-bold">
                Image of room {room?.Boarder_RoomName}
              </h1>
            </div>
            <div className="flex justify-center items-center bg-white rounded-2xl drop-shadow-2xl">
              <h1 className="font-montserrat text-xl font-bold">
                Image of room {room?.Boarder_RoomName}
              </h1>
            </div>
            <div className="flex justify-center items-center bg-white rounded-2xl drop-shadow-2xl">
              <h1 className="font-montserrat text-xl font-bold">
                Image of room {room?.Boarder_RoomName}
              </h1>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 h-screen mt-4">
          <div className="col-span-2">
            <div className="flex flex-row gap-4 m-4 items-center">
              <div className="h-20 w-20 rounded-full drop-shadow-xl bg-white flex flex-row justify-center items-center">
                <h1 className="text-xs font-hind text-center">
                  Image of {room?.Boarder_UserFullName}
                </h1>
              </div>
              <div>
                <h1 className="font-hind text-base font-bold">
                  Hosted by: {room?.Boarder_UserFullName}
                </h1>
                <p className="font-hind text-base font-normal">
                  Posted available on:{" "}
                  {room?.Boarder_CreatedAt
                    ? (() => {
                        try {
                          // Handle Timestamp or string
                          const date =
                            typeof room.Boarder_CreatedAt === "object" &&
                            "toDate" in room.Boarder_CreatedAt
                              ? room.Boarder_CreatedAt.toDate()
                              : new Date(room.Boarder_CreatedAt);
                          return format(date, "MMMM dd, yyyy");
                        } catch (error) {
                          console.error("Error parsing date:", error);
                          return "Invalid date";
                        }
                      })()
                    : "Date not available"}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <h1 className="text-4xl font-hind">Description</h1>
              <p className="font-hind text-base leading-7">
                {room?.Boarder_RoomDescription}
              </p>
            </div>
          </div>
          <div className="mt-4 ">
            <div className="flex flex-col w-full bg-[#86B2B4] rounded-2xl h-[444px] ">
              <h1 className="font-montserrat font-bold text-3xl text-white m-4">
                Php {room?.Boarder_RoomPrice}{" "}
                <span className="font-montserrat text-xl font-normal">
                  / day
                </span>
              </h1>
              <div className="bg-[#DEE9E9] grid grid-cols-2 mx-4 rounded-xl">
                <div className="border-r-2 border-[#787E7E] pt-3 ml-3">
                  <p className="font-bold font-hind text-[#4E5656]">Check In</p>
                  <h1 className="font-hind text-[#4E5656]">
                    {formattedCheckIn}
                  </h1>
                </div>
                <div className="py-3 ml-3">
                  <p className="font-bold font-hind text-[#4E5656]">
                    Check Out
                  </p>
                  <h1 className="font-hind text-[#4E5656]">
                    {formattedCheckOut}
                  </h1>
                </div>
                <div className="border-b-2 col-span-2 border-[#787E7E]" />
                <div className="col-span-2 ml-3 py-2">
                  <h1 className="font-bold font-hind text-[#4E5656]">Guests</h1>
                  <p className="font-hind text-[#4E5656]">
                    {params.Guests} pet
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="mx-4 h-12 mt-4 bg-blue-300 text-white font-montserrat text-xl font-bold rounded-lg"
              >
                Book Now
              </button>
              <div className="grid grid-cols-2 mx-4 mt-4 gap-2">
                <p className="font-hind text-base text-white">
                  Php {room?.Boarder_RoomPrice} X {params.Days} / days
                </p>
                <h1 className="text-end font-bold font-hind text-base text-white">
                  Php {Number(room?.Boarder_RoomPrice) * Number(params.Days)}
                </h1>
                <p className=" font-hind text-base text-white">Hosting Fee</p>
                <h1 className="font-bold font-hind text-base text-white text-end">
                  Php 100
                </h1>
                <h1 className="font-hind font-bold text-lg text-white text mt-2">
                  Total Price
                </h1>
                <p className="font-hind font-bold text-lg text-white text-end mt-2">
                  Php{" "}
                  {Number(room?.Boarder_RoomPrice) * Number(params.Days) + 100}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
