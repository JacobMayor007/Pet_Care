"use client";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
// import { db } from "@/app/firebase/config";
// import { collection, getDocs, query, where } from "firebase/firestore";
import Signout from "@/app/SignedOut/page";
import { useRouter } from "next/navigation";
import myNotification, {
  unopenNotification,
} from "@/app/fetchData/Doctor/fetchNotification";
import * as Notification from "@/app/fetchData/Doctor/fetchNotification";

import fetchUserData from "@/app/fetchData/fetchUserData";
import {
  UserOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { Modal } from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

// import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEyeSlash } from "@fortawesome/free-solid-svg-icons";
dayjs.extend(relativeTime);

interface Notifications {
  id?: string;
  createdAt?: string;
  appointment_ID?: string;
  message?: string;
  reciever?: string;
  sender?: string;
  receiver_FName?: string;
  sender_FName?: string;
  status?: string;
  open?: boolean;
  title?: string;
  type?: string;
  hide?: boolean;
  isApprove?: boolean;
}

export default function DoctorNavigation() {
  const btnNotif = useRef<HTMLDivElement | null>(null);
  const [doctor_UID, setDoctor_UID] = useState("");
  const [unreadNotif, setUnreadNotif] = useState(0);
  const [logout, setLogout] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  const auth = getAuth();
  const router = useRouter();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/Login");
      } else {
        setDoctor_UID(user?.uid);
      }
    });
    return () => unsubscribe();
  });

  useEffect(() => {
    const closeNotification = (e: MouseEvent) => {
      if (!btnNotif.current?.contains(e.target as Node)) {
        setShowNotif(false);
      }
    };

    document.addEventListener("mousedown", closeNotification);

    return () => {
      document.removeEventListener("mousedown", closeNotification);
    };
  }, [showNotif]);

  useEffect(() => {
    let unsubscribe: () => void;

    const getMyNotification = async () => {
      try {
        const data = await fetchUserData();
        const doctorUID = data[0]?.User_UID;
        setDoctor_UID(doctorUID);
        console.log(doctor_UID);

        if (!doctorUID) {
          console.log("No doctor UID found.");
          return;
        }

        // Call backend function and pass a callback to update state
        unsubscribe = unopenNotification(doctorUID, (newNotif) => {
          setUnreadNotif(newNotif.length);
        });
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    getMyNotification();

    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [doctor_UID]);

  // useEffect(() => {
  //     if (!id) {
  //       console.error("No Appointment ID provided.");
  //       return;
  //     }

  //     let unsubscribe: (() => void) | undefined;

  //     const fetchAppointment = async () => {
  //       try {
  //         unsubscribe = await Appointment.default(id, (appointmentData) => {
  //           if (appointmentData) {
  //             // ✅ Properly convert Firestore Timestamp to Dayjs
  //             const appointmentDate = appointmentData.Appointment_Date
  //               ? dayjs((appointmentData.Appointment_Date as Timestamp).toDate())
  //               : null;

  //             setAppointment({
  //               ...appointmentData,
  //               Appointment_Date: appointmentDate,
  //             });
  //           } else {
  //             console.warn("Appointment not found.");
  //             setAppointment(null);
  //           }
  //         });
  //       } catch (error) {
  //         console.error("Error fetching appointment:", error);
  //       }
  //     };

  //     fetchAppointment();

  //     return () => {
  //       if (unsubscribe) {
  //         unsubscribe();
  //       }
  //     };
  //   }, [id]);

  return (
    <div>
      <nav className="h-20 flex flex-row justify-center items-center z-[2]">
        <div className="flex items-center justify-center gap-16 px-14 w-full">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => {
              {
                router.push("/");
              }
            }}
          >
            <Image src="/Logo.svg" height={54} width={54} alt="Logo" />
            <h1 className="text-2xl font-sigmar font-normal text-[#006B95]">
              Pet Care
            </h1>
          </div>
          <ul className="list-type-none flex items-center gap-3">
            <li className="w-28 h-14 flex items-center justify-center">
              <a
                href="/Doctor"
                className="font-montserrat text-base text-[#006B95] font-bold"
              >
                Dashboard
              </a>
            </li>
            <li className="w-28 h-14 flex items-center justify-center">
              <a
                href="/Doctor/Patients"
                className="font-montserrat text-base text-[#006B95] font-bold"
              >
                Patients
              </a>
            </li>
            <li className="w-32 h-14 flex items-center justify-center px-2">
              <a
                href="/Doctor/Appointments"
                className="font-montserrat text-base text-[#006B95] font-bold"
              >
                Appointments
              </a>
            </li>
            <li className="w-32 h-14 px-2 flex items-center justify-center">
              <a
                className="font-montserrat text-base text-[#006B95] font-bold"
                href="/Doctor/Transactions"
              >
                Transactions
              </a>
            </li>

            <li className="w-28 h-14 flex items-center justify-center">
              <a
                className="font-montserrat text-base text-[#006B95] font-bold"
                href="/Doctor/Message"
              >
                Messages
              </a>
            </li>
          </ul>
          <div className="flex items-center gap-4" ref={btnNotif}>
            <div className="relative flex gap-2">
              <SearchOutlined className="text-[#006B95] font-bold text-lg cursor-pointer" />

              <BellOutlined
                onClick={() => {
                  setShowNotif((prev) => !prev);
                  setLogout(logout === true ? false : logout);
                  Notification.openNotification(doctor_UID);
                }}
                className="text-[#006B95] font-bold text-lg cursor-pointer relative"
              />
              <div
                className={
                  unreadNotif > 0
                    ? `flex absolute -top-2 right-12 h-4 w-4 text-xs bg-red-500 cursor-pointer text-white rounded-full justify-center items-center`
                    : `hidden`
                }
              >
                {unreadNotif < 0 ? `` : unreadNotif}
              </div>

              <UserOutlined
                className="text-[#006B95] font-bold text-lg cursor-pointer"
                onClick={() => {
                  setLogout((prev) => !prev);
                  setShowNotif(showNotif === true ? false : false);
                }}
              />
              <ShoppingCartOutlined className="text-[#006B95] font-bold text-lg cursor-pointer" />

              <div
                className={
                  logout
                    ? `flex absolute top-9 left-3 cursor-pointer`
                    : `hidden`
                }
                onClick={() => setLogout((prev) => !prev)}
              >
                <Signout />
              </div>
              <div
                className={
                  showNotif
                    ? `flex absolute top-9 right-16 cursor-pointer `
                    : `hidden`
                }
              >
                <div>
                  <NotificationList />
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

function NotificationList() {
  const [notif, setNotif] = useState<Notifications[]>([]);
  const [accept, setAccept] = useState(false);
  const [reject, setReject] = useState(false);

  // const [userUID, setUserUID] = useState("");
  // useEffect(() => {
  //   const auth = getAuth();

  //   const unsubscribe = onAuthStateChanged(auth, (user) => {
  //     if (user) {
  //       setUserUID(user?.uid);
  //     } else {
  //       router.push("/Login");
  //     }
  //   });
  //   return () => unsubscribe();
  // });

  //

  useEffect(() => {
    let unsubscribe: () => void;

    const getMyNotification = async () => {
      try {
        const data = await fetchUserData();
        const doctorUID = data[0]?.User_UID;

        if (!doctorUID) {
          console.log("No doctor UID found.");
          return;
        }

        // Call backend function and pass a callback to update state
        unsubscribe = myNotification(doctorUID, (newNotif) => {
          setNotif(newNotif);
        });
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    getMyNotification();

    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const approvedAppointment = async () => {
    try {
    } catch (error) {
      console.log(error);
    }
  };

  const rejectedAppointment = async () => {
    try {
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="max-w-[500px] w-[482px] h-fit max-h-[542px] bg-white drop-shadow-lg rounded-xl justify-self-center flex flex-col pb-1">
      <h1 className="font-hind text-lg mx-4 mt-4 mb-2">Notifications</h1>
      <div className="h-0.5 border-[#393939] w-full border-[1px] mb-2" />
      {notif.map((data) => {
        return (
          <div
            key={data?.id}
            className={`${
              data?.hide || data?.isApprove
                ? `hidden`
                : `grid grid-cols-[4px_100%] my-1 items-center px-2 `
            }`}
          >
            {data?.status === "unread" ? (
              <div className="w-2 animate-pulse ">
                <div className="h-2 w-2 bg-blue-500 rounded-full" />
              </div>
            ) : (
              <div className="" />
            )}
            <div
              className={`grid grid-cols-12 w-full hover:bg-slate-300 ${
                data?.status === "read" ? ` col-span-12` : `col-span-11`
              }`}
            >
              <a
                href={`/Doctor/PatientDetails/${data?.appointment_ID}`}
                onClick={() => Notification.readNotification(data?.id || "")}
                className="col-span-11 grid grid-cols-5 w-full items-center"
              >
                <div>
                  <div className="h-10 w-10 rounded-full bg-white drop-shadow-md justify-self-center text-xs flex items-center justify-center text-center">
                    Image of pet
                  </div>
                </div>
                <div className="col-span-4 flex flex-row">
                  <div className="flex flex-col">
                    <h1 className="font-montserrat font-bold text-sm ">
                      For you:{data?.message}
                    </h1>
                    <p className="font-hind text-xs text-[#393939]">
                      {data?.createdAt}
                    </p>
                  </div>
                </div>
              </a>
              <div className="relative">
                <div
                  onClick={() => Notification.hideNotification(data?.id || "")}
                  className="pl-3 pr-2 py-2 rounded-lg flex flex-row items-center gap-2"
                >
                  <FontAwesomeIcon icon={faEyeSlash} />
                </div>
              </div>
            </div>
            {data?.isApprove ? (
              <div
                className={
                  data?.appointment_ID !== undefined ||
                  data?.appointment_ID !== null ||
                  data?.appointment_ID !== ""
                    ? `col-span-12 flex justify-end gap-2 mt-1`
                    : `hidden`
                }
              >
                <button
                  type="button"
                  className="h-fit py-1 px-5 bg-[#61C4EB] rounded-lg font-montserrat font-semibold text-white text-sm"
                  onClick={() => setAccept(true)}
                >
                  Accept
                </button>
                <button
                  type="button"
                  className="bg-red-400 py-1 px-5  rounded-lg font-montserrat font-semibold text-white text-sm"
                  onClick={() => setReject(true)}
                >
                  Reject
                </button>
              </div>
            ) : (
              <div className="hidden" />
            )}

            <Modal
              open={accept}
              onOk={approvedAppointment}
              onCancel={() => setAccept(false)}
              centered={true}
            >
              Finalize what time of schedule you want the patient to appoint?
            </Modal>
            <Modal
              open={reject}
              onOk={rejectedAppointment}
              onCancel={() => setReject(false)}
              onClose={() => setReject(false)}
              centered={true}
            >
              State the reason why you want to cancel?
            </Modal>
          </div>
        );
      })}
    </div>
  );
}
