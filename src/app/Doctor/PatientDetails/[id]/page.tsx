"use client";
import React, { useState, useEffect } from "react";
import { fetchPatientDetails } from "@/app/fetchData/Doctor/fetchAppointment";
import { DatePicker, Modal, TimePicker } from "antd";
import isAuthenticate from "@/app/fetchData/User/isAuthenticate";
import { useRouter } from "next/navigation";
import DoctorNavigation from "../../DoctorNavbar/page";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faMinus,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import "@ant-design/v5-patch-for-react-19";
import dayjs, { Dayjs } from "dayjs";
import * as Appointment from "@/app/fetchData/Doctor/fetchAppointment";
import {
  addDoc,
  collection,
  DocumentData,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/app/firebase/config";
import fetchUserData from "@/app/fetchData/fetchUserData";
import { v4 as uuidv4 } from "uuid";

interface DetailsProps {
  params: Promise<{ id: string }>;
}

interface Appointment {
  id?: string;
  Appointment_CreatedAt?: string;
  Appointment_Date?: Dayjs | null;
  Appointment_DoctorEmail?: string;
  Appointment_DoctorName?: string;
  Appointment_DoctorUID?: string;
  Appointment_DoctorPNumber?: string;
  Appointment_IsNewPatient?: boolean;
  Appointment_Location?: string;
  Appointment_PatientFName?: string;
  Appointment_PatientFullName?: string;
  Appointment_PatientPetAge?: {
    Month?: number;
    Year?: number;
  };
  Appointment_PatientPetBP?: {
    Hg?: number;
    mm?: number;
  };
  Appointment_PatientPetBreed?: string;
  Appointment_PatientPetName?: string;
  Appointment_PatientTypeOfPayment?: string;
  Appointment_PatientUserUID?: string;
  Appointment_Status?: string;
  Appointment_TypeOfAppointment?: string;
  Appointment_Time?: string;
}

// interface AppointmentHistory{

// }

interface Observations {
  id: string;
  name: string;
}

interface Treatment {
  id: string;
  name: string;
}

// interface practice {
//   practice?: [
//     {
//       name?: string;
//       id?: string;
//     }
//   ];
// }

export default function PatientDetails({ params }: DetailsProps) {
  const { id } = React.use(params);
  const now = dayjs();
  const [pendingAppointments, setPendingAppointments] =
    useState<Appointment | null>(null);
  const router = useRouter();
  const [changeDate, setChangeDate] = useState(false);
  const [userData, setUserData] = useState<DocumentData[]>([]);
  const [observations, setObservations] = useState<Observations[]>([]);
  const [treatment, setTreatment] = useState<Treatment[]>([]);
  const [accept, setAccept] = useState(false);
  const [reject, setReject] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [time, setTime] = useState("");
  const [sex, setSex] = useState("");
  const [weight, setWeight] = useState(0);
  const [height, setHeight] = useState(0);
  const [mm, setMM] = useState(0);
  const [bloodType, setBloodType] = useState("");
  const [hg, setHg] = useState(0);
  const [bloodGlucose, setBloodGlucose] = useState(0);
  const [disease, setDisease] = useState("");
  const [allergies, setAllergies] = useState("");
  const [document, setDocument] = useState("");
  const [duration, setDuration] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    const checkAuthentication = async () => {
      const login = await isAuthenticate();
      if (!login) {
        router.push("/Login"); // Redirect if not logged in
      }
    };

    checkAuthentication();
  }, [router]);

  useEffect(() => {});

  useEffect(() => {
    const getUserData = async () => {
      const fetchedUserData = await fetchUserData();
      setUserData(fetchedUserData);
    };
    getUserData();
  }, []);

  useEffect(() => {
    const getMyAppointments = async (id: string) => {
      console.log("Appointment_ID", id);

      try {
        const pendingAppointment = await fetchPatientDetails(id);

        setPendingAppointments({
          ...pendingAppointment,
          Appointment_Date: pendingAppointment?.Appointment_Date
            ? dayjs((pendingAppointment.Appointment_Date as Timestamp).toDate())
            : null,
        });
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
        setPendingAppointments(null);
      }
    };

    getMyAppointments(id);
  }, [id]);

  const addObservations = (e: React.MouseEvent) => {
    e.preventDefault();

    const _addObservations = [...observations];
    _addObservations.push({
      id: uuidv4(),
      name: "",
    });
    setObservations(_addObservations);
  };

  const addTreatment = (e: React.MouseEvent) => {
    e.preventDefault();

    const _addTreatment = [...treatment];
    _addTreatment.push({
      id: uuidv4(),
      name: "",
    });

    setTreatment(_addTreatment);
  };

  const removeObservations = (id: string, e: React.MouseEvent) => {
    e.preventDefault();

    let _addObservations = [...observations];

    _addObservations = _addObservations.filter((obs) => obs.id !== id);
    setObservations(_addObservations);
  };

  const removeTreatment = (id: string, e: React.MouseEvent) => {
    e.preventDefault();

    let _addTreatment = [...treatment];

    _addTreatment = _addTreatment.filter((treatment) => treatment.id !== id);
    setTreatment(_addTreatment);
  };

  const treatmentInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: string
  ) => {
    const { name, value } = e.target;

    const updatedTreatment = treatment.map((tm) =>
      tm.id === id ? { ...tm, [name]: value } : tm
    );

    setTreatment(updatedTreatment);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: string
  ) => {
    const { name, value } = e.target;

    const updatedObservations = observations.map((obs) =>
      obs.id === id ? { ...obs, [name]: value } : obs
    );

    setObservations(updatedObservations);
  };

  // useEffect(() => {
  //   const getPractice = async () => {
  //     try {
  //       const docRef = collection(db, "practice");
  //       const docSnap = await getDocs(docRef);

  //       const fetch = docSnap.docs.map((doc) => ({
  //         id: doc.id,
  //         ...doc.data(),
  //       })) as practice[];

  //       setPractice(fetch);
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   };

  //   getPractice();
  // }, []);

  const submitPatientInformation = async () => {
    try {
      const doctorUID = userData[0]?.User_UID;

      const docRef = collection(db, "patient-info");
      const patientInfo = await addDoc(docRef, {
        appointment_ID: pendingAppointments?.id,
        patient_ID: pendingAppointments?.Appointment_PatientUserUID,
        doctor_ID: doctorUID,
        patient_pet_name: pendingAppointments?.Appointment_PatientPetName,
        patient_pet_breed: pendingAppointments?.Appointment_PatientPetBreed,
        patient_pet_sex: sex,
        patient_weight: weight,
        patient_height: height,
        patient_BT: bloodType,
        patient_BP: {
          mm: mm,
          Hg: hg,
        },
        patient_BG: bloodGlucose,
        patient_disease: disease,
        patient_allergies: allergies,
      });
      console.log(patientInfo);
    } catch (e) {
      console.error(e);
    }
  };

  const submitAppointmentHistory = async () => {
    try {
      const doctorUID = userData[0]?.User_UID;

      const docRef = collection(db, "appointment-history");
      const history = await addDoc(docRef, {
        appointmentID: pendingAppointments?.id,
        doctorUID: doctorUID,
        patientID: pendingAppointments?.Appointment_PatientUserUID,
        historyTitle: title,
        historyBody: body,
        historyObservation: observations,
        historyTreatment: treatment,
        history_weight: weight,
        history_height: height,
        history_BP: {
          mm: mm,
          Hg: hg,
        },
        history_BG: bloodGlucose,
        history_duration: duration,
        history_document: document,
      });

      console.log(history);
    } catch (error) {
      console.log(error);
    }
  };

  const notifyDate = async () => {
    try {
      const doctorUID = userData[0]?.User_UID;
      const fName = userData[0]?.User_FName;
      const lName = userData[0]?.User_LName;
      const fullName = `${fName} ${lName}`;
      const docRef = collection(db, "notifications");
      const date =
        pendingAppointments?.Appointment_Date?.format("MMMM DD, YYYY");
      const patient = pendingAppointments?.Appointment_PatientUserUID;
      const patient_FName = pendingAppointments?.Appointment_PatientFName;
      console.log(id);

      await addDoc(docRef, {
        appointment_ID: id,
        sender: doctorUID,
        sender_FName: fName,
        receiver_FName: patient_FName,
        receiver: patient,
        title: newDate
          ? `Change schedule from Dr. ${doctorUID} to ${patient}`
          : `Approved Appointment Request from ${patient} to Dr. ${doctorUID}`,
        message: newDate
          ? `Dr. ${fullName} change your schedule on ${newDate} ${time}`
          : `Dr. ${fullName} approved your appointment on ${date} ${time}`,
        type: newDate ? "Change Appointment" : "Approved Appointment",
        date: newDate ? newDate : date,
        time: time,
        createdAt: Timestamp.now(),
        hide: false,
        open: false,
        status: "unread",
        isApproved: true,
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="h-full pb-2">
      <div className="relative z-20">
        <DoctorNavigation />
      </div>
      <div className="z-10 grid grid-cols-12 mx-52 my-12 h-full">
        <a href="" className="col-span-12 flex flex-row gap-4 items-center">
          <FontAwesomeIcon icon={faArrowLeft} className="text-3xl" />
          <h1 className="font-montserrat text-[#393939] font-bold text-4xl ">
            Patient Details
          </h1>
        </a>
        <div className="h-fit mt-8 col-span-4">
          <div className="flex flex-col gap-6">
            <div className="border-[1px] border-[#C3C3C3] px-5 py-6 rounded-xl">
              <div className="flex flex-col items-center gap-2 mb-4">
                <div className="text-xs text-center font-montserrat font-bold text-[#393939] h-24 w-24 rounded-full bg-white drop-shadow-md flex items-center justify-center">
                  Image of {pendingAppointments?.Appointment_PatientPetName}
                </div>
                <h1 className="font-montserrat font-bold text-xl">
                  {pendingAppointments?.Appointment_PatientPetName}
                </h1>
                <p className="font-hind text-sm text-[#767676]">
                  Owner: {pendingAppointments?.Appointment_PatientFullName}
                </p>
                <p className="font-hind font-bold text-sm text-[#006B95]">
                  Patient Age:{" "}
                  <span>
                    {pendingAppointments?.Appointment_PatientPetAge?.Year ===
                      undefined ||
                    pendingAppointments?.Appointment_PatientPetAge?.Year === 0
                      ? ""
                      : pendingAppointments?.Appointment_PatientPetAge?.Year > 1
                      ? `${pendingAppointments?.Appointment_PatientPetAge.Year} years,`
                      : `${pendingAppointments?.Appointment_PatientPetAge.Year} year,`}{" "}
                  </span>
                </p>
              </div>
              {pendingAppointments?.Appointment_Status === "isPending" ? (
                <div className="grid grid-cols-2 gap-2 w-full  ">
                  <button
                    type="button"
                    className="h-fit bg-[#61C4EB] text-white py-3 rounded-lg font-hind font-medium"
                    onClick={() => setAccept(true)}
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => setReject(true)}
                    className="h-fit bg-red-400 text-white py-3 rounded-lg font-hind font-medium "
                  >
                    Reject
                  </button>
                </div>
              ) : (
                <button className="h-fit bg-[#006B95] text-white py-3 rounded-lg font-hind font-medium w-full">
                  Send Message
                </button>
              )}
            </div>
            <Modal
              open={accept}
              onCancel={() => setAccept(false)}
              centered={true}
              onClose={() => setAccept(false)}
              onOk={() => {
                notifyDate();
                setAccept(false);
                Appointment.postApprovedAppointment(id || "", time);
                window.location.reload();
              }}
            >
              <h1 className="font-montserrat text-[#393939] font-medium">
                What time of schedule you want the patient to appoint on{" "}
                {pendingAppointments?.Appointment_Date?.format("MMMM DD, YYYY")}
                ?{" "}
                <span
                  className="italic text-[#4ABEC5] cursor-pointer pb-3 bg-left-bottom bg-no-repeat bg-gradient-to-r from-[#4ABEC5] to-[#4ABEC5] bg-[length:0%_3px] hover:bg-[length:100%_3px] ease-in-out duration-300 transform"
                  onClick={() => {
                    setChangeDate(true);
                    setAccept(false);
                  }}
                >
                  Click here if you want to change the date.
                </span>
              </h1>
              <div className="flex flex-row gap-2 my-4 items-center">
                <label
                  htmlFor="TimeAppoint"
                  className="font-montserrat font-medium"
                >
                  Time:
                </label>
                <TimePicker
                  size="middle"
                  format={"hh:mm A"}
                  use12Hours
                  className="font-montserrat font-medium"
                  onChange={(time: Dayjs | null) =>
                    setTime(time ? time.format("hh:mm A") : "")
                  }
                />
              </div>
            </Modal>
            <Modal
              open={reject}
              onCancel={() => setReject(false)}
              onClose={() => setReject(false)}
              onOk={() => {
                setReject(false);
              }}
              centered
            >
              State the reason why you want to cancel?
            </Modal>{" "}
            <Modal
              open={changeDate}
              onCancel={() => setChangeDate(false)}
              onClose={() => setChangeDate(false)}
              onOk={() => {
                notifyDate();
                setChangeDate(false);
              }}
              centered
            >
              <h1 className="font-montserrat font-medium italic">
                Change date for patient appointment.
              </h1>
              <div className="grid grid-cols-2 gap-3 my-4 items-center justify-self-center">
                <label
                  htmlFor="TimeAppoint"
                  className="font-montserrat font-medium"
                >
                  Date:
                </label>
                <DatePicker
                  defaultValue={now}
                  size="middle"
                  use12Hours
                  onChange={(date: Dayjs | null) => {
                    setNewDate(date ? date.format("MMMM DD, YYYY") : "");
                  }}
                  className="font-montserrat font-medium"
                />
                <label
                  htmlFor="TimeAppoint"
                  className="font-montserrat font-medium"
                >
                  Time:
                </label>
                <TimePicker
                  defaultValue={now}
                  size="middle"
                  use12Hours
                  format={"hh:mm A"}
                  className="font-montserrat font-medium"
                  onChange={(time: Dayjs | null) =>
                    setTime(time ? time.format("hh:mm A") : "")
                  }
                />
              </div>
            </Modal>
            <div className="border-[1px] border-[#C3C3C3] p-4 rounded-xl h-full">
              <div
                className={
                  pendingAppointments?.Appointment_Status === "Approved"
                    ? `flex flex-col gap-7`
                    : `hidden`
                }
              >
                <h1>Patient Information</h1>
                <div className="w-full border-[#B1B1B1] border-[1px]" />
                <div className="grid grid-cols-5 gap-2">
                  <label
                    htmlFor="speciesID"
                    className="font-hind text-base text-[#797979] col-span-2"
                  >
                    Species:
                  </label>
                  <input
                    type="text"
                    name="speci"
                    id="speciesID"
                    disabled
                    value={pendingAppointments?.Appointment_PatientPetBreed}
                    className="col-span-3 font-hind font-bold text-[#006B95] border-[#C3C3C3] outline-none text-center"
                  />
                  <label
                    htmlFor="sexID"
                    className="font-hind text-base text-[#797979] col-span-2"
                  >
                    Sex:
                  </label>
                  <input
                    type="text"
                    name="sex"
                    id="sexID"
                    value={sex}
                    placeholder="Male"
                    onChange={(e) => setSex(e.target.value)}
                    className={`col-span-3 ${
                      sex === ""
                        ? `border-b-[1px]`
                        : `border-b-0 font-hind font-bold text-[#006B95]`
                    } border-[#C3C3C3] outline-none text-center`}
                  />
                  <label
                    htmlFor="weightID"
                    className="font-hind text-base text-[#797979] col-span-2"
                  >
                    Weight:
                  </label>
                  <input
                    type="number"
                    name="weight"
                    id="weightID"
                    value={weight == 0 ? `` : weight}
                    placeholder="kg"
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="[&::-webkit-inner-spin-button]:appearance-none col-span-3 border-b-[1px] border-[#C3C3C3] outline-none text-center"
                  />
                  <label
                    htmlFor="heightID"
                    className="font-hind text-base text-[#797979] col-span-2"
                  >
                    Height:
                  </label>
                  <input
                    type="number"
                    name="height"
                    id="heightID"
                    placeholder="cm"
                    value={height == 0 ? `` : height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="col-span-3 border-b-[1px] border-[#C3C3C3] outline-none text-center [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <label
                    htmlFor="btID"
                    className="col-span-2 font-hind text-base text-[#797979] "
                  >
                    Blood Type:
                  </label>
                  <input
                    type="text"
                    name="bt"
                    id="btID"
                    placeholder="DEA 1.1 Positive"
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    className="col-span-3 border-b-[1px] border-[#C3C3C3] outline-none text-center "
                  />
                  <label
                    htmlFor="bpID"
                    className="col-span-3 font-hind text-base text-[#797979]"
                  >
                    Blood Pressure:
                  </label>
                  <input
                    type="number"
                    name="mm"
                    id="mm-id"
                    value={mm == 0 ? `` : mm}
                    placeholder="mm"
                    onChange={(e) => setMM(Number(e.target.value))}
                    className="col-span-1 border-b-[1px] border-[#C3C3C3] outline-none text-center [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <input
                    type="number"
                    name="Hg"
                    placeholder="Hg"
                    id="hg-id"
                    value={hg == 0 ? `` : hg}
                    className="col-span-1 border-b-[1px] border-[#C3C3C3] outline-none text-center [&::-webkit-inner-spin-button]:appearance-none"
                    onChange={(e) => setHg(Number(e.target.value))}
                  />
                  <label
                    htmlFor="bgID"
                    className="col-span-2 font-hind text-base text-[#797979]"
                  >
                    Blood Glucose
                  </label>
                  <input
                    type="number"
                    name="bg"
                    id="bgID"
                    placeholder="95 mg/dL"
                    value={bloodGlucose == 0 ? `` : bloodGlucose}
                    onChange={(e) => setBloodGlucose(Number(e.target.value))}
                    className="col-span-3 border-b-[1px] border-[#C3C3C3] outline-none text-center [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <label
                    htmlFor="diseaseID"
                    className="font-hind text-base text-[#797979] col-span-2"
                  >
                    Disease:
                  </label>
                  <input
                    type="text"
                    name="disease"
                    id="diseaseID"
                    placeholder="Hyperthroidism"
                    value={disease}
                    onChange={(e) => setDisease(e.target.value)}
                    className="col-span-3 border-b-[1px] border-[#C3C3C3] outline-none text-center"
                  />
                  <label
                    htmlFor="allergiesID"
                    className="font-hind text-base text-[#797979] col-span-2"
                  >
                    Allergies:
                  </label>
                  <input
                    type="text"
                    name="allergies"
                    id="allergiesID"
                    placeholder="Chicken, Pollen, Chocolates"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    className="col-span-3 border-b-[1px] border-[#C3C3C3] outline-none text-center "
                  />
                </div>
                <div className="flex justify-end p-2">
                  <button
                    type="button"
                    className="h-9 w-20 rounded-md bg-[#006B95] text-white font-hind "
                    onClick={submitPatientInformation}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-8 mt-8 border-[#C3C3C3] border-[1px] ml-3 rounded-2xl p-6 ">
          <h1 className="font-montserrat font-bold text-2xl text-[#393939]">
            Appointment History
          </h1>
          <div className="h-0.5 w-full rounded-full bg-[#C3C3C3] my-4" />
          {pendingAppointments?.Appointment_Status === "isPending" ? (
            <div>
              <h1>No Appointment History</h1>
            </div>
          ) : (
            <div className=" w-full  py-2">
              <DatePicker
                className="mb-2 font-montserrat text-[#006B95] font-medium border-[#006B95] border-[1px ]"
                format={"MMMM DD, YYYY"}
                needConfirm
              />
              <div className="w-full h-screen rounded-xl bg-[#EAF1F4] p-4 flex flex-col gap-4">
                <div>
                  <label
                    htmlFor="titleHistory"
                    className="font-montserrrat font-bold text-2xl text-[#006B95] mr-4 tracking-wide"
                  >
                    Title:
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="titleHistory"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-8 w-64 placeholder:text-center rounded-lg outline-none font-hind px-2"
                  />
                </div>

                <label
                  htmlFor="bodyText"
                  className="font-montserrat text-lg text-[#006B95] font-semibold"
                >
                  Body:
                </label>
                <textarea
                  name="body"
                  id="bodyText"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  cols={30}
                  rows={4}
                  className="resize-none outline-none p-4 text-base font-hind rounded-xl mx-2"
                />
                <div className="h-full w-full overflow-y-scroll overflow-x-hidden flex flex-col gap-5 px-2">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white rounded-md drop-shadow-lg flex flex-col justify-between h-full p-4 ">
                      <h1 className="font-montserrat font-bold text-[#006B95]">
                        Observations
                      </h1>
                      <div className="h-full flex flex-col ">
                        {observations.map((observations, index) => {
                          return (
                            <div
                              key={observations.id}
                              className="flex flex-row gap-2 items-center mb-2"
                            >
                              <label
                                htmlFor="observationID"
                                className="font-hind text-[#797979]"
                              >
                                {index + 1}:
                              </label>
                              <input
                                type="text"
                                name="name"
                                id="observation-name"
                                value={observations.name}
                                onChange={(e) =>
                                  handleInputChange(e, observations.id)
                                }
                                className="h-10 rounded-md outline-none border-[#C3C3C3] border-[1px] px-2"
                              />
                              <span
                                className="cursor-pointer font-bold text-[#006B95]  "
                                onClick={(e) =>
                                  removeObservations(observations.id, e)
                                }
                              >
                                <FontAwesomeIcon icon={faMinus} />
                              </span>
                            </div>
                          );
                        })}
                        <div className="h-full flex justify-end items-end">
                          <button
                            type="button"
                            onClick={addObservations}
                            className="h-7 w-8 text-white font-hind rounded-lg bg-[#006B95]"
                          >
                            <FontAwesomeIcon icon={faPlus} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="h-fit p-4 bg-white rounded-md drop-shadow-md">
                      <h1 className="font-montserrat font-bold text-[#006B95]">
                        Patient Details
                      </h1>

                      <div className="flex flex-col gap-4 items-center">
                        <div className="grid grid-cols-2 gap-4 items-center">
                          <label htmlFor="weight-id" className="">
                            Weight:
                          </label>
                          <input
                            type="number"
                            name="weight"
                            id="weight-id"
                            placeholder="kg"
                            value={weight == 0 ? `` : weight}
                            onChange={(e) => setWeight(Number(e.target.value))}
                            className="ml-14 placeholder:text-end text-end  px-2 font-hind w-16 outline-none border-b-[1px] border-[#C3C3C3] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4 items-center">
                          <label htmlFor="height-id">Height:</label>
                          <input
                            type="number"
                            name="height"
                            id="height-id"
                            value={height}
                            onChange={(e) => setHeight(Number(e.target.value))}
                            placeholder="cm"
                            className="ml-14 placeholder:text-end text-end  w-16 px-2 border-[#C3C3C3] border-b-[1px] outline-none [&::-webkit-inner-spin-button]:appearance-none font-hind"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4 items-center">
                          <label htmlFor="mm-id">Blood Pressure:</label>
                          <input
                            type="number"
                            name="mm-dp"
                            id="bpID"
                            placeholder="mm"
                            value={mm}
                            onChange={(e) => setMM(Number(e.target.value))}
                            className="placeholder:text-end text-end w-16 px-2 border-[#C3C3C3] border-b-[1px] outline-none [&::-webkit-inner-spin-button]:appearance-none font-hind"
                          />
                          <input
                            type="number"
                            name="hg-dp"
                            id="hg-id"
                            placeholder="Hg"
                            value={hg}
                            onChange={(e) => setHg(Number(e.target.value))}
                            className="placeholder:text-end text-end w-16 px-2 border-[#C3C3C3] border-b-[1px] outline-none [&::-webkit-inner-spin-button]:appearance-none font-hind"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4 items-center w-full">
                          <label htmlFor="mg-id" className="col-span-2">
                            Blood Glucose:
                          </label>
                          <input
                            type="number"
                            name="mg"
                            id="mg-id"
                            placeholder="mg/dL"
                            value={bloodGlucose}
                            onChange={(e) =>
                              setBloodGlucose(Number(e.target.value))
                            }
                            className="placeholder:text-end text-end px-2 w-16 border-[#C3C3C3] border-b-[1px] outline-none [&::-webkit-inner-spin-button]:appearance-none font-hind"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="h-fit p-4 bg-white drop-shadow-md w-[293px] rounded-md">
                    <h1 className="text-[#006B95] font-montserrat font-bold">
                      Treatment
                    </h1>
                    <div className="h-fit flex flex-col gap-2">
                      {treatment.map((treatment, index) => {
                        return (
                          <ul
                            key={treatment.id}
                            className="flex flex-col gap-4 w-full"
                          >
                            <li className="grid grid-cols-7 items-center gap-2">
                              <div className=" flex flex-row items-center col-span-6 gap-4 w-full">
                                <h1>{index + 1}.</h1>
                                <input
                                  className=" border-[#C3C3C3] border-[1px] rounded-md h-9 outline-none px-2 py-1"
                                  type="text"
                                  name="name"
                                  id="treatment-id"
                                  value={treatment.name}
                                  onChange={(e) =>
                                    treatmentInputChange(e, treatment.id)
                                  }
                                />
                              </div>
                              <button
                                type="button"
                                className=""
                                onClick={(e) =>
                                  removeTreatment(treatment.id, e)
                                }
                              >
                                <FontAwesomeIcon
                                  icon={faMinus}
                                  className="text-[#006B9B]"
                                />
                              </button>
                            </li>
                          </ul>
                        );
                      })}
                      <div className="flex justify-end mt-4">
                        <button
                          type="button"
                          className="h-7 w-8 bg-[#006B95] rounded-md"
                          onClick={addTreatment}
                        >
                          <FontAwesomeIcon
                            icon={faPlus}
                            className="text-white "
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white drop-shadow-md w-[295px] rounded-lg h-fit p-4">
                    <h1 className="text-[#006B95] font-bold font-montserrat">
                      Duration
                    </h1>
                    <div>
                      <TimePicker
                        format={"H:mm"}
                        placeholder="hour : minute"
                        onChange={(time: Dayjs | null) =>
                          setDuration(time ? time.format("HH:mm") : "")
                        }
                      />
                    </div>
                  </div>
                  <div className="bg-white drop-shadow-md w-96 h-fit p-4 rounded-lg">
                    <h1 className="text-[#006B95] font-montserrat font-bold">
                      Document
                    </h1>
                    <div>
                      <textarea
                        name="document"
                        id="document-id"
                        value={document}
                        onChange={(e) => setDocument(e.target.value)}
                        className=" rounded-lg resize-none outline-none px-4 py-2 border-[#C3C3C3] border-[1px] w-full h-20"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end my-4 ">
                <button
                  className="h-10 w-28 rounded-md bg-[#006B95] text-white font-hind"
                  onClick={submitAppointmentHistory}
                >
                  Submit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
