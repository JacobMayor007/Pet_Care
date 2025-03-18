"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEyeSlash,
  faXmark,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import {
  BellOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import * as Notifications from "@/app/fetchData/User/fetchNotification";
import { useEffect, useRef, useState } from "react";
import fetchUserData from "@/app/fetchData/fetchUserData";
import Link from "next/link";
import Signout from "@/app/SignedOut/page";
import { Modal } from "antd";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/app/firebase/config";
import React from "react";
import Loading from "@/app/Loading/page";
import { handleLikedPets } from "./match";
import dayjs, { Dayjs } from "dayjs";

interface Notifications {
  id?: string;
  createdAt?: string;
  appointment_ID?: string;
  order_ID?: string;
  room_ID?: string;
  message?: string;
  sender?: string;
  receiver?: string;
  status?: string;
  open?: boolean;
  title?: string;
  type?: string;
  hide?: boolean;
}

interface MatchingNotifications {
  id?: string;
  hide?: boolean;
  open?: boolean;
  message?: string;
  receiverEmail?: string[];
  receiverUid?: string[];
  senderEmail?: string;
  status?: string;
  timestamp?: Dayjs | null;
}

interface petId {
  params: Promise<{ id: string }>;
}

interface PetToMatch {
  id?: string;
  about_pet?: string;
  pet_UID?: string;
  pet_age?: {
    month?: number;
    year?: number;
  };
  pet_name?: string;
  pet_ownerEmail?: string;
  pet_ownerName?: string;
  pet_ownerUID?: string;
  pet_sex?: string;
}

export default function FoundMyBuddy({ params }: petId) {
  const { id } = React.use(params);
  const userRef = useRef<HTMLDivElement | null>(null);
  const [petToMatch, setPetToMatch] = useState<PetToMatch[]>([]);
  const [showNotif, setShowNotif] = useState(false);
  const [logout, setLogout] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userUID, setUserUID] = useState("");
  const [dropDown, setDropDown] = useState(false);
  const [isHeart, setIsHeart] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(3);
  const [isReject, setIsReject] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getUserData = async () => {
      const user = await fetchUserData();
      if (!user[0]?.User_UID) {
        router.push("/Login");
      }
      setUserUID(user[0]?.User_UID);
      setUserEmail(user[0]?.User_Email);
    };
    getUserData();
  }, [userUID, router]);

  useEffect(() => {
    const closeUserDropdown = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setLogout(false);
        setShowNotif(false);
        setDropDown(false);
      }
    };

    document.body.addEventListener("mousedown", closeUserDropdown);

    return () => {
      document.body.removeEventListener("mousedown", closeUserDropdown);
    };
  }, []);

  useEffect(() => {
    const getPetsToMatch = async () => {
      let likedPETID: string = "";

      try {
        const matchQuery = query(
          collection(db, "matches"),
          where("matchedPetWith", "array-contains", id)
        );

        const matchesSnapshot = await getDocs(matchQuery);
        const matchedPetIds = matchesSnapshot.docs.flatMap(
          (doc) => doc.data().matchedPetWith || []
        );

        console.log("MY MATCHES: ", matchedPetIds);

        const matchSnapshot = await getDocs(matchQuery);

        if (!matchSnapshot.empty) {
          const matchDoc = matchSnapshot.docs[0]; // Get the first match
          const matchData = matchDoc.data();
          likedPETID = matchData.likedpetId;
        } else {
          console.log("No matching document found.");
        }
        console.log("LIKED PET ID FRONT END:", likedPETID);
        const rejectsQuery = query(
          collection(db, "rejects"),
          where("userUID", "==", userUID),
          where("petId", "==", id)
        );
        const rejectsSnapshot = await getDocs(rejectsQuery);
        const rejectsPetId = rejectsSnapshot.docs.map(
          (doc) => doc.data().rejectedPetId
        );

        const myPetsQuery = query(
          collection(db, "pet-to-match"),
          where("pet_UID", "==", id)
        );

        const myPetSnapshot = await getDocs(myPetsQuery);
        const myPets = myPetSnapshot.docs.map((doc) => doc.data().pet_UID);

        const excludedPetIds = [
          ...matchedPetIds,
          ...rejectsPetId,
          ...myPets,
          likedPETID,
        ];

        console.log(excludedPetIds);

        let filteredPets = [];

        const petsQuery = collection(db, "pet-to-match");
        const petsSnapshot = await getDocs(petsQuery);
        const allPets = petsSnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as PetToMatch)
        );

        filteredPets = allPets.filter(
          (pet) => !excludedPetIds.includes(pet.pet_UID)
        );
        filteredPets = filteredPets.sort(() => Math.random() - 0.5);

        setPetToMatch(filteredPets);
        setCurrentIndex(0);
      } catch (error) {
        console.error(error);
      }
    };

    getPetsToMatch();
  }, [userUID, id]);

  const myHeartedPets = async (likedPetId: string) => {
    try {
      setLoading(true);
      const data = petToMatch.length;
      const randomizedData = Math.floor(Math.random() * data);
      setCurrentIndex(randomizedData);
      handleLikedPets(id, userUID, likedPetId, userEmail);
    } catch (error) {
      console.error(error);
    } finally {
      setInterval(() => {
        setLoading(false);
      }, 2000);
      setInterval(() => {
        setIsHeart(false);
      }, 2000);
    }
  };

  console.log(currentIndex);

  return (
    <div className="h-screen relative bg-red-50">
      <Modal></Modal>

      <nav className="h-16 flex flex-row items-center justify-between w-full pr-32 pl-24 fixed z-20 top-0">
        <div className="flex flex-row items-center gap-7">
          <FontAwesomeIcon
            icon={faXmark}
            className="text-xl text-red-900 cursor-pointer"
            onClick={() => window.history.back()}
          />
          <h1 className="bg-gradient-to-r from-[#B32134] via-[#DC5987] text-transparent bg-clip-text to-[#F77FBE] font-montserrat font-bold text-3xl ">
            Find My Match To Breed
          </h1>
        </div>
        <div
          className="flex items-center flex-row gap-4 relative"
          ref={userRef}
        >
          <BellOutlined
            className="text-[#B32134] text-lg"
            onClick={() => {
              setShowNotif((prev) => !prev);
              setLogout(false);
              setDropDown(false);
              Notifications.openNotification(userUID || "");
            }}
          />
          <ShoppingCartOutlined
            className="text-[#B32134] font-bold text-lg cursor-pointer"
            onClick={() => {
              setDropDown((prev) => !prev);
              setLogout(false);
              setShowNotif(false);
            }}
          />
          {dropDown ? (
            <nav className="absolute top-5 right-10 grid grid-rows-3 items-center text-center gap-2 bg-white drop-shadow-md p-4 rounded-md w-60 h-48">
              <Link
                href="/pc/cart"
                className="font-montserrat font-bold text-[#006B95] text-lg border-b-[1px] border-[#B1B1B1] h-full flex justify-center items-center"
              >
                Cart
              </Link>
              <a
                href="/pc/room"
                className="font-montserrat font-bold text-[#006B95] text-lg border-b-[1px] border-[#B1B1B1] h-full flex justify-center items-center"
              >
                Rooms
              </a>
              <Link
                href="/pc/schedule"
                className="font-montserrat font-bold text-[#006B95] text-lg h-full flex justify-center items-center"
              >
                Schedule
              </Link>
            </nav>
          ) : (
            <div className="hidden" />
          )}
          <UserOutlined
            className="text-[#B32134] text-lg cursor-pointer"
            onClick={() => {
              setLogout((prev) => !prev);
              setDropDown(false);
              setShowNotif(false);
            }}
          />
          {logout && (
            <div
              className={
                logout
                  ? `grid grid-rows-6 justify-center items-center bg-[#F3F3F3] drop-shadow-xl rounded-lg absolute top-5 right-5 cursor-pointer h-fit w-56`
                  : `hidden`
              }
            >
              <Link
                href={`/Profile/${userUID}`}
                className="text-center font-hind  h-full w-44 flex items-center justify-center border-b-[1px] border-[#B1B1B1]"
              >
                My Profile
              </Link>
              <Link
                href={`/find-my-buddy`}
                className="text-center font-hind  h-full w-44 flex items-center justify-center border-b-[1px] border-[#B1B1B1]"
              >
                Want to find your buddy?
              </Link>
              <Link
                href={`/Doctor`}
                className="text-center font-hind  h-full w-44 flex items-center justify-center border-b-[1px] border-[#B1B1B1]"
              >
                Want to become part of our doctors?
              </Link>
              <Link
                href={`/Provider`}
                className="text-center font-hind  h-full w-44 flex items-center justify-center border-b-[1px] border-[#B1B1B1]"
              >
                Want to become part of our product sellers?
              </Link>
              <Link
                href={`/Renter`}
                className="text-center font-hind  h-full w-44 flex items-center justify-center border-b-[1px] border-[#B1B1B1]"
              >
                Want to become part of our renters?
              </Link>
              <Link
                href={`/Settings`}
                className="text-center font-hind  h-full w-44 flex items-center justify-center border-b-[1px] border-[#B1B1B1]"
              >
                Settings
              </Link>

              <Signout />
            </div>
          )}
          <div
            className={
              showNotif
                ? `flex fixed z-50 cursor-pointer top-12 right-52 transform-gpu ease-in-out duration-300`
                : `hidden`
            }
          >
            <UserNotification />
          </div>
        </div>
      </nav>

      <div className="relative top-8 left-10 z-10 w-[550px] h-[94%] mx-auto rounded-lg grid grid-cols-5 ">
        {petToMatch.length > 0 &&
          petToMatch[currentIndex] &&
          (loading ? (
            <div className="h-full w-full col-span-4  justify-center items-center">
              <Loading />
            </div>
          ) : (
            <div
              key={petToMatch[currentIndex].id}
              className="bg-red-300 px-4 h-full w-full col-span-4 flex items-center rounded-lg"
            >
              <Image
                height={140}
                width={450}
                src={`/${petToMatch[
                  currentIndex
                ]?.pet_name?.toLowerCase()}.jpg`}
                alt={`${petToMatch[currentIndex]?.pet_name} Image`}
              />
            </div>
          ))}
        <div
          className={`justify-self-end h-full w-full flex flex-col items-center justify-center gap-5`}
        >
          <button
            type="button"
            className={`${
              isHeart ? `border-none bg-[#B32134] ` : `border-red-200`
            } border-2 h-11 w-11 rounded-full flex items-center justify-center cursor-pointer mt-8 mb-6`}
            onClick={() => {
              setIsHeart(true);
              myHeartedPets(petToMatch[currentIndex]?.pet_UID || "");
            }}
          >
            <FontAwesomeIcon
              icon={faHeart}
              className={`text-3xl ${
                isHeart ? `text-white` : `text-slate-400`
              } `}
            />
          </button>
          <button
            type="button"
            className={`${
              isReject ? `bg-gray-700` : `border-gray-400 border-2`
            } h-11 w-11 rounded-full flex items-center justify-center cursor-pointer mb-6`}
            onClick={() => {
              setIsReject((prev) => !prev);
            }}
          >
            <FontAwesomeIcon
              icon={faXmark}
              className={`text-3xl  ${
                isReject ? `text-white` : `text-slate-400`
              }`}
            />
          </button>
        </div>

        {/* <div className="bg-red-300 px-4 h-full w-full col-span-4 flex items-center rounded-lg">
          <Image
            height={140}
            width={140}
            alt="yolo"
            src={`/yolo.jpg`}
            className="object-contain w-full rounded-md"
          />
          <div className="relative z-20"></div>
        </div>
        <div className="h-full flex items-end">
          <div className="h-1/2 w-full flex flex-col items-center">
            <div
              className={`${
                isHeart ? `border-none bg-[#B32134] ` : `border-red-200`
              } border-2 h-11 w-11 rounded-full flex items-center justify-center cursor-pointer mt-8 mb-6`}
              onClick={() => setIsHeart((prev) => !prev)}
            >
              <FontAwesomeIcon
                icon={faHeart}
                className={`text-3xl ${
                  isHeart ? `text-white` : `text-slate-400`
                } `}
              />
            </div>
            <div
              className={`${
                isFavorite
                  ? `border-none bg-[#006B95]`
                  : `border-blue-300 border-2`
              } h-11 w-11 rounded-full flex items-center justify-center cursor-pointer mb-6`}
              onClick={() => setIsFavorite((prev) => !prev)}
            >
              <FontAwesomeIcon
                icon={faStar}
                className={`text-2xl ${
                  isFavorite ? `text-white` : `text-slate-400`
                }`}
              />
            </div>
            <div
              className={`${
                isReject ? `bg-gray-700` : `border-gray-400 border-2`
              } h-11 w-11 rounded-full flex items-center justify-center cursor-pointer mb-6`}
              onClick={() => setIsReject((prev) => !prev)}
            >
              <FontAwesomeIcon
                icon={faXmark}
                className={`text-3xl  ${
                  isReject ? `text-white` : `text-slate-400`
                }`}
              />
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}

const UserNotification = () => {
  const [myNotification, setMyNotification] = useState<Notifications[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [myMatchingNotifications, setMyMatchingNotifications] = useState<
    MatchingNotifications[]
  >([]);

  const [userUID, setUserUID] = useState("");

  useEffect(() => {
    if (!userEmail) return; // Ensure userUID is valid

    const docRef = collection(db, "matching-notifications");
    const q = query(
      docRef,
      where("receiverEmail", "array-contains", userEmail)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const myMatchings = querySnapshot.docs.map(
        (doc) => doc.data() as MatchingNotifications
      );

      setMyMatchingNotifications(
        myMatchings.map((data) => ({
          ...data,
          receiverEmail: data.receiverEmail
            ? data.receiverEmail.filter((user) => user !== userEmail)
            : [],
          timestamp: data.timestamp ? dayjs(data.timestamp.toDate()) : null,
        }))
      );
    });

    return () => unsubscribe(); // Ensure cleanup
  }, [userEmail]);

  useEffect(() => {
    let unsubscribe: () => void;

    const getMyNotifications = async () => {
      try {
        const data = await fetchUserData();
        const userUID = data[0]?.User_UID;
        setUserEmail(data[0]?.User_Email);
        setUserUID(data[0]?.User_Email);
        if (!userUID) {
          console.log("Logged In First");

          return;
        }

        unsubscribe = Notifications.default(userUID, (newNotif) => {
          setMyNotification(newNotif);
        });
      } catch (error) {
        console.log(error);
      }
    };

    getMyNotifications();

    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return (
    <div className="max-w-[500px] w-[482px] h-fit max-h-[542px] bg-white drop-shadow-lg rounded-xl justify-self-center flex flex-col  overflow-y-scroll">
      <h1 className="font-hind text-lg mx-4 mt-4 mb-2">Notifications</h1>
      <div className="h-0.5 border-[#393939] w-full border-[1px] mb-2" />
      {myMatchingNotifications.map((data, index) => {
        return (
          <div
            key={index}
            className=" drop-shadow-lg grid grid-cols-12 p-2 items-center"
          >
            <div className="m-2 h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            <div className="grid grid-cols-12 my-2 col-span-11">
              <div className="col-span-11 grid grid-cols-12">
                <div className="h-12 w-12 col-span-2 rounded-full bg-white drop-shadow-lg font-montserrat text-xs flex items-center justify-center text-center text-nowrap overflow-hidden">
                  Image of <br />
                  Pet
                </div>
                <div className="flex flex-col gap-1 font-montserrat text-wrap col-span-10 text-sm">
                  <h1 className="text-[#393939] font-medium">
                    {data?.message}
                  </h1>
                  <p className="text-xs text-[#797979]">
                    {data?.timestamp?.fromNow()}
                  </p>
                  <Link
                    href={`/Message/${data?.receiverUid?.find(
                      (uid: string) => uid !== userUID
                    )}`}
                    className="place-self-end p-2 rounded-md bg-[#006B95] text-white"
                  >
                    Send A Message
                  </Link>
                </div>
              </div>
              <div className="flex justify-center mt-0.5 ">
                <FontAwesomeIcon icon={faEyeSlash} />
              </div>
            </div>
          </div>
        );
      })}
      {myNotification.map((data, index) => {
        return (
          <div
            key={index}
            className=" drop-shadow-lg grid grid-cols-12 p-2 items-center"
          >
            <div className="m-2 h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            <div className="grid grid-cols-12 my-2 col-span-11">
              <a
                href={`/pc/${
                  data?.appointment_ID
                    ? `schedule/${data.appointment_ID}`
                    : data?.order_ID
                    ? `cart/${data.order_ID}`
                    : `rooms/${data?.room_ID}`
                }`}
                className="col-span-11 grid grid-cols-12"
              >
                <div className="h-12 w-12 col-span-2 rounded-full bg-white drop-shadow-lg font-montserrat text-xs flex items-center justify-center text-center text-nowrap overflow-hidden">
                  Image of <br />
                  Pet
                </div>
                <div className="flex flex-col gap-1 font-montserrat text-wrap col-span-10 text-sm">
                  <h1 className="text-[#393939] font-medium">
                    {data?.message}
                  </h1>
                  <p className="text-xs text-[#797979]">{data?.createdAt}</p>
                </div>
              </a>
              <div className="flex justify-center mt-0.5 ">
                <FontAwesomeIcon icon={faEyeSlash} />
              </div>
            </div>
            {data?.type === "Change Appointment" ? (
              <div className="flex flex-row justify-end gap-4 col-span-12 mr-10">
                <button
                  type="button"
                  className="bg-[#61C4EB] py-1 px-5 text-white rounded-lg"
                >
                  Accept
                </button>
                <button
                  type="button"
                  className="bg-red-400 py-1 px-5 text-white rounded-lg"
                >
                  Reject
                </button>
              </div>
            ) : (
              <div className="hidden" />
            )}
          </div>
        );
      })}
    </div>
  );
};
