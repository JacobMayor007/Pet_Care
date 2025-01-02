"use client";
import Image from "next/image";
import {
  faCircleCheck,
  faCircleXmark,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { addDoc, collection, query, where, getDocs } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase/config";
import { useRouter } from "next/navigation";

type Feature = {
  id: string;
  name: string;
  price: number;
};

const Review = () => {
  let priceIndicator = 0;
  const productName = localStorage.getItem("Product Name:");
  const productFeature = localStorage.getItem("Product Features:");
  const productDescription = localStorage.getItem("Product Description:");
  const productPrice = Number(localStorage.getItem("Product Price:"));
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [userId, setUserId] = useState("");
  const [confirm, setConfirm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Retrieve the image from localStorage
    const storedImage = localStorage.getItem("uploadedImage");
    if (storedImage) {
      setImageBase64(storedImage); // Set the Base64 string to state
    } else {
      console.warn("No image found in localStorage");
    }
  }, []);
  let totalPrice = 0;
  const typeOfPayment = localStorage.getItem("Type Of Payment:");

  // Initialize `feature` as an empty array to handle cases where `productFeature` is null
  const features: Feature[] = productFeature ? JSON.parse(productFeature) : [];
  features.map((data) => {
    priceIndicator += Number(data?.price);
  });
  totalPrice = productPrice + Number(priceIndicator);

  const toAddProduct = () => {
    router.push("/AddProduct");
  };

  const confirmation = () => {
    router.push("/Review");
    setConfirm(true);
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        console.warn("No user is logged in.");
      }
    });

    // Clean up the listener
    return () => unsubscribe();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const q = query(
        collection(db, "products"),
        where("ProductName", "==", productName),
        where("UserID", "==", userId) // Add other criteria as needed
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        const productData = {
          ProductName: productName,
          ProductDescription: productDescription,
          ProductFeatures: productFeature,
          ProductPrice: productPrice.toString(),
          PaymentMethod: typeOfPayment,
          TotalPrice: totalPrice,
          UserID: userId,
        };

        const docRef = await addDoc(collection(db, "products"), productData);
        console.log("Document written with ID:", docRef.id);
        setConfirm(false);
        router.push("/Userpage");
        window.localStorage.clear();
      } else {
        console.log("Duplicate product found. Document not added.");
        alert("This product already exists in your list.");
        setConfirm(false);
      }
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <div className="h-full bg-[#D9F0FF] pb-5">
      <nav className="flex flex-row items-center w-full xl:h-[80px] 2xl:h-[90px] border-2 border-b-[#06005B] px-14 justify-between">
        <div className="flex flex-row items-center gap-10">
          <h1 className="text-[45px] font-sigmar text-[#001050]">Pet Care</h1>
          <div className="flex flex-row gap-2">
            <h1 className="text-2xl font-montserrat text-[#06005B] font-bold">
              Review
            </h1>
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-montserrat text-[#06005B] font-bold">
            Pet Zafari
          </h1>
        </div>
      </nav>
      <div className="h-full bg-white py-7 mr-4 pr-8 flex flex-row gap-5 ml-32 my-10 rounded-lg">
        <div className="h-full w-1/3 flex flex-col pt-16 px-8 gap-10 ">
          <div className="flex justify-start items-start">
            {!productName ||
            !productDescription ||
            productPrice.toString() === "0" ? (
              <div className="flex flex-row gap-2">
                <FontAwesomeIcon
                  icon={faCircleXmark}
                  className="text-xl text-red-500 object-contain"
                />
                <h1 className="font-hind text-xl text-[#06005B]">
                  Product Information
                </h1>
              </div>
            ) : (
              <div className="flex flex-row gap-4 items-center">
                <FontAwesomeIcon
                  icon={faCircleCheck}
                  className="text-xl text-green-500 object-contain"
                />
                <h1 className="font-hind text-xl text-[#06005B]">
                  Product Information
                </h1>
              </div>
            )}
          </div>
          <div className="flex justify-start">
            <h1 className="font-hind text-xl text-[#06005B]  bg-left-bottom bg-gradient-to-r from-[#06005B] to-[#06005B] bg-no-repeat bg-[length:100%_4px] pb-2">
              Review
            </h1>
          </div>
        </div>
        <div className="h-full w-2/3 py-10 flex flex-col items-center gap-3 px-16 ">
          <div className="h-full w-full bg-[#86B2B4] flex flex-col p-10 rounded-lg gap-10">
            <div className="h-full py-4 flex justify-center items-center bg-white rounded-xl">
              {imageBase64 ? (
                <div>
                  <Image
                    src={imageBase64}
                    alt="Uploaded Product"
                    width={250}
                    height={250}
                    className="object-contain h-full rounded-lg"
                  />
                  <p className="text-center font-hind text-[#06005B] font-medium">
                    {productName}
                  </p>
                </div>
              ) : (
                <p>No image stored in localStorage</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 items-center bg-white p-8 rounded-xl">
              <h1 className="text-lg text-[#06005B] font-hind font-semibold">
                Product Details
              </h1>
              <div className="flex justify-end cursor-pointer">
                <FontAwesomeIcon
                  onClick={toAddProduct}
                  icon={faEdit}
                  className="object-contain text-blue-950"
                />
              </div>
              <h1 className="text-base font-hind tracking-wide text-[#565656] font-normal">
                Product Name
              </h1>
              <p className="text-end font-hind text-[#06005B] font-medium">
                {productName}
              </p>
              <h1 className="text-base font-hind text-[#565656] font-normal">
                Product Description
              </h1>
              <p className="text-[#06005B] text-base font-hind tracking-wide leading-8 font-medium text-end">
                {productDescription}
              </p>
              <h1 className="text-base font-hind text-[#565656] font-normal col-span-2">
                Product Features:
              </h1>
              <div>
                {features.map((data) => {
                  return (
                    <div
                      key={data?.id}
                      className=" text-[#565656] text-base font-hind font-medium tracking-wide "
                    >
                      {data?.name}
                    </div>
                  );
                })}
              </div>
              <div className="">
                {features.map((data) => {
                  return (
                    <div
                      key={data?.id}
                      className="text-[#06005B] font-hind text-base font-medium text-end"
                    >
                      {data?.price.toString()}
                    </div>
                  );
                })}
              </div>
              <h1 className="text-base font-medium font-hind text-[#565656]">
                Product Price
              </h1>
              <p className="text-base font-hind text-[#06005B] font-medium text-end">
                {productPrice}
              </p>
              <h1 className="text-base font-medium font-hind text-[#565656]">
                Type Of Payment
              </h1>
              <p className="text-base font-medium font-hind text-[#06005b] text-end">
                {typeOfPayment}
              </p>
              <h1 className="text-base font-medium font-hind text-[#565656]">
                Total Price
              </h1>
              <p className="text-[#06005b] font-medium text-base font-hind text-end">
                <span className="font-hind text-base text-[#9e9e9e] mx-1">
                  Php
                </span>{" "}
                {totalPrice}
              </p>
            </div>
          </div>
          <div className="w-full flex justify-between">
            <a
              className="py-2 w-24 font-hind text-base border-[1px] border-black shadow-sm shadow-slate-500 flex items-center justify-center rounded-lg"
              href="/AddProduct"
            >
              Cancel
            </a>
            <button
              onClick={confirmation}
              className="cursor-pointer border-[1px] border-black p-3 rounded-lg text-base font-hind tracking-wide shadow-md shadow-gray-700 text-white bg-[#06005b] flex items-center justify-center"
            >
              Submit
            </button>
          </div>
        </div>
      </div>

      {confirm ? (
        <div className="h-[200vh] w-screen absolute top-0 z-[1]">
          {/* Background blur */}
          <div className="h-full w-full absolute top-0 z-[1] blur-sm backdrop-blur-sm" />

          {/* Content */}
          <div className="z-[2] relative flex-col mx-[40%] my-[20%]">
            <FontAwesomeIcon
              icon={faXmark}
              className="ml-52 cursor-pointer"
              onClick={() => setConfirm(false)}
            />
            <div className="py-16 px-4 bg-blue-400 rounded-lg flex flex-row justify-between w-96">
              <button
                className="cursor-pointer border-[1px] p-3 text-base font-hind tracking-wide shadow-md shadow-gray-500 rounded-lg text-[#565656] bg-white font-medium"
                onClick={() => setConfirm(false)}
              >
                Cancel
              </button>
              <button className="cursor-pointer border-[1px] p-3 shadow-md shadow-gray-500 rounded-lg text-[#565656] bg-[#06005B] border-black">
                <a
                  className="text-base font-hind tracking-wide font-medium text-white"
                  onClick={onSubmit}
                >
                  Proceed to Post
                </a>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden"></div>
      )}
    </div>
  );
};

export default Review;
