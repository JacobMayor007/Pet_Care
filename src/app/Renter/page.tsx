"use client";

import RentersNavigation from "./RentersNavigation/page";
import fetchUserData from "../fetchData/fetchUserData";
import { useEffect, useState } from "react";
import { DocumentData } from "firebase/firestore";
import { myRooms, myEarnings, totalEarnings } from "./renterData";
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

interface MonthlyEarnings {
  BC_BoarderPaidAt: Dayjs | null;
  BC_BoarderTotalPrice: number;
}

interface DailyEarnings {
  BC_BoarderPaidAt: Dayjs | null;
  BC_BoarderTotalPrice: number;
}

interface TotalEarnings {
  BC_BoarderTotalPrice: number;
}

export default function RentersPage() {
  const [userData, setUserData] = useState<DocumentData[]>([]);
  const [myBoards, setMyBoards] = useState<myBoard[]>([]);
  const [monthlyProfit, setMonthlyProfit] = useState(0);
  const [dailyProfit, setDailyProfit] = useState(0);
  const [totalProfit, setTotalProfit] = useState<number | null>(null);

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

  useEffect(() => {
    const getMonthlyEarnings = async () => {
      const userUID = userData[0]?.User_UID;
      console.log(userUID);

      try {
        const getEarnings = await myEarnings(userUID);

        // Get the current month (0-based index, e.g., January = 0, February = 1, etc.)
        const currentMonth = dayjs().month();

        // Filter and sum the totalPrice for the current month
        const result = getEarnings
          ?.filter((earn: MonthlyEarnings) => {
            const paidAt = earn?.BC_BoarderPaidAt?.toDate();
            return paidAt && paidAt.getMonth() === currentMonth; // Check if the month matches
          })
          .reduce(
            (sum, earn) => {
              const totalPrice = earn?.BC_BoarderTotalPrice || 0;
              return {
                totalPrice: sum.totalPrice + totalPrice,
                count: sum.count + 1,
              };
            },
            { totalPrice: 0, count: 0 }
          );
        setMonthlyProfit(result?.totalPrice);
      } catch (error) {
        console.error(error);

        return 0;
      }
    };
    getMonthlyEarnings();
  }, [userData]);

  useEffect(() => {
    const getDailyEarnings = async () => {
      const userUID = userData[0]?.User_UID;
      console.log(userUID);

      try {
        const getEarnings = await myEarnings(userUID);

        const now = dayjs().get("day");

        // Filter and sum the totalPrice for the current month
        const result = getEarnings
          ?.filter((earn: DailyEarnings) => {
            const paidAt = earn?.BC_BoarderPaidAt?.toDate();
            return paidAt && paidAt.getDay() === now;
          })
          .reduce(
            (sum, earn) => {
              const totalPrice = earn?.BC_BoarderTotalPrice || 0;
              return {
                totalPrice: sum.totalPrice + totalPrice,
                count: sum.count + 1,
              };
            },
            { totalPrice: 0, count: 0 }
          );
        setDailyProfit(result?.totalPrice);
      } catch (error) {
        console.error(error);

        return 0;
      }
    };
    getDailyEarnings();
  }, [userData]);

  useEffect(() => {
    const getTotalEarnings = async () => {
      try {
        const userUID = userData[0]?.User_UID;
        const earnings = await totalEarnings(userUID);

        const result = earnings?.reduce((sum: number, earn: TotalEarnings) => {
          return sum + earn?.BC_BoarderTotalPrice;
        }, 0);

        console.log("Total Profit", result);

        setTotalProfit(result || 0);
      } catch (error) {
        console.error("Error calculating total earnings:", error);
        return null;
      }
    };

    getTotalEarnings();
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
        <div className="grid grid-cols-2 mt-4">
          <h1 className="font-montserrat font-bold text-4xl col-span-2">
            Summary
          </h1>
          <div className="h-36 bg-white drop-shadow-lg rounded-lg p-4 mt-4 grid grid-cols-3">
            <h1 className="font-semibold font-montserrat text-[#565656] text-2xl col-span-3">
              Earnings
            </h1>
            <p className="text-center font-montserrat text-xs text-[#565656]">
              Daily
            </p>
            <p className="text-center font-montserrat text-xs text-[#565656]">
              Monthly
            </p>
            <p className="text-center font-montserrat text-xs text-[#565656]">
              Total Earnings
            </p>
            <h1 className="text-center font-montserrat font-semibold text-lg text-[#26A2AB] ">
              Php {dailyProfit}
            </h1>
            <h1 className="text-center font-montserrat font-semibold text-lg text-[#26A2AB] ">
              Php {monthlyProfit}
            </h1>
            <h1 className="text-center font-montserrat font-semibold text-lg text-[#26A2AB] ">
              Php {totalProfit}
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}
