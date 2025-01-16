"use client";
import { useEffect, useState } from "react";
import fetchProduct, {
  fetchFoodProduct,
  fetchItemProduct,
} from "./fetchData/fetchProducts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileShield } from "@fortawesome/free-solid-svg-icons";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Loading from "./Loading/page";
import ClientNavbar from "./ClientNavbar/page";
import Image from "next/image";
import fetchRoom from "./fetchData/fetchRoom";

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
}

interface Food {
  id: string;
  Seller_PaymentMethod?: string;
  Seller_TotalPrice?: string;
  Seller_ProductName?: string;
  Seller_ProductDescription?: string;
  Seller_ProductPrice?: string;
  Seller_UserID?: string;
  Seller_ProductFeatures?: string;
  Seller_UserFullName?: string;
}

interface Item {
  id: string;
  Seller_PaymentMethod?: string;
  Seller_TotalPrice?: string;
  Seller_ProductName?: string;
  Seller_ProductDescription?: string;
  Seller_ProductPrice?: string;
  Seller_UserID?: string;
  Seller_ProductFeatures?: string;
  Seller_UserFullName?: string;
}

interface Room {
  id?: string;
  Renter_CreatedAt?: string;
  Renter_Location?: string;
  Renter_PaymentMethod?: string;
  Renter_RoomDescription?: string;
  Renter_RoomFeatures?: string;
  Renter_RoomName?: string;
  Renter_RoomPrice?: number;
  Renter_TotalPrice?: number;
  Renter_TypeOfRoom?: string;
  Renter_UserFullName?: string;
  Renter_UserID?: string;
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [userID, setUserID] = useState("");
  const [room, setRoom] = useState<Room[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>("");
  const [productID, setProductID] = useState("");
  const [roomID, setRoomID] = useState("");
  const [item, setItem] = useState<Item[]>([]);
  const [food, setFood] = useState<Food[]>([]);

  const router = useRouter();
  console.log(userEmail);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserID(user.uid);
        setUserEmail(user.email);
      } else {
        router.push("/Login");
      }
    });

    return () => unsubscribe();
  });

  useEffect(() => {
    const getProducts = async () => {
      const fetchedProducts = await fetchProduct();
      setProducts(fetchedProducts);
    };

    getProducts();
  }, []);

  useEffect(() => {
    const getFood = async () => {
      const fetchedFood = await fetchFoodProduct();
      setFood(fetchedFood);
    };

    getFood();
  }, []);

  useEffect(() => {
    const getItem = async () => {
      const fetchItems = await fetchItemProduct();
      setItem(fetchItems);
    };

    getItem();
  }, []);

  useEffect(() => {
    const getRooms = async () => {
      const fetchedRooms = await fetchRoom();
      setRoom(fetchedRooms);
    };
    getRooms();
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedProductID = localStorage.getItem("Product ID");
      const storedRoomID = localStorage.getItem("Room ID");

      if (storedProductID) setProductID(storedProductID);
      if (storedRoomID) setRoomID(storedRoomID);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("Product ID", productID);
      localStorage.setItem("Room ID", roomID);
    }
  }, [productID, roomID]);

  return (
    <div className={userID ? `block` : `hidden`}>
      <nav className="z-10 relative">
        <ClientNavbar />
      </nav>
      <div
        className=" h-60 flex flex-row justify-between"
        style={{
          backgroundImage: "url('/Frame 15.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="flex items-center justify-center pl-8">
          <h1 className="font-montserrat font-bold text-6xl text-white">
            Only the <br /> Best for <br />
            your pet
          </h1>
        </div>

        <div className="overflow-hidden">
          <Image
            src="/Rectangle.svg"
            height={48}
            width={48}
            alt="Image"
            className="object-contain h-72 w-96 "
          />
        </div>
      </div>
      {loading ? (
        <Loading />
      ) : (
        <div className="flex flex-col gap-5 px-32 py-5  z-0">
          <div className="w-full grid grid-cols-5 gap-5 ">
            <div className="col-span-5 flex flex-row justify-between items-center">
              <h1 className="col-span-5 font-montserrat text-3xl text-[#393939] font-bold my-4">
                Products
              </h1>
              <a
                href="/Shopping"
                className="text-sm font-montserrat font-bold italic text-[#4ABEC5] flex flex-col gap-1"
              >
                View List Products
                <span className="w-full h-1 rounded-full bg-[#4ABEC5]" />
              </a>
            </div>

            {products.slice(0, 10).map((data) => {
              return (
                <a
                  href="/Product"
                  onClick={() => {
                    setLoading(true);
                    setProductID(data?.id || "");
                  }}
                  key={data?.id}
                  className="grid grid-rows-11 z-[1] gap-2 bg-white rounded-lg px-3 py-4 hover:border-blue-500 hover:border-[1px] drop-shadow-xl cursor-pointer h-64 transform transition-all active:scale-95 ease-out duration-50 select-none"
                >
                  <div className="flex justify-center row-span-5">
                    <FontAwesomeIcon icon={faFileShield} className="text-8xl" />
                  </div>
                  <div className="font-hind text-xs text-[#565656]">
                    {data?.Seller_UserFullName}
                  </div>
                  <div className="row-span-2 text-ellipsis font-hind text-sm text-[#565656] font-semibold">
                    {data?.Seller_ProductName || "Product Name"}{" "}
                  </div>
                  <div className="font-hind text-sm text-[#565656] font-semibold">
                    Php {data?.Seller_ProductPrice || "Price"}
                  </div>
                  <button className="row-span-2 bg-blue-500 text-white font-hind rounded-md">
                    View Item
                  </button>
                </a>
              );
            })}
          </div>
          <div className="w-full grid grid-cols-5 gap-5 ">
            <div className="col-span-5 flex flex-row justify-between items-center">
              <h1 className="col-span-5 font-montserrat text-3xl text-[#393939] font-bold my-4">
                Food
              </h1>
              <a
                href="/Shopping"
                className="text-sm font-montserrat font-bold italic text-[#4ABEC5] flex flex-col gap-1"
              >
                View Food Products
                <span className="w-full h-1 rounded-full bg-[#4ABEC5]" />
              </a>
            </div>
            {food.slice(0, 5).map((data) => {
              return (
                <a
                  href="/Product"
                  onClick={() => {
                    setLoading(true);
                    setProductID(data?.id || "");
                  }}
                  key={data?.id}
                  className="grid grid-rows-11 z-[1] gap-2 bg-white rounded-lg px-3 py-4 hover:border-blue-500 hover:border-[1px] drop-shadow-xl cursor-pointer h-64 transform transition-all active:scale-95 ease-out duration-50 select-none"
                >
                  <div className="flex justify-center row-span-5">
                    <FontAwesomeIcon icon={faFileShield} className="text-8xl" />
                  </div>
                  <div className="font-hind text-xs text-[#565656]">
                    {data?.Seller_UserFullName}
                  </div>
                  <div className="row-span-2 text-ellipsis font-hind text-sm text-[#565656] font-semibold">
                    {data?.Seller_ProductName || "Product Name"}{" "}
                  </div>
                  <div className="font-hind text-sm text-[#565656] font-semibold">
                    Php {data?.Seller_ProductPrice || "Price"}
                  </div>
                  <button className="row-span-2 bg-blue-500 text-white font-hind rounded-md">
                    View Item
                  </button>
                </a>
              );
            })}
          </div>
          <div className="w-full grid grid-cols-5 gap-5 ">
            <div className="col-span-5 flex flex-row justify-between items-center">
              <h1 className="col-span-5 font-montserrat text-3xl text-[#393939] font-bold my-4">
                Pet Items
              </h1>
              <a
                href="/Shopping"
                className="text-sm font-montserrat font-bold italic text-[#4ABEC5] flex flex-col gap-1"
              >
                View List Item
                <span className="w-full h-1 rounded-full bg-[#4ABEC5]" />
              </a>
            </div>
            {item.slice(0, 5).map((data) => {
              return (
                <a
                  href="/Product"
                  onClick={() => {
                    setLoading(true);
                    setProductID(data?.id || "");
                  }}
                  key={data?.id}
                  className="grid grid-rows-11 z-[1] gap-2 bg-white rounded-lg px-3 py-4 hover:border-blue-500 hover:border-[1px] drop-shadow-xl cursor-pointer h-64 transform transition-all active:scale-95 ease-out duration-50 select-none"
                >
                  <div className="flex justify-center row-span-5">
                    <FontAwesomeIcon icon={faFileShield} className="text-8xl" />
                  </div>
                  <div className="font-hind text-xs text-[#565656]">
                    {data?.Seller_UserFullName}
                  </div>
                  <div className="row-span-2 text-ellipsis font-hind text-sm text-[#565656] font-semibold">
                    {data?.Seller_ProductName || "Product Name"}{" "}
                  </div>
                  <div className="font-hind text-sm text-[#565656] font-semibold">
                    Php {data?.Seller_ProductPrice || "Price"}
                  </div>
                  <button className="row-span-2 bg-blue-500 text-white font-hind rounded-md">
                    View Item
                  </button>
                </a>
              );
            })}
          </div>
        </div>
      )}

      <div className="w-full grid grid-cols-3 gap-5 px-32 my-4">
        <div className="col-span-3 flex flex-row justify-between items-center">
          <h1 className="font-montserrat text-3xl text-[#393939] font-bold my-4">
            Rooms
          </h1>
          <a
            href="/Booking"
            className="text-sm font-montserrat font-bold italic text-[#4ABEC5] flex flex-col gap-1"
          >
            View List Room
            <span className="w-full h-1 rounded-full bg-[#4ABEC5]" />
          </a>
        </div>
        {room.slice(0, 5).map((data) => {
          return (
            <a
              href="/Booking/Room"
              onClick={() => {
                setLoading(true);
                setRoomID(data?.id || "");
              }}
              key={data?.id}
              className="grid grid-rows-11 z-[1] gap-2 bg-white rounded-lg px-3 py-4 hover:border-blue-500 hover:border-[1px] drop-shadow-xl cursor-pointer h-64 w-72 transform transition-all active:scale-95 ease-out duration-50 select-none"
            >
              <div className="flex justify-center row-span-5">
                <FontAwesomeIcon icon={faFileShield} className="text-8xl" />
              </div>
              <div className="font-hind text-xs text-[#565656]">
                {data?.Renter_UserFullName}
              </div>
              <div className="row-span-2 text-ellipsis font-hind text-sm text-[#565656] font-semibold">
                {data?.Renter_RoomName || "Room Name"}{" "}
              </div>
              <div className="font-hind text-sm text-[#565656] font-semibold">
                Php {data?.Renter_RoomPrice || "Price"}
              </div>
              <button className="row-span-2 bg-blue-500 text-white font-hind rounded-md">
                View Room
              </button>
            </a>
          );
        })}
      </div>
    </div>
  );
}
