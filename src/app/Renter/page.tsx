"use client";

import RentersNavigation from "./RentersNavigation/page";
import fetchUserData from "../fetchData/fetchUserData";
import { useEffect, useState } from "react";
import { DocumentData } from "firebase/firestore";
import { myRooms } from "./renterData";
import dayjs, { Dayjs } from "dayjs";

interface myBoard {
  id?: string;
  Renter_CreatedAt?: Dayjs | null;
  Renter_Location?: string;
  Renter_PaymentMethod?: string;
  Renter_RoomDescription?: string;
  Renter_RoomName?: string;
  Renter_RoomPrice?: string;
  Renter_RoomFeatures?: [
    {
      id?: string;
      name?: string;
      price?: string;
    }
  ];
  Renter_TotalPrice?: number;
  Renter_TypeOfRoom?: string;
  Renter_UserEmail?: string;
  Renter_UserFullName?: string;
  Renter_RoomStatus?: string;
  Renter_UserID?: string;
}

export default function RentersPage() {
  const [userData, setUserData] = useState<DocumentData[]>([]);
  const [myBoards, setMyBoards] = useState<myBoard[]>([]);

  useEffect(() => {
    const getUserData = async () => {
      const user = await fetchUserData();
      setUserData(user);
    };
    getUserData();
  }, []);

  useEffect(() => {
    const getMyRooms = async () => {
      const userID = userData[0]?.User_UID;
      const rooms = await myRooms(userID);

      setMyBoards(
        rooms?.map((room: myBoard) => ({
          ...room,
          Renter_CreatedAt: room?.Renter_CreatedAt
            ? dayjs(room?.Renter_CreatedAt.toDate())
            : null,
        }))
      );
    };
    getMyRooms();
  }, [userData]);

  return (
    <div>
      <nav className="relative z-20">
        <RentersNavigation />
      </nav>
      <div className="z-10 mx-52 h-screen pt-14 flex flex-col gap-6">
        <h1 className="font-montserrat font-bold text-4xl">Rooms</h1>
        <div className="grid grid-cols-4 gap-4 items-center">
          {myBoards.slice(0, 4).map((data, index) => {
            return (
              <div
                key={index}
                className="bg-white drop-shadow-lg h-72 w-64 p-4 rounded-lg flex flex-col gap-4"
              >
                <div className="h-1/2 ">
                  <h1 className="text-center mt-10 font-montserrat font-bold">
                    Image Room of {data?.Renter_RoomName}
                  </h1>
                </div>
                <p className="font-montserrat text-sm text-[#565656] font-medium">
                  {data?.Renter_TypeOfRoom}
                </p>
                <p className="font-hind text-[#565656] font-bold text-lg">
                  {data?.Renter_RoomName}
                </p>
                <p className="font-semibold font-hind text-[#565656] ">
                  Php {data?.Renter_RoomPrice}
                </p>
                <a
                  href={`/Renter/ListOfRooms/${data?.id}`}
                  className="bg-[#006B95] font-hind text-white font-semibold py-0.5 rounded-md text-center"
                >
                  View Room Details
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
