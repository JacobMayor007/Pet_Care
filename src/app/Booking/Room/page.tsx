"use client";
import ClientNavbar from "@/app/ClientNavbar/page";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import "@ant-design/v5-patch-for-react-19";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "@/app/firebase/config";
import { format } from "date-fns";
import dayjs from "dayjs";
import Image from "next/image";
import {
  doc,
  DocumentData,
  getDoc,
  Timestamp,
  where,
  query,
  collection,
  getDocs,
  addDoc,
} from "firebase/firestore";
import Select from "react-select";
import { MultiValue } from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDirections } from "@fortawesome/free-solid-svg-icons";
import { Modal } from "antd";

interface Room {
  id?: string;
  Renter_CreatedAt?: Timestamp | string;
  Renter_Location?: string;
  Renter_PaymentMethod?: string;
  Renter_RoomDescription?: string;
  Renter_RoomFeatures?: string;
  Renter_RoomName?: string;
  Renter_RoomPrice?: number;
  Renter_TotalPrice?: number;
  Renter_TypeOfRoom?: string;
  Renter_UserFullName?: string;
  Renter_UserID?: string;
  Renter_UserEmail?: string;
}

interface Feature {
  id: string;
  name: string;
  price: string;
}

interface Option {
  value: string;
  label: string;
  name: string;
}

export default function Room() {
  const [selectedFeatures, setSelectedFeatures] = useState<Option[]>([]);
  const handleChange = (selectedOptions: MultiValue<Option>) => {
    setSelectedFeatures(selectedOptions as Option[]);
  };
  const [restrictions, setRestrictions] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [room, setRoom] = useState<Room | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>();
  const [typeOfPayment, setTypeOfPayment] = useState("");
  const [userData, setUserData] = useState<DocumentData[]>([]);
  const [checkInDate, setCheckInDate] = useState<string | null>("");
  const [checkOutDate, setCheckOutDate] = useState<string | null>("");
  const [checkInTime, setCheckInTime] = useState<string | null>("");
  const [checkOutTime, setCheckOutTime] = useState<string | null>("");
  const [guest, setGuest] = useState<number | null>(0);
  const [days, setDays] = useState<number | null>(0);
  const [roomID, setRoomID] = useState<string | null>("");

  // const roomID = useRoomSearchParams().RoomID;
  // console.log("room ID on search Params", roomID);
  // const checkInDate = useRoomSearchParams().CheckInDate;
  // console.log("checkInDate on search Params", checkInDate);
  // const checkOutDate = useRoomSearchParams().CheckOutDate;
  // const checkInTime = useRoomSearchParams().CheckInTime;
  // const checkOutTime = useRoomSearchParams().CheckOutTime;
  // const guest = useRoomSearchParams().Guest;
  // const days = useRoomSearchParams().Days;

  const [typeOfPaymentArray, setTypeOfPaymentArray] = useState<string[] | null>(
    null
  );
  const [userUID, setUserUID] = useState("");
  const router = useRouter();

  useEffect(() => {
    console.log("userEmail:", userEmail);
    console.log("userId:", userUID);

    const fetchUserData = async () => {
      try {
        if (userEmail && userUID) {
          // Query the Users collection with both conditions
          const userQuery = query(
            collection(db, "Users"),
            where("User_Email", "==", userEmail),
            where("User_UID", "==", userUID)
          );

          // Execute the query
          const querySnapshot = await getDocs(userQuery);

          if (!querySnapshot.empty) {
            // Extract all fields for the matching document(s)
            const userData = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            setUserData(userData);
          } else {
            console.log("No matching user found.");
          }
        } else {
          console.log("userEmail or userId is missing");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [userEmail, userUID]);

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCheckInDate = localStorage.getItem("Check In Date");
      const storedCheckOutDate = localStorage.getItem("Check Out Date");
      const storedCheckInTime = localStorage.getItem("Check In Time");
      const storedCheckOutTime = localStorage.getItem("Check Out Time");
      const storedRoomID = localStorage.getItem("RoomID");
      const storedDays = Number(localStorage.getItem("Days"));
      const storedGuests = Number(localStorage.getItem("Guest"));

      const parsedCheckInDate =
        storedCheckInDate && storedCheckInDate !== "undefined"
          ? JSON.parse(storedCheckInDate)
          : null;
      const parsedCheckOutDate =
        storedCheckOutDate && storedCheckOutDate !== "undefined"
          ? JSON.parse(storedCheckOutDate)
          : null;
      const parsedCheckInTime =
        storedCheckInTime && storedCheckInTime !== "undefined"
          ? JSON.parse(storedCheckInTime as string)
          : null;
      const parsedCheckOutTime =
        storedCheckOutTime && storedCheckOutTime !== "undefined"
          ? JSON.parse(storedCheckOutTime as string)
          : null;

      setRoomID(storedRoomID);
      console.log("Room ID on local storage", storedRoomID);
      setCheckInDate(parsedCheckInDate);
      setCheckOutDate(parsedCheckOutDate);
      setCheckInTime(parsedCheckInTime);
      setCheckOutTime(parsedCheckOutTime);
      setDays(storedDays);
      setGuest(storedGuests);
    }
  }, []);

  const formatDate = (date: string | null): string => {
    if (!date) return "Invalid Date";
    const dayjsDate = dayjs(date);
    if (!dayjsDate.isValid()) {
      console.error("Invalid date", date);
      return "";
    }

    const month = dayjsDate.format("MMMM"); // Full month name
    const day = dayjsDate.format("D"); // Day of the month
    const year = dayjsDate.format("YYYY"); // Year
    return `${month} ${day}, ${year}`;
  };

  const formattedCheckIn = formatDate(checkInDate || "");
  const formattedCheckOut = formatDate(checkOutDate || "");

  const formatTime = (date: string | null): string => {
    if (!date) return "Invalid Time";

    const dayjsDate = dayjs(date);

    if (!dayjsDate.isValid()) {
      console.error("Invalid date", date);
      return "Invalid Time";
    }

    const formattedTime = dayjsDate.format("h:mm A");
    return formattedTime;
  };

  const calculatedTime = (
    checkIn: string | null,
    checkOut: string | null
  ): number => {
    if (!checkIn || !checkOut) return 0;
    const checkInTime = dayjs(checkIn);
    const checkOutTime = dayjs(checkOut);

    if (!checkInTime.isValid() || !checkOutTime.isValid()) {
      console.error("Invalid date range", { checkIn, checkOut });
      return 0;
    }

    const diffInHours = checkOutTime.diff(checkInTime, "hour", true);
    return diffInHours >= 1 ? Math.ceil(diffInHours / 24) : 0;
  };

  const formattedCheckInTime = formatTime(checkInTime);
  const formattedCheckOutTime = formatTime(checkOutTime);

  const timeCalculated = calculatedTime(checkInTime, checkOutTime);

  const fetchRoomById = async (id: string) => {
    try {
      setLoadingPage(true);

      const docRef = doc(db, "board", id); // Replace "products" with your collection name
      const docSnap = await getDoc(docRef);

      console.log("Room: ", docSnap);

      if (docSnap.exists()) {
        // Spread all fields into the Product type and update state
        const fetchedRoom = { id: docSnap.id, ...docSnap.data() } as Room;
        setRoom(fetchedRoom);
        if (typeof fetchedRoom.Renter_PaymentMethod === "string") {
          setTypeOfPaymentArray(
            fetchedRoom.Renter_PaymentMethod.split(/\s*,\s*/)
          );
        } else if (Array.isArray(fetchedRoom.Renter_PaymentMethod)) {
          setTypeOfPaymentArray(fetchedRoom.Renter_PaymentMethod);
        } else {
          setTypeOfPaymentArray([]);
        }
      } else {
        setRoom(null);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setRoom(null);
    } finally {
      setLoadingPage(false);
    }
  };

  useEffect(() => {
    if (roomID) {
      fetchRoomById(roomID); // Fetch room based on the ID from the link
    }
  }, [roomID]);

  const handleSubmitRoom = async () => {
    const fullName = userData
      .map((user) => `${user.User_FName} ${user.User_LName}`)
      .join(",");

    try {
      setLoadingPage(true);
      const roomRef = collection(db, "boarders");

      const addRef = await addDoc(roomRef, {
        BC_BoarderFullName: fullName,
        BC_BoarderEmail: userEmail,
        BC_BoarderBoardedAt: Timestamp.now(),
        BC_BoarderCheckInTime: checkInTime,
        BC_BoarderCheckOutTime: checkOutTime,
        BC_BoarderCheckInDate: checkInDate,
        BC_BoarderCheckOutDate: checkOutDate,
        BC_BoarderChoiceFeature: selectedFeatures,
        BC_BoarderDays: days,
        BC_BoarderDietaryRestrictions: restrictions,
        BC_BoarderGuest: guest,
        BC_BoarderStatus: "Pending",
        BC_BoarderUpdated: Timestamp.now(),
        BC_BoarderTypeRoom: room?.Renter_TypeOfRoom,
        BC_RenterFullName: room?.Renter_UserFullName,
        BC_RenterRoomName: room?.Renter_RoomName,
        BC_RenterPrice: room?.Renter_RoomPrice,
        BC_RenterLocation: room?.Renter_Location,
        BC_RenterEmail: room?.Renter_UserEmail,
      });

      console.log("Document ID of Adding boarder", addRef.id);
    } catch (error) {
      console.error("There is an error on adding Boarder", error);
    } finally {
      setLoadingPage(false);
    }
  };

  const features: Feature[] = room?.Renter_RoomFeatures
    ? JSON.parse(room?.Renter_RoomFeatures)
    : [];

  const options = features.map((feature: Feature) => ({
    value: feature.price,
    name: feature.name,
    label: `${feature.name} - Php ${feature.price}`,
  }));

  if (loadingPage) {
    return <LoadingPage />;
  }

  return (
    <div className={loadingPage ? `invisible` : `visible`}>
      <ClientNavbar />
      <div className="mx-44 gap-4 mt-8">
        <div className=" grid grid-cols-2 gap-4">
          <div>
            <h1 className="font-montserrat text-base text-[#565656] font-bold">
              {room?.Renter_RoomName}
            </h1>
            <h1 className="font-montserrat text-2xl font-bold">
              {room?.Renter_TypeOfRoom}
            </h1>
          </div>
          <div className="flex justify-end">
            <a className="font-hind text-base font-bold text-end text-[#006B95]">
              Leave a Review
            </a>
          </div>
          <div className="h-96 flex justify-center items-center font-montserrat text-xl font-bold bg-white rounded-2xl drop-shadow-2xl">
            <h1 className="font-montserrat text-xl font-bold">
              Image of room {room?.Renter_RoomName}
            </h1>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex justify-center items-center bg-white rounded-2xl drop-shadow-2xl">
              <h1 className="font-montserrat text-xl font-bold">
                Image of room {room?.Renter_RoomName}
              </h1>
            </div>
            <div className="flex justify-center items-center bg-white rounded-2xl drop-shadow-2xl">
              <h1 className="font-montserrat text-xl font-bold">
                Image of room {room?.Renter_RoomName}
              </h1>
            </div>
            <div className="flex justify-center items-center bg-white rounded-2xl drop-shadow-2xl">
              <h1 className="font-montserrat text-xl font-bold">
                Image of room {room?.Renter_RoomName}
              </h1>
            </div>
            <div className="flex justify-center items-center bg-white rounded-2xl drop-shadow-2xl">
              <h1 className="font-montserrat text-xl font-bold">
                Image of room {room?.Renter_RoomName}
              </h1>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 h-full mt-4">
          <div className="col-span-2">
            <div className="flex flex-row gap-4 m-4 items-center">
              <div className="h-20 w-20 rounded-full drop-shadow-xl bg-white flex flex-row justify-center items-center">
                <h1 className="text-xs font-hind text-center">
                  Image of {room?.Renter_UserFullName}
                </h1>
              </div>
              <div>
                <h1 className="font-hind text-base font-bold">
                  Hosted by: {room?.Renter_UserFullName}
                </h1>
                <p className="font-hind text-base font-normal">
                  Posted available on:{" "}
                  {room?.Renter_CreatedAt
                    ? (() => {
                        try {
                          // Handle Timestamp or string
                          const date =
                            typeof room.Renter_CreatedAt === "object" &&
                            "toDate" in room.Renter_CreatedAt
                              ? room.Renter_CreatedAt.toDate()
                              : new Date(room.Renter_CreatedAt);
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
                {room?.Renter_RoomDescription}
              </p>

              <div className="grid grid-cols-3 gap-2 my-3 mr-3 bg-white drop-shadow-lg pl-5 pr-1 py-10 rounded-xl">
                {typeOfPaymentArray?.map((data, index) => {
                  return (
                    <div
                      key={index}
                      className="flex flex-row items-center gap-2 "
                    >
                      <input
                        type="radio"
                        name="payment-method"
                        id={data}
                        value={data}
                        checked={typeOfPayment === data}
                        onChange={() => setTypeOfPayment(data)}
                        className="cursor-pointer"
                      />
                      <Image
                        src={`/${data} Image.svg`}
                        height={30}
                        width={30}
                        alt={data}
                      />
                      <label
                        htmlFor={data}
                        className="font-montserrat font-semibold text-base cursor-pointer"
                      >
                        {data}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="mt-4 ">
            <div className="flex flex-col w-full bg-[#86B2B4] rounded-2xl h-[444px] ">
              <h1 className="font-montserrat font-bold text-3xl text-white m-4">
                Php {room?.Renter_RoomPrice}{" "}
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
                  <p className="font-hind text-[#4E5656] text-sm font-medium">
                    {formattedCheckInTime}
                  </p>
                </div>
                <div className="py-3 ml-3">
                  <p className="font-bold font-hind text-[#4E5656]">
                    Check Out
                  </p>
                  <h1 className="font-hind text-[#4E5656]">
                    {formattedCheckOut}
                  </h1>
                  <p className="font-hind text-[#4E5656] text-sm font-medium">
                    {formattedCheckOutTime}
                  </p>
                </div>
                <div className="border-b-2 col-span-2 border-[#787E7E]" />
                <div className="col-span-2 ml-3 py-2">
                  <h1 className="font-bold font-hind text-[#4E5656]">Guests</h1>
                  <p className="font-hind text-[#4E5656]">{guest} pet</p>
                </div>
              </div>
              <button
                type="button"
                className="mx-4 h-12 mt-4 bg-blue-300 text-white font-montserrat text-xl font-bold rounded-lg"
                onClick={() => {
                  setConfirm(true);
                  setLoading(true);
                }}
              >
                {loading ? `Booking` : `Book Now`}
              </button>
              <Modal
                open={confirm}
                onOk={handleSubmitRoom}
                onCancel={() => setConfirm(false)}
                style={{
                  marginTop: "120px",
                }}
              >
                <p className="font-hind text-base">
                  Do you wish to book {room?.Renter_RoomName}?
                </p>
              </Modal>

              <div className="grid grid-cols-2 mx-4 mt-4 gap-2">
                <p className="font-hind text-base text-white">
                  Php {room?.Renter_RoomPrice} X {days} / days
                </p>
                <h1 className="text-end font-bold font-hind text-base text-white">
                  Php{" "}
                  {timeCalculated === 1 || timeCalculated > 1
                    ? Number(room?.Renter_RoomPrice) * 1
                    : Number(room?.Renter_RoomPrice) * Number(days)}
                </h1>
                <p className=" font-hind text-base text-white">Hosting Fee</p>
                <h1 className="font-bold font-hind text-base text-white text-end">
                  Php 100
                </h1>
                <h1 className="font-hind font-bold text-lg text-white text mt-2">
                  Total Price
                </h1>
                <p className="font-hind font-bold text-lg text-white text-end mt-2">
                  Php {Number(room?.Renter_RoomPrice) * Number(days) + 100}
                </p>
              </div>
            </div>
            <Select
              id="features"
              isMulti
              name="features"
              options={options}
              value={selectedFeatures}
              onChange={handleChange}
              getOptionLabel={(e) => e.label}
              getOptionValue={(e) => e.value}
              className="mt-2 cursor-pointer"
              placeholder="Select features"
              styles={{
                control: (provided) => ({
                  ...provided,
                  backgroundColor: "white",
                  borderRadius: "8px",
                  fontFamily: "Hind, sans-serif",
                  outlineColor: "white",
                  cursor: "pointer",
                  filter:
                    " drop-shadow(0 20px 13px rgb(0 0 0 / 0.03)) drop-shadow(0 8px 5px rgb(0 0 0 / 0.08));",
                }),
                multiValue: (provided) => ({
                  ...provided,
                  backgroundColor: "white",
                  fontFamily: "Hind, sans-serif", // Use Hind font here
                  outlineColor: "white",
                }),
              }}
            />

            <div className="mt-4">
              <label
                htmlFor="dietary-restrictions"
                className="font-montserrat font-bold text-xl text-[#262626]"
              >
                Dietary Restrictions
              </label>
              <input
                value={restrictions}
                onChange={(e) => setRestrictions(e.target.value)}
                type="text"
                name="restrictions"
                id="dietary-restrictions"
                className="h-12 w-full outline-none p-2 font-hind text-black items-center text-lg bg-white rounded-xl drop-shadow-xl"
                placeholder="Ex. Peanuts, Chocolate, Eggplant"
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-8 my-8 ">
          <h1 className="col-span-3 text-4xl font-hind ">Where To Find?</h1>
          <div className="col-span-2 flex justify-center items-center h-44 bg-white rounded-xl drop-shadow-xl">
            Image Location of {room?.Renter_Location}
          </div>
          <div className=" flex flex-col justify-between py-2">
            <h1 className="font-montserrat font-bold text-base">
              Location name of the board
            </h1>
            <p className="font-montserrat">{room?.Renter_Location}</p>

            <div>
              <a
                href={`https://www.google.com/maps?q=${encodeURIComponent(
                  room?.Renter_Location || ""
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-montserrat font-bold text-lg text-white bg-blue-800 rounded-full py-4 px-12 active:scale-95 ease-in-out transition-all duration-75 transform"
              >
                <span>
                  <FontAwesomeIcon icon={faDirections} />
                </span>{" "}
                Get Directions
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingPage() {
  return (
    <div className="bg-slate-100 pt-4">
      <nav className="mx-44 gap-8 h-full flex flex-row items-center  animate-pulse">
        <ul className="flex flex-row h-full items-center gap-4">
          <li className="bg-slate-300 drop-shadow-xl rounded-full h-14 w-14" />
          <li className="bg-slate-300 h-10 w-32 drop-shadow-xl rounded-xl" />
        </ul>
        <ul className="flex flex-row h-full items-center gap-4">
          <li className="bg-slate-300 h-8 w-32 drop-shadow-xl rounded-xl"></li>
          <li className="bg-slate-300 h-8 w-32 drop-shadow-xl rounded-xl"></li>
          <li className="bg-slate-300 h-8 w-32 drop-shadow-xl rounded-xl"></li>
          <li className="bg-slate-300 h-8 w-32 drop-shadow-xl rounded-xl"></li>
        </ul>
        <ul className="flex flex-row h-full items-center gap-4">
          <li className="bg-slate-300 drop-shadow-xl rounded-full h-7 w-7" />
          <li className="bg-slate-300 drop-shadow-xl rounded-full h-7 w-7" />
          <li className="bg-slate-300 drop-shadow-xl rounded-full h-7 w-7" />
        </ul>
      </nav>
      <div className="mx-44 gap-4 mt-8 animate-pulse">
        <div className=" grid grid-cols-2 gap-4">
          <div>
            <h1 className="font-montserrat text-base text-[#565656] font-bold"></h1>
            <h1 className="font-montserrat text-2xl font-bold"></h1>
          </div>
          <div className="flex justify-end">
            <a className="font-hind text-base font-bold text-end text-[#006B95]"></a>
          </div>
          <div className="h-96 flex justify-center items-center font-montserrat text-xl font-bold bg-slate-300 rounded-2xl drop-shadow-2xl">
            <h1 className="font-montserrat text-xl font-bold"></h1>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex justify-center items-center bg-slate-300 rounded-2xl drop-shadow-2xl">
              <h1 className="font-montserrat text-xl font-bold"></h1>
            </div>
            <div className="flex justify-center items-center bg-slate-300 rounded-2xl drop-shadow-2xl">
              <h1 className="font-montserrat text-xl font-bold"></h1>
            </div>
            <div className="flex justify-center items-center bg-slate-300 rounded-2xl drop-shadow-2xl">
              <h1 className="font-montserrat text-xl font-bold"></h1>
            </div>
            <div className="flex justify-center items-center bg-slate-300 rounded-2xl drop-shadow-2xl">
              <h1 className="font-montserrat text-xl font-bold"></h1>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 h-full mt-4 animate-pulse">
          <div className="col-span-2">
            <div className="flex flex-row gap-4 m-4 items-center">
              <div className="h-20 w-20 rounded-full drop-shadow-xl bg-slate-300 flex flex-row justify-center items-center">
                <h1 className="text-xs font-hind text-center"></h1>
              </div>
              <div>
                <h1 className="font-hind text-base font-bold"></h1>
                <p className="font-hind text-base font-normal"> </p>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <h1 className="text-4xl font-hind"></h1>
              <p className="font-hind text-base leading-7"></p>

              <div className="grid grid-cols-3 gap-2 mt-10 mx-8 bg-slate-300 drop-shadow-lg pl-5 py-10 rounded-xl"></div>
            </div>
          </div>
          <div className="mt-4 animate-pulse">
            <div className="flex flex-col w-full bg-slate-300 drop-shadow-xl rounded-2xl h-[444px] ">
              <h1 className="font-montserrat font-bold text-3xl text-white m-4"></h1>
              <div className="bg-slate-200 grid grid-cols-2 mx-4 rounded-xl">
                <div className="border-r-2 border-slate-300 pt-3 ml-3">
                  <p className="font-bold font-hind text-[#4E5656]"> </p>
                  <h1 className="font-hind text-[#4E5656]"></h1>
                  <p className="font-hind text-[#4E5656] text-sm font-medium"></p>
                </div>
                <div className="py-3 ml-3">
                  <p className="font-bold font-hind text-[#4E5656]"></p>
                  <h1 className="font-hind text-[#4E5656]"></h1>
                  <p className="font-hind text-[#4E5656] text-sm font-medium"></p>
                </div>
                <div className="border-b-2 col-span-2 border-slate-300" />
                <div className="col-span-2 ml-3 py-2">
                  <h1 className="font-bold font-hind text-[#4E5656]"></h1>
                  <p className="font-hind text-[#4E5656]"> </p>
                </div>
              </div>
              <button
                type="button"
                className="mx-4 h-12 mt-4 bg-slate-200 text-white font-montserrat text-xl font-bold rounded-lg"
              ></button>
              <div className="grid grid-cols-2 mx-4 mt-4 gap-2">
                <p className="font-hind text-base text-white"></p>
                <h1 className="text-end font-bold font-hind text-base text-white"></h1>
                <p className=" font-hind text-base text-white"></p>
                <h1 className="font-bold font-hind text-base text-white text-end"></h1>
                <h1 className="font-hind font-bold text-lg text-white text mt-2"></h1>
                <p className="font-hind font-bold text-lg text-white text-end mt-2"></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
