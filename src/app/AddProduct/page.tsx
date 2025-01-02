"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { app } from "../firebase/config";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faCircleChevronDown,
  faCircleUser,
} from "@fortawesome/free-solid-svg-icons";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function AddProduct() {
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    const auth = getAuth(app);

    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Retrieve the user's unique ID
        setUserId(user.email);
      } else {
        // No user is signed in
        setUserId("");
      }
    });

    // Cleanup the subscription when the component is unmounted
    return () => unsubscribe();
  }, []);

  const router = useRouter();

  const [, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  // Function to convert file to base64
  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle file change and save to localStorage
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);

      const base64 = await getBase64(selectedFile);
      localStorage.setItem("uploadedImage", base64);
      setPreview(base64);
      console.log("Image saved to localStorage:", base64);
    }
  };

  useEffect(() => {
    const savedImage = localStorage.getItem("uploadedImage");
    if (savedImage) {
      setPreview(savedImage);
    }
  }, []);

  const [errorMessage, setErrorMessage] = useState(false);
  const [typeOfPayment, setTypeOfPayment] = useState<string>(() => {
    return localStorage.getItem("Type Of Payment:") || "";
  });

  const [productPrice, setProductPrice] = useState(() => {
    return localStorage.getItem("Product Price:") || 0;
  });

  const [productName, setProductName] = useState(() => {
    return localStorage.getItem("productName") || "";
  });
  useEffect(() => {
    localStorage.setItem("productName", productName);
  }, [productName]);
  const [productDescription, setProductDescription] = useState(() => {
    return localStorage.getItem("Product Description:") || "";
  });

  const [active, setActive] = useState(0);
  interface Feature {
    id: string;
    name: string;
    price: string;
  }

  const [productFeature, setProductFeatures] = useState<Feature[]>(() => {
    const savedFeatures = localStorage.getItem("Product Features:");
    // Check if savedFeatures exists and parse it to an array of product features
    return savedFeatures
      ? JSON.parse(savedFeatures) // Parse the saved string to an array of features
      : [{ id: uuidv4(), name: "", price: "" }]; // Default value if no saved features
  });
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const paymentMethods = [
    {
      id: 1,
      label: "Cash On Hand",
      img: "./Cash On Hand Image.svg",
    },
    {
      id: 2,
      label: "GCash",
      img: "./GCash Image.svg",
    },
    {
      id: 3,
      label: "Debit / Credit",
      img: "./Credit_Debit Card Image.svg",
    },
  ];

  const addFeatures = (e: React.MouseEvent) => {
    e.preventDefault();

    const _addFeatures = [...productFeature];
    _addFeatures.push({
      id: uuidv4(),
      name: "",
      price: "",
    });
    setProductFeatures(_addFeatures);
  };

  const removeFeatures = (id: string, e: React.MouseEvent) => {
    e.preventDefault();

    let _addFeatures = [...productFeature];
    _addFeatures = _addFeatures.filter((feature) => feature.id !== id);
    setProductFeatures(_addFeatures);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: string
  ) => {
    const { name, value } = e.target;
    const updatedFeatures = productFeature.map((feature) =>
      feature.id === id ? { ...feature, [name]: value } : feature
    );
    setProductFeatures(updatedFeatures);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const productFeatures = JSON.stringify(productFeature);

    if (!productName || productPrice == "0" || !productDescription) {
      setErrorMessage(true);
      router.push("/AddProduct");
    } else {
      setErrorMessage(false);
      localStorage.setItem("Product Name:", productName);
      localStorage.setItem("Product Description:", productDescription);
      localStorage.setItem("Product Features:", productFeatures);
      localStorage.setItem("Product Price:", productPrice.toString());
      localStorage.setItem("Type Of Payment:", typeOfPayment);
      router.push("/Review");
    }

    console.log("Name of the Product: ", productName);
    console.log("Product Description: ", productDescription);
    console.log("Product Features:", productFeature);
    console.log("Price of the Product: ", productPrice);
    console.log("Payment Method", typeOfPayment);
  };

  return (
    <div className=" h-full pb-5 relative">
      <nav className="h-20 flex flex-row justify-center items-center">
        <div className="flex items-center gap-16">
          <div className="flex items-center">
            <Image src="./Logo.svg" height={54} width={54} alt="Logo" />
            <h1 className="text-2xl font-sigmar font-normal text-[#006B95]">
              Pet Care
            </h1>
          </div>
          <ul className="list-type-none flex items-center gap-3">
            <li className="w-28 h-14 flex items-center justify-center">
              <a
                href="/Userpage"
                className="font-montserrat text-base text-[#006B95]"
              >
                Dashboard
              </a>
            </li>
            <li className="w-28 h-14 flex items-center justify-center">
              <a
                href="/Inbox"
                className="font-montserrat text-base text-[#006B95]"
              >
                Inbox
              </a>
            </li>
            <li className="w-28 h-14 flex items-center justify-center">
              <a
                className="font-montserrat text-base text-[#006B95]"
                href="/Notifications"
              >
                Notifications
              </a>
            </li>
            <li className="w-36 h-14 flex items-center justify-center">
              <a
                className="font-montserrat text-base text-[#006B95]"
                href="/AddProduct"
              >
                Add New Product
              </a>
            </li>
          </ul>
          <div className="flex items-center gap-4">
            <div className="relative cursor-pointer">
              <FontAwesomeIcon
                icon={faCircleUser}
                className="text-blue-950 text-3xl"
              />
              <FontAwesomeIcon
                icon={faCircleChevronDown}
                className="absolute left-5 top-5 text-blue-950"
              />
            </div>

            <h1 className="font-montserrat text-base text-[#006B95]">
              {userId}
            </h1>
          </div>
        </div>
      </nav>
      <div className="h-full bg-white py-7 mr-4 pr-8 flex flex-row gap-5 ml-32 my-10 rounded-lg">
        <div className="h-full w-1/3 flex flex-col pt-16 px-8 gap-10 ">
          <div className="flex flex-col justify-start items-start">
            <h1 className="font-hind text-xl text-[#06005B] pb-2 flex flex-col">
              Product Information
              <span className="h-1 w-full bg-[#06005B] rounded-full" />
            </h1>
          </div>
          <div>
            <h1 className="font-hind text-xl text-[#06005B]">Review</h1>
          </div>
        </div>
        <div className="h-full w-2/3 pt-4 flex flex-col gap-3 ">
          <h1 className="text-2xl font-hind text-[#06005B] tracking-wide font-medium">
            Product Information
          </h1>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="bg-[#86B2B4] py-8 px-16 rounded-xl">
              <h1 className="text-base text-white font-hind font-medium tracking-wide mb-4">
                Image
              </h1>
              <div className="h-32 flex flex-row items-center px-4 border-white border-[1px] gap-2 rounded-md">
                {preview && (
                  <div>
                    <Image
                      className="object-contain h-16"
                      src={preview}
                      height={96}
                      width={96}
                      alt="Image Product"
                    />
                  </div>
                )}

                <label
                  htmlFor="image-file"
                  className="h-24 w-24 flex flex-col items-center justify-center rounded-md outline-dotted outline-2 outline-[#565656] hover:text-white hover:outline-blue-500 cursor-pointer"
                >
                  <span className="text-2xl">+</span>
                  Upload
                </label>
                <input
                  type="file"
                  accept="image/*"
                  name="images"
                  id="image-file"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              <div className="flex flex-col gap-3 my-5">
                <h1 className="text-base text-white font-hind font-medium">
                  Name of Product
                </h1>
                <input
                  className="border-[1px] border-white rounded-lg w-full h-10 px-3 outline-none bg-[#86B2B4] text-white"
                  name="productName"
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>

              <div>
                <h1 className="text-base text-white font-hind font-medium">
                  Description
                </h1>
                <textarea
                  className="border-[1px] border-white w-full resize-none rounded-md px-3 py-1 outline-none bg-[#86B2B4] text-white"
                  name="product-description"
                  id="textarea-description"
                  cols={30}
                  rows={3}
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 bg-[#86B2B4] py-8 px-8 rounded-xl ">
              <div
                className={
                  productFeature.length > 0
                    ? `flex flex-col gap-2  items-center py-5 rounded-lg `
                    : `hidden`
                }
              >
                {productFeature.map((feature) => (
                  <div key={feature.id} className="">
                    <div className="xl:grid xl:grid-cols-[100px_200px_150px_200px_50px] xl:gap-3 items-center">
                      <label htmlFor="feature">
                        <h1 className="text-base font-hind font-medium text-white">
                          Feature:
                        </h1>
                      </label>
                      <input
                        className="h-10 border-white border-[1px] rounded-md text-base font-hind font-normal px-2 bg-[#86B2B4] outline-none text-white"
                        type="text"
                        name="name"
                        id="feature-name"
                        value={feature.name}
                        onChange={(e) => handleInputChange(e, feature.id)}
                      />
                      <label htmlFor="">
                        <h1 className="text-base font-hind font-medium text-white">
                          Price on Feature:
                        </h1>
                      </label>
                      <input
                        className="h-10 outline-none text-white border-white border-[1px] rounded-md text-base font-hind font-normal px-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-[#86B2B4]"
                        type="number"
                        name="price"
                        id="feature-price"
                        value={feature.price}
                        onChange={(e) => handleInputChange(e, feature.id)}
                      />
                      <span
                        className="h-7 w-7 mt-5 xl:mt-0 rounded-full hover:bg-slate-500 hover:text-white flex items-center justify-center font-bold cursor-pointer border-[1px] border-white"
                        onClick={(e) => removeFeatures(feature.id, e)}
                      >
                        -
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <button
                  className="h-12 w-auto px-4 rounded-lg  border-white border-[1px] font-hind  font-medium tracking-wide cursor-pointer text-white"
                  onClick={addFeatures}
                >
                  Add More Feature +
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4 bg-[#86B2B4] py-8 px-16 rounded-xl">
              <div>
                <h1 className="text-base font-hind font-medium text-white">
                  Price
                </h1>
                <input
                  className="w-full bg-[#86B2B4] h-10 rounded-md px-2 outline-none text-base font-hind font-medium border-[1px] border-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-white"
                  name="productPrice"
                  value={productPrice === 0 ? "" : productPrice}
                  onChange={(e) => setProductPrice(Number(e.target.value))}
                  type="number"
                />
              </div>

              <div>
                <h1 className="text-white font-hind text-lg tracking-wide font-medium">
                  Type Of Payment
                </h1>
                <div className="h-14 w-full flex items-center justify-between border-[1px] border-white px-2 rounded-lg">
                  <div>
                    {typeOfPayment ? (
                      <div className="px-2">
                        <h1 className="font-hind text-base font-medium text-white">
                          {typeOfPayment}
                        </h1>
                      </div>
                    ) : (
                      <div>
                        {paymentMethods.map((data) => {
                          return (
                            active === data?.id && (
                              <div
                                className="flex flex-row gap-4"
                                key={data?.id}
                              >
                                <Image
                                  src={data.img}
                                  width={24}
                                  height={24}
                                  alt={`${data?.label} icon`}
                                />
                                <p className="text-base font-hind font-medium text-white">
                                  {data?.label}
                                </p>
                              </div>
                            )
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {showPaymentMethods ? (
                    <Image
                      onClick={() => setShowPaymentMethods(false)}
                      className="cursor-pointer object-contain "
                      src="./Arrow Circle Down.svg"
                      height={24}
                      width={24}
                      alt="Arrow Down"
                    />
                  ) : (
                    <Image
                      onClick={() => setShowPaymentMethods(true)}
                      className="cursor-pointer object-contain rotate-180 "
                      src="./Arrow Circle Down.svg"
                      height={24}
                      width={24}
                      alt="Arrow Down"
                    />
                  )}
                </div>

                {showPaymentMethods ? (
                  <div
                    className="flex flex-col gap-1"
                    onClick={() => setShowPaymentMethods(false)}
                  >
                    {paymentMethods.map((data) => {
                      return (
                        <div
                          className="flex flex-row gap-4 h-12 items-center hover:bg-blue-300 px-4 rounded-lg cursor-pointer"
                          key={data?.id}
                          onClick={() => {
                            setActive(data?.id);
                            setTypeOfPayment(data.label);
                          }}
                        >
                          <Image
                            src={data?.img}
                            height={24}
                            width={24}
                            alt={`${data?.label} icon`}
                          />
                          <p className="text-base font-hind font-medium tracking-wide text-white">
                            {data?.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex flex-row items-center justify-between">
              <Link
                className="p-2 w-24 font-hind text-base border-[1px] border-black shadow-sm shadow-slate-500 flex items-center justify-center rounded-lg"
                href="/Userpage"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="cursor-pointer border-[1px] border-black p-2 w-24 rounded-lg text-base font-hind tracking-wide shadow-md shadow-gray-700 text-white bg-[#06005b] flex items-center justify-center"
              >
                <input
                  className="cursor-pointer"
                  type="submit"
                  value="Submit"
                />
              </button>
            </div>
          </form>
        </div>
      </div>

      {errorMessage ? (
        <div className="h-[200vh] w-screen absolute top-0 z-[1]">
          {/* Background blur */}
          <div className="h-full w-full absolute top-0 z-[1] blur-sm backdrop-blur-sm" />

          {/* Content */}
          <div className="z-[2] relative flex-col mx-[40%] my-[20%]">
            <FontAwesomeIcon
              icon={faXmark}
              className="ml-64 cursor-pointer"
              onClick={() => setErrorMessage(false)}
            />
            <div className="p-4 bg-white rounded-lg flex flex-col w-auto">
              <h1 className="font-montserrat text-red-600 font-medium text-xl">
                Make sure to provide the following fields
              </h1>
              <p className="text-lg font-hind font-medium text-yellow-300">
                Product Name
              </p>
              <p className="text-lg font-hind font-medium text-yellow-300">
                Product Description
              </p>
              <p className="text-lg font-hind font-medium text-yellow-300">
                Product Price
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden"></div>
      )}
    </div>
  );
}
