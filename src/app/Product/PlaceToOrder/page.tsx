"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "@ant-design/v5-patch-for-react-19";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  Timestamp,
  query,
  where,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/app/firebase/config";
import ClientNavbar from "@/app/ClientNavbar/page";
import Image from "next/image";

interface Product {
  id: string;
  Seller_PaymentMethod?: string;
  Seller_TotalPrice?: string;
  Seller_ProductName?: string;
  Seller_ProductDescription?: string;
  Seller_ProductPrice?: string;
  Seller_UserID?: string;
  Seller_ProductFeatures?: string;
  Seller_UserFullName?: string;
  Seller_TypeOfProduct?: string;
  Seller_StockQuantity?: string;
}

export default function PlaceToOrder() {
  const [product, setProduct] = useState<Product | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>("");
  const [userData, setUserData] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [userUID, setUserID] = useState("");
  const [typeOfPayment, setTypeOfPayment] = useState<string | null>("");
  const [typeOfPaymentArray, setTypeOfPaymentArray] = useState<string[] | null>(
    null
  );
  const [quantity, setQuantity] = useState<number | null>(0);
  const [shippingFee, setShippingFee] = useState<number | null>(0);
  const [productID, setProductID] = useState("");
  const [address, setAddress] = useState("");
  const [deliverTo, setDeliverTo] = useState("");
  const [buyerCNumber, setBuyerCNumber] = useState<string | null>("");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedTypeOfPayment = localStorage.getItem("selectedPayment:");
      const storedDeliverTo = localStorage.getItem("Deliver To:");
      const storedAddress = localStorage.getItem("Address:");
      const storedBuyerCNumber = localStorage.getItem("Buyer Contact Number:");
      const storedQuantity = Number(localStorage.getItem("Stock"));
      const storedShippingFee = Number(localStorage.getItem("Shipping Fee"));
      const storedProductID = localStorage.getItem("Product ID");

      if (storedProductID) setProductID(storedProductID);
      if (storedQuantity) setQuantity(storedQuantity);
      if (storedShippingFee) setShippingFee(storedShippingFee);
      setTypeOfPayment(storedTypeOfPayment || "");
      setAddress(storedAddress || "");
      setDeliverTo(storedDeliverTo || "");
      setBuyerCNumber(storedBuyerCNumber || "");
    }
  }, []);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      typeOfPayment !== null &&
      buyerCNumber !== null
    ) {
      localStorage.setItem("selectedPayment:", typeOfPayment);
      localStorage.setItem("Deliver To:", deliverTo);
      localStorage.setItem("Address:", address);
      localStorage.setItem("Buyer Contact Number:", buyerCNumber);
    }
  }, [typeOfPayment, deliverTo, address, buyerCNumber]);

  const fetchProductById = async (id: string) => {
    try {
      const docRef = doc(db, "products", id); // Replace "products" with your collection name
      const docSnap = await getDoc(docRef);

      console.log("Product: ", docSnap);

      if (docSnap.exists()) {
        // Spread all fields into the Product type and update state
        const fetchedProduct = { id: docSnap.id, ...docSnap.data() } as Product;
        setProduct(fetchedProduct);
        if (typeof fetchedProduct.Seller_PaymentMethod === "string") {
          // If the features are stored as a string, split by comma and space to get the payment methods
          setTypeOfPaymentArray(
            fetchedProduct.Seller_PaymentMethod.split(", ")
          );
        } else {
          // Fallback if it's already an array or null
          setTypeOfPaymentArray(fetchedProduct.Seller_PaymentMethod || null);
        }
      } else {
        setProduct(null);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setProduct(null);
    }
  };

  useEffect(() => {
    if (productID) {
      fetchProductById(productID); // Fetch product based on the ID from the link
    }
  }, [productID]);

  console.log(typeOfPaymentArray);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
        setUserID(user.uid);
      } else {
        router.push("/Login");
      }
    });

    return () => unsubscribe();
  });

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

  const orderedProduct = async () => {
    const fullName = userData
      .map((user) => `${user.User_FName} ${user.User_LName}`)
      .join(", ");

    try {
      setLoading(true);

      if (!userEmail || !product) {
        console.error("User is not logged in or product data is missing");
        return;
      }

      const orderRef = collection(db, "Orders");

      const docRef = await addDoc(orderRef, {
        OC_BuyerID: userUID,
        OC_BuyerFullName: fullName,
        OC_OrderAt: Timestamp.now(),
        OC_PaymentMethod: typeOfPayment,
        OC_DeliverTo: deliverTo,
        OC_ContactNumber: buyerCNumber,
        OC_DeliverAddress: address,
        OC_Products: {
          OC_ProductID: product.id,
          OC_ProductName: product.Seller_ProductName,
          OC_ProductPrice: product.Seller_ProductPrice,
          OC_ProductQuantity: quantity,
          OC_ShippingFee: shippingFee,
        },
        OC_SellerID: product.Seller_UserID,
        OC_SellerFullName: product.Seller_UserFullName,
        OC_TotalPrice:
          Number(product.Seller_ProductPrice) * Number(quantity) +
          Number(shippingFee),
      });

      console.log("Product added to order successfully with ID:", docRef.id);
      router.push("/");
    } catch (error) {
      console.error("Failed to add order collection", error);
    } finally {
      setLoading(false);
      localStorage.clear();
    }
  };

  return (
    <div>
      <ClientNavbar />
      <div className="px-36 py-8 ">
        <h1 className="font-montserrat text-3xl font-bold">Place To Order</h1>
        <div className="grid grid-cols-5 gap-2 mt-10 mx-8 bg-white drop-shadow-lg pl-5 py-10 rounded-xl">
          <div className="col-span-3 font-montserrat text-2xl">Product</div>
          <div className="font-montserrat text-2xl  text-center">Qty.</div>
          <div className="font-montserrat text-2xl  text-center">
            Total Price
          </div>
          <div className="col-span-5 border-b border-gray-300 my-4 mr-4" />
          <div className="font-montserrat text-2xl">
            Product Image of {product?.Seller_ProductName}
          </div>
          <div className="col-span-2 ml-2">
            <h1 className="font-hind text-sm font-bold text-blue-600">
              {product?.Seller_UserFullName}
            </h1>
            <h1 className="font-montserrat text-2xl">
              {product?.Seller_ProductName}
            </h1>
            <h1 className="font-hind text-xl font-normal mt-4">
              Php {product?.Seller_ProductPrice}
            </h1>
          </div>
          <div className=" text-center font-hind text-lg">{quantity}</div>
          <div className=" text-center font-hind text-lg">
            Php {Number(quantity) * Number(product?.Seller_ProductPrice)}
          </div>
          <div></div>
        </div>
        <div className="grid grid-cols-7 gap-5 mt-10 mx-8 bg-white drop-shadow-lg pl-5 py-10 rounded-xl">
          <h1 className="col-span-7 font-montserrat text-xl">
            Delivery Information
          </h1>
          <div className="col-span-7 border-b border-gray-300 my-4 mr-4" />

          <div className="flex flex-col col-span-2 gap-2 justify-end">
            <label
              htmlFor="deliverTo "
              className="font-montserrat text-base font-medium"
            >
              Enter the Name of the Recipient
            </label>
            <input
              type="text"
              name="deliver-to"
              placeholder="Ex. John Doe"
              id="deliver-To"
              value={deliverTo}
              onChange={(e) => setDeliverTo(e.target.value)}
              className="bg-white drop-shadow-lg outline-none px-2 h-12 rounded-md border-blue-300 border font-hind text-base  inline w-full"
            />
          </div>
          <div className="flex flex-col col-span-2 justify-end gap-2">
            <label
              htmlFor="buyer-contact-number"
              className="font-montserrat text-base font-medium"
            >
              Contact number of the recepient
            </label>
            <input
              type="text"
              name="bCNumber"
              id="buyer-contact-number"
              placeholder="09123456789"
              maxLength={11}
              value={buyerCNumber || ""}
              onChange={(e) => setBuyerCNumber(e.target.value)}
              className="bg-white drop-shadow-lg outline-none px-2 h-12 rounded-md border-blue-300 border font-hind text-base items-end [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          <div className="flex flex-col justify-end col-span-3 mr-4 gap-2">
            <label
              htmlFor="user-address"
              className="font-montserrat text-base font-medium"
            >
              Enter Address
            </label>
            <input
              type="text"
              name="address"
              id="user-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="2010 Gov. M. Cuenco Ave, Cebu City, 6000 Cebu"
              className="bg-white drop-shadow-lg outline-none px-2 h-12 rounded-md border-blue-300 border font-hind text-base "
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-10 mx-8 bg-white drop-shadow-lg pl-5 py-10 rounded-xl">
          <h1 className="col-span-3 font-montserrat text-xl">
            Type Of Payment
          </h1>
          <div className="col-span-3 border-b border-gray-300 my-4 mr-4" />

          {typeOfPaymentArray?.map((data, index) => {
            return (
              <div key={index} className="flex flex-row items-center gap-2">
                <input
                  type="radio"
                  name="payment-method"
                  id={data}
                  value={data}
                  checked={typeOfPayment === data}
                  onChange={() => setTypeOfPayment(data)}
                />
                <Image
                  src={`/${data} Image.svg`}
                  height={30}
                  width={30}
                  alt={data}
                />
                <label
                  htmlFor={data}
                  className="font-montserrat font-semibold text-base"
                >
                  {data}
                </label>
              </div>
            );
          })}
        </div>

        <div className="flex flex-row justify-end w-full mx-8 mt-8 p-2">
          <div className="w-96 h-full bg-white drop-shadow-lg mx-8 rounded-xl py-2 px-4 flex flex-col gap-4">
            <h1 className="font-montserrat text-lg text-[#232323] font-semibold">
              Do you wish to checkout?
            </h1>
            <hr className="my-2" />
            <h1 className="font-montserrat italic">
              Image Of {product?.Seller_ProductName}
            </h1>
            <p className="text-[#232323] font-hind text-lg">
              Type Of Payment: {typeOfPayment}
            </p>
            <p className="text-[#232323] font-hind text-lg">
              Quantity: {quantity}
            </p>
            <p className="text-[#232323] font-hind text-lg">
              Product Price: {product?.Seller_ProductPrice}
            </p>
            <p className="text-[#232323] font-hind text-lg">
              Shipping Fee: Php {shippingFee?.toString()}
            </p>
            <p className="text-[#232323] font-hind text-lg font-bold">
              Total Price: Php{" "}
              {Number(product?.Seller_ProductPrice) * Number(quantity) +
                Number(shippingFee)}
            </p>
            <div className="flex justify-end">
              <button
                onClick={orderedProduct}
                className="h-10 w-32 bg-blue-500 font-hind text-white text-lg rounded-md "
              >
                {loading ? `Checking out ...` : `Checkout`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
