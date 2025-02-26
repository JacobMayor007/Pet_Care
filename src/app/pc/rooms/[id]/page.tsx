"use client";

import ClientNavbar from "@/app/ClientNavbar/page";
import React, { useEffect, useState } from "react";
import { fetchBookedDetails } from "./room";
import dayjs, { Dayjs } from "dayjs";
import { Timestamp } from "firebase/firestore";
import Image from "next/image";

interface RoomID {
  params: Promise<{ id: string }>;
}

interface BoardDetails {
  boardId?: string;
  BC_BoarderUID?: string;
  BC_BoarderFullName?: string;
  BC_BoarderEmail?: string;
  BC_BoarderBoardedAt?: Dayjs | null;
  BC_BoarderCheckInTime?: Dayjs | null;
  BC_BoarderCheckOutTime?: Dayjs | null;
  BC_BoarderCheckInDate?: Dayjs | null;
  BC_BoarderCheckOutDate?: Dayjs | null;
  BC_BoarderChoiceFeature?: [
    {
      label?: string;
      name?: string;
      value?: number;
    }
  ];
  BC_BoarderDays?: number;
  BC_BoarderDietaryRestrictions?: string;
  BC_BoarderGuest?: string;
  BC_BoarderStatus?: string;
  BC_BoarderTotalPrice?: number;
  BC_BoarderUpdated?: Dayjs | null;
  BC_BoarderTypeRoom?: string;
  BC_RenterRoomID?: string;
  BC_RenterFullName?: string;
  BC_RenterUID?: string;
  BC_RenterRoomName?: string;
  BC_RenterPrice?: string;
  BC_RenterLocation?: string;
  BC_RenterEmail?: string;
  BC_TypeOfPayment?: string;
}

export default function MyRooms({ params }: RoomID) {
  const { id } = React.use(params);
  const [boardDetails, setBoardDetails] = useState<BoardDetails | null>(null);

  useEffect(() => {
    const Myrooms = async () => {
      const roomDetails = await fetchBookedDetails(id);

      setBoardDetails({
        ...roomDetails,
        BC_BoarderBoardedAt:
          roomDetails?.BC_BoarderBoardedAt instanceof Timestamp
            ? dayjs((roomDetails?.BC_BoarderBoardedAt).toDate())
            : null,
        BC_BoarderCheckInDate:
          roomDetails?.BC_BoarderCheckInDate instanceof Timestamp
            ? dayjs((roomDetails?.BC_BoarderCheckInDate).toDate())
            : null,
        BC_BoarderCheckOutDate:
          roomDetails?.BC_BoarderCheckOutDate instanceof Timestamp
            ? dayjs((roomDetails?.BC_BoarderCheckOutDate).toDate())
            : null,
        BC_BoarderCheckInTime:
          roomDetails?.BC_BoarderCheckInTime instanceof Timestamp
            ? dayjs((roomDetails?.BC_BoarderCheckInTime).toDate())
            : null,
        BC_BoarderCheckOutTime:
          roomDetails?.BC_BoarderCheckOutTime instanceof Timestamp
            ? dayjs((roomDetails?.BC_BoarderCheckOutTime).toDate())
            : null,
        BC_BoarderUpdated:
          roomDetails?.BC_BoarderUpdated instanceof Timestamp
            ? dayjs((roomDetails?.BC_BoarderUpdated).toDate())
            : null,
      });
    };

    Myrooms();
  }, [id]);

  return (
    <div className="h-screen">
      <nav className="relative z-20 ">
        <ClientNavbar />
      </nav>
      <div className="z-10 mx-52 pt-10">
        <h1 className="text-4xl font-bold font-montserrat text-[#393939]">
          Bookings
        </h1>
        <div className=" w-full bg-white drop-shadow-lg rounded-xl mt-10 grid grid-cols-6 p-8 gap-4">
          <h1 className="font-montserrat text-xl col-span-4 h-fit">Room</h1>
          <h1 className="font-montserrat text-xl h-fit text-center">Price</h1>
          <h1 className="font-montserrat text-xl h-fit text-center">Status</h1>
          <div className="h-0.5 col-span-6 rounded-full bg-[#C3C3C3]" />
          <div className="h-32 w-32 text-center flex items-center justify-center">
            Image of {boardDetails?.BC_RenterRoomName}
          </div>
          <div className="col-span-3 flex flex-col justify-center">
            <h1 className="font-montserrat font-bold text-[#393939]">
              {boardDetails?.BC_RenterRoomName}
            </h1>
            <p className="mb-2 font-montserrat font-bold text-[#393939]">
              {boardDetails?.BC_BoarderTypeRoom}
            </p>
            <h1 className="font-bold font-hind text-[#096F85]">
              Check-In:{" "}
              <span className="font-hind font-normal">
                {boardDetails?.BC_BoarderCheckInDate?.format("MMMM DD, YYYY")}{" "}
                {boardDetails?.BC_BoarderCheckInTime?.format("hh:mm A")}
              </span>
            </h1>
            <h1 className="font-bold font-hind text-[#096F85]">
              Check-out:{" "}
              <span className="font-hind font-normal">
                {boardDetails?.BC_BoarderCheckOutDate?.format("MMMM DD, YYYY")}{" "}
                {boardDetails?.BC_BoarderCheckOutTime?.format("hh:mm A")}
              </span>
            </h1>
            <p className="font-bold font-hind text-[#006B95] flex flex-row items-center gap-2 mt-2">
              <span>
                <Image
                  src={`/${boardDetails?.BC_TypeOfPayment} Image.svg`}
                  height={30}
                  width={30}
                  alt={`${boardDetails?.BC_TypeOfPayment}`}
                />
              </span>{" "}
              {boardDetails?.BC_TypeOfPayment}
            </p>
          </div>
          <h1 className="my-auto text-center font-bold font-montserrat text-[#393939]">
            Php {boardDetails?.BC_BoarderTotalPrice}
          </h1>
          <h1 className="my-auto text-center font-bold font-montserrat text-[#006B95]">
            {boardDetails?.BC_BoarderStatus}
          </h1>
        </div>
      </div>
    </div>
  );
}
