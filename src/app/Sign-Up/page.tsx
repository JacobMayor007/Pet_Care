"use client";
import { auth } from "@/app/firebase/config";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { getFirestore, doc, setDoc, Timestamp } from "firebase/firestore";
import Link from "next/link";

export default function SignUp() {
  const [show, setShow] = useState(false);
  const [confirmShow, setConfirmShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fName, setFName] = useState("");
  const [lName, setLName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevent duplicate submissions

  const [createUserWithEmailAndPassword, loading] =
    useCreateUserWithEmailAndPassword(auth);
  const router = useRouter();
  const db = getFirestore();

  const handleSignUp = async () => {
    // Check if the form is already submitting
    if (isSubmitting) return;

    setIsSubmitting(true); // Prevent further clicks

    // Basic Validation
    if (!fName || !lName || !email || !password || !confirmPassword) {
      alert("All fields are required.");
      setIsSubmitting(false); // Re-enable the button
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      setIsSubmitting(false); // Re-enable the button
      return;
    }

    try {
      // Create user with Firebase Authentication
      const res = await createUserWithEmailAndPassword(email, password);
      if (!res || !res.user) {
        throw new Error("Failed to create user. Please try again.");
      }

      // Add user data to Firestore
      const userRef = doc(db, "Users", res.user.uid);
      await setDoc(userRef, {
        User_FName: fName,
        User_LName: lName,
        User_Email: email,
        User_UID: res.user.uid,
        CreatedAt: Timestamp.now(),
      });

      // Clear input fields
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setFName("");
      setLName("");

      // Redirect to login page or home page
      router.push("/Login");
    } catch (error) {
      console.error("Error during sign-up:", error);
    } finally {
      setIsSubmitting(false); // Re-enable the button after completion
    }
  };

  return (
    <div className="bg-[#9FE1DB] bg-signUp h-screen">
      <div className="xl:h-full 2xl:h-screen flex flex-row">
        <div className="w-[30%]">
          <h1 className="text-5xl font-sigmar font-normal text-white mt-20 text-center">
            Pet Care Pro
          </h1>
          <Image
            src="/Logo.svg"
            width={626}
            height={650}
            alt="Logo Icon"
            className="object-contain mt-8"
          />
        </div>
        <div className="w-[70%] rounded-[25px_0px_0px_25px] z-[2] bg-white flex flex-col px-20 gap-7">
          <div className="mt-14 flex flex-row items-center gap-2">
            <Image
              src="/PawPrint.svg"
              height={50}
              width={50}
              alt="Paw Print Icon"
            />
            <h1 className="text-3xl font-montserrat font-bold">Register</h1>
          </div>
          <form
            className="flex flex-col gap-7"
            onSubmit={(e) => {
              e.preventDefault();
              handleSignUp();
            }}
          >
            <div className="grid grid-cols-2 gap-10">
              <div className="relative">
                <label
                  className="absolute left-7 -top-2 bg-white text-sm  font-hind"
                  htmlFor="fName"
                >
                  First Name
                </label>
                <input
                  type="text"
                  name="first name"
                  id="fName"
                  className="h-12 w-full border-[1px] border-solid border-black outline-none rounded-md text-base font-hind px-2"
                  value={fName}
                  onChange={(e) => setFName(e.target.value)}
                />
              </div>
              <div className="relative">
                <label
                  className="absolute left-7 -top-2 bg-white text-sm  font-hind"
                  htmlFor="lName"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  name="last name"
                  id="lName"
                  className="h-12 w-full border-[1px] border-solid border-black outline-none rounded-md text-base font-hind px-2"
                  value={lName}
                  onChange={(e) => setLName(e.target.value)}
                />
              </div>
            </div>
            <div className="relative">
              <label
                htmlFor="emailsignup"
                className="absolute left-7 -top-2 bg-white text-sm  font-hind"
              >
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="emailsignup"
                className="h-12 w-full border-[1px] border-solid border-black outline-none rounded-md font-hind text-base px-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <label
                htmlFor="password"
                className="absolute left-7 -top-2 bg-white text-sm  font-hind"
              >
                Password
              </label>
              <input
                type={show ? `text` : `password`}
                name="password"
                id="password"
                className="h-12 w-full border-[1px] border-solid border-black outline-none rounded-md font-hind text base px-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="absolute right-3 bottom-4">
                <Image
                  src={show ? `/Eyeopen.png` : `/icon _eye close_.svg`}
                  height={33.53}
                  width={19}
                  alt="Show Password icon"
                  className="object-contain cursor-pointer"
                  onClick={() => setShow((prev) => !prev)}
                />
              </div>
            </div>
            <div className="relative">
              <label
                htmlFor="confirmPassword"
                className="absolute left-7 -top-2 bg-white text-sm font-hind"
              >
                Confirm Password
              </label>
              <input
                type={confirmShow ? `text` : `password`}
                name="confirm password"
                id="confirmPassword"
                className="h-12 w-full border-[1px] border-solid border-black outline-none rounded-md font-hind text-base px-2"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <div className="absolute right-3 bottom-4">
                <Image
                  src={confirmShow ? `/Eyeopen.png` : `/icon _eye close_.svg`}
                  height={33.53}
                  width={19}
                  alt="Show Password icon"
                  className="object-contain cursor-pointer"
                  onClick={() => setConfirmShow((prev) => !prev)}
                />
              </div>
            </div>
            <div className="flex flex-row gap-3">
              <input
                type="checkbox"
                name="agree"
                id="agreeTandT"
                className="w-6 h-6 text-base font-hind px-2"
              />
              <p>
                I agree to the{" "}
                <span className="text-[#4ABEC5] text-base font-hind">
                  Terms
                </span>{" "}
                and{" "}
                <span className="text-[#4ABEC5] text-base font-hind">
                  Conditions
                </span>
              </p>
            </div>
            <div>
              <button
                type="submit"
                id="signup-button"
                className={`w-[200px] h-[50px] ${
                  isSubmitting
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-[#6BE8DC] hover:bg-blue-400"
                } text-[22px] font-montserrat font-bold text-white rounded-lg`}
                disabled={Boolean(isSubmitting || loading)}
              >
                {loading ? "Signing Up..." : "Sign Up"}
              </button>
            </div>
          </form>
          <div>
            <p>
              Already have an account?{" "}
              <span className="text-base font-hind text-[#4ABEC5]">
                <Link href="/Login">Log in here</Link>
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
