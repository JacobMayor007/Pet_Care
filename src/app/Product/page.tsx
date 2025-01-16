"use client";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase/config";
import { Modal } from "antd";
import "@ant-design/v5-patch-for-react-19";
import {
  addDoc,
  collection,
  query,
  where,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { faFileShield } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ClientNavbar from "../ClientNavbar/page";
import Loading from "../Loading/page";

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

const Product = () => {
  const [loading, setLoading] = useState(true);
  const [userUID, setUserUID] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>("");
  const [userData, setUserData] = useState<DocumentData[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]); // Store similar products
  const [quantity, setQuantity] = useState(0);
  const [warning, setWarning] = useState(false);
  const router = useRouter();
  const auth = getAuth();
  const [productID, setProductID] = useState<string | null>("");
  const [addToCart, setAddToCart] = useState(false);
  const shippingFee = 100;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
        setUserUID(user.uid);
      } else {
        router.push("/Login");
      }
    });
    return () => unsubscribe();
  }, [auth, router]);

  const fetchProductById = async (id: string) => {
    try {
      setLoading(true); // Start loading
      const docRef = doc(db, "products", id); // Replace "products" with your collection name
      const docSnap = await getDoc(docRef);

      console.log("Product: ", docSnap);

      if (docSnap.exists()) {
        // Spread all fields into the Product type and update state
        const fetchedProduct = { id: docSnap.id, ...docSnap.data() } as Product;
        setProduct(fetchedProduct);

        if (fetchedProduct.Seller_TypeOfProduct) {
          fetchSimilarProducts(fetchedProduct.Seller_TypeOfProduct);
        }
      } else {
        setProduct(null);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setProduct(null);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Function to fetch product data by ID

  const fetchSimilarProducts = async (typeOfProduct: string) => {
    try {
      const productsRef = collection(db, "products");
      const similarProductsQuery = query(
        productsRef,
        where("Seller_TypeOfProduct", "==", typeOfProduct)
      );

      const similarSnapshot = await getDocs(similarProductsQuery);

      const similar = similarSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];

      setSimilarProducts(similar);
    } catch (error) {
      console.error(error);
    }
  };

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

  const addToCartProduct = async () => {
    const fullName = userData
      .map((user) => `${user.User_FName} ${user.User_LName}`)
      .join(", ");

    if (!userEmail) {
      router.push("/Login");
    } else if (!product) {
      alert("Please select a product first");
    }

    try {
      setLoading(true);

      const addToCartRef = collection(db, "AddToCart");
      const addToCartItem = await addDoc(addToCartRef, {
        ATC_BuyerID: userEmail,
        ATC_BuyerFullName: fullName,
        ATC_OrderAt: Timestamp.now(),
        ATC_Products: {
          ATC_ProductID: product?.id,
          ATC_ProductName: product?.Seller_ProductName,
          ATC_ProductPrice: product?.Seller_ProductPrice,
        },
      });

      console.log("Add to Cart product has been succesful", addToCartItem);
      setLoading(false);
    } catch (error) {
      console.log("Error", error);
    }

    setAddToCart(false);
  };

  useEffect(() => {
    if (productID) {
      fetchProductById(productID);
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedProductID = localStorage.getItem("Product ID");
      if (storedProductID) setProductID(storedProductID);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("Stock", quantity.toString());
      localStorage.setItem("Shipping Fee", shippingFee.toString());
    }
  }, [productID, quantity, shippingFee]);

  // Display loading screen
  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Loading />
      </div>
    );
  }

  if (productID === "") {
    router.push("/");
  }

  function warningFunction() {
    if (quantity < 1) {
      setWarning(true);
    } else {
      setWarning(false);
      router.push("/Product/PlaceToOrder");
    }
  }

  return (
    <div className="w-full pt-4 pb-8 px-8 ">
      <ClientNavbar />
      <Modal
        open={warning}
        onOk={() => setWarning(false)}
        centered={true}
        onCancel={() => setWarning(false)}
        onClose={() => setWarning(false)}
      >
        Please select how many items you want to buy
      </Modal>
      <div className="h-full mt-2 z-[1]">
        <div className="grid grid-cols-2 gap-2 py-4 h-full justify-items-center mt-4 px-28">
          <div className="w-full">
            <div className=" w-full h-[487px] bg-white drop-shadow-xl rounded-2xl flex justify-center items-center">
              <FontAwesomeIcon icon={faFileShield} className="text-9xl" />
            </div>
            <div className="mt-4">
              <h1 className="font-montserrat font-bold text-xl text-[#393939]">
                Product Description:
              </h1>
              <p className="text-left leading-8 tracking-wide font-hind font-medium text-base text-[#232323]">
                {product?.Seller_ProductDescription}
              </p>
            </div>
          </div>
          <div className=" h-[487px]">
            <div className="w-auto flex flex-col gap-4">
              <h1 className="text-5xl font-bold font-montserrat">
                {product?.Seller_ProductName}
              </h1>
              <p className="font-hind text-sm text-blue-300 font-bold">
                {product?.Seller_UserFullName}
              </p>
            </div>
            <hr className="w-[75%]" />
            <div className="w-auto flex flex-col gap-10 pt-10">
              <div className="flex items-center gap-5">
                <h1 className="font-hind text-[#393939] text-xl font-bold">
                  Price:
                </h1>
                <p className="font-hind text-[#393939] text-lg font-normal">
                  {product?.Seller_ProductPrice}
                </p>
              </div>
              <div className="flex flex-row items-center gap-4">
                <h1 className="font-hind text-[#393939] text-xl font-bold">
                  Stock:
                </h1>
                <p className="font-hind text-[#2F9400] text-lg font-normal">
                  {Number(product?.Seller_StockQuantity) > 0
                    ? `In Stock`
                    : `No more stock`}
                </p>
              </div>
              <div className="flex flex-row gap-5 items-center">
                <h1 className="font-hind text-[#393939] text-xl font-bold">
                  Quantity:
                </h1>
                <div className="border-[1px] border-[#8C8989] rounded-xl w-[301px] grid grid-rows-[35px] grid-cols-3 items-center">
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity < 1 ? 0 : quantity - 1)}
                    className="border-r-[1px] border-[#8C8989] h-full active:scale-95 transition-all drop-shadow-md active:drop-shadow-xl"
                  >
                    <MinusOutlined />
                  </button>
                  <p className="text-center">{quantity}</p>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="border-l-[1px] border-[#8C8989] h-full active:scale-95 transition-all drop-shadow-md active:drop-shadow-xl"
                  >
                    <PlusOutlined />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <h1 className="font-hind text-[#393939] text-xl font-bold tracking-wide">
                  Shipping fee:
                </h1>
                <p className="font-hind text-[#393939] text-lg font-normal flex gap-2 items-center tracking-wide">
                  Standard Local{" "}
                  <span className="text-gray-400 text-sm">Php</span>100
                </p>
              </div>
              <div className="grid grid-cols-[250px_250px] grid-rows-[50px] gap-5">
                <button
                  onClick={() => setAddToCart(true)}
                  className="border-[1px] border-[#006B95] font-hind font-semibold drop-shadow-sm text-[#006B95] text-xl rounded-lg active:scale-110"
                >
                  Add to Cart
                </button>
                <Modal
                  open={addToCart}
                  onOk={addToCartProduct}
                  onCancel={() => {
                    console.log("Modal Cancelled");
                    setAddToCart(false);
                  }}
                  style={{
                    marginTop: "120px",
                  }}
                >
                  <p>Do you wish to add this product to your Cart?</p>
                </Modal>

                <button
                  onClick={() => {
                    {
                      warningFunction();
                    }
                  }}
                  className="bg-[#006B95] font-hind font-semibold text-white text-lg rounded-lg flex items-center justify-center"
                >
                  <span>Buy Now</span>
                </button>
              </div>
            </div>
          </div>
          <hr />
        </div>

        <div className="px-28 grid grid-cols-4 gap-5 justify-items-center w-full">
          {similarProducts.map((data, index) => {
            return (
              <a
                href="/Product"
                onClick={() => {
                  setProductID(data?.id);
                }}
                key={index}
                className=" list-none grid grid-rows-[120px_20px_40px_20px] p-3 bg-white drop-shadow-lg rounded-lg"
              >
                <li className="w-[230px] ">
                  <FontAwesomeIcon icon={faFileShield} className="text-8xl" />
                </li>
                <li className="w-[230px] font-hind text-xs text-[#565656]">
                  {data?.Seller_UserFullName}
                </li>
                <li className="w-[230px] font-hind text-sm font-semibold text-[#565656]">
                  {data?.Seller_ProductName}
                </li>
                <li className="w-[230px] font-hind text-sm font-semibold text-[#565656]">
                  Php {data?.Seller_ProductPrice}
                </li>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Product;
