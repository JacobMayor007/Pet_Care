"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import isAuthenticate from "../fetchData/User/isAuthenticate";
import { signingIn } from "./signin";
import { auth, db, fbprovider, provider } from "../firebase/config";
import { signInWithPopup } from "firebase/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loginAs, setLoginAs] = useState("Pet Owner");
  const [loginAsDropDown, setLoginAsDropDown] = useState(false);
  const [userType, setUserType] = useState("client");
  const [userRoute, setUserRoute] = useState("/");

  const loginAsData = [
    { key: 0, label: "Pet Owner", type: "client", route: "/" },
    { key: 1, label: "Pet Product Seller", type: "seller", route: "/Provider" },
    { key: 2, label: "Pet Vetirinarian", type: "doctor", route: "/Doctor" },
    {
      key: 3,
      label: "Pet Memorial Provider",
      type: "funeral",
      route: "/Funeral",
    },
    { key: 4, label: "Pet Sitting Services", type: "sitter", route: "/Sitter" },
    {
      key: 5,
      label: "Pet Boarding Services",
      type: "renters",
      route: "/Renters",
    },
  ];

  useEffect(() => {
    const checkAuthentication = async () => {
      const login = await isAuthenticate();
      if (login) {
        router.push("/");
      }
    };

    checkAuthentication();
  }, [router]);

  useEffect(() => {
    console.log(auth.currentUser);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (userType === "client") {
        await signingIn(email, password);
        return router.push(userRoute);
      }
      const docRef = collection(db, userType);
      const q = query(docRef, where("User_Email", "==", email));
      const docSnap = await getDocs(q);
      if (!docSnap.empty) {
        await signingIn(email, password);
        return router.push(`${userRoute}`);
      } else
        return (
          router.push("/Login"),
          alert(
            `This account is does not exist on ${loginAs}, go to the Sign Up Page if you want to register as ${loginAs}`
          )
        );
    } catch (err) {
      console.error(err);
      return alert("Invalid Email, and Password. Please try again");
    } finally {
      setLoading(false);
    }
  };

  const googleAuth = async () => {
    try {
      if (userType === "client") {
        await signInWithPopup(auth, provider);
        return router.push("/");
      }

      const docRef = collection(db, userType);
      const q = query(docRef, where("User_Email", "==", email));
      const docSnap = await getDocs(q);

      if (!docSnap.empty) {
        await signInWithPopup(auth, provider);
        return router.push(`${userRoute}`);
      } else
        return (
          router.push("/Login"),
          alert(
            `This account is does not exist on ${loginAs}, go to the Sign Up Page if you want to register as ${loginAs}`
          )
        );
    } catch (error) {
      console.error(error);
    }
  };

  const facebookAuth = async () => {
    try {
      if (userType === "client") {
        await signInWithPopup(auth, fbprovider);
        router.push("/");
      }

      const docRef = collection(db, userType);
      const q = query(docRef, where("User_Email", "==", email));
      const docSnap = await getDocs(q);

      if (!docSnap.empty) {
        await signInWithPopup(auth, fbprovider);
        return router.push(`${userRoute}`);
      } else
        return (
          router.push("/Login"),
          alert(
            `This account is does not exist on ${loginAs}, go to the Sign Up Page if you want to register as ${loginAs}`
          )
        );
    } catch (error) {
      console.error(error);
    }
  };

  console.log(
    "User Type: ",
    userType,
    "\nLogin As: ",
    loginAs,
    "\nRoute: ",
    userRoute
  );

  return (
    <div className="bg-login h-screen flex justify-center items-center relative">
      <div className="h-fit w-[600px] bg-white rounded-[20px] flex flex-col items-center p-11 gap-6">
        <div className="flex flex-row w-full justify-between items-center gap-1">
          <Image
            src="./Logo.svg"
            height={60}
            width={60}
            alt="Pet Care Logo"
            className="object-contain"
          />
          <h1 className="font-montserrat font-bold text-3xl text-[#33413E]">
            Login
          </h1>
          <div className="text-center relative">
            <h1 className="text-sm font-montserrat font-medium">Log in as?</h1>
            <h1
              onClick={() => setLoginAsDropDown((prev) => !prev)}
              className="cursor-pointer gap-2 absolute z-20 flex flex-row bg-white -left-16 border-2 w-52 justify-evenly text-nowrap px-2 py-2 rounded-md"
            >
              {loginAs}{" "}
              <span>
                <FontAwesomeIcon
                  icon={loginAsDropDown ? faChevronUp : faChevronDown}
                />
              </span>
            </h1>
            <div
              className={
                !loginAsDropDown
                  ? `hidden`
                  : `absolute z-20 top-16 -left-16 bg-white w-52 text-nowrap py-2 rounded-md text-start flex flex-col gap-1`
              }
            >
              {loginAsData.map((data) => {
                return (
                  <h1
                    key={data?.key}
                    className="hover:bg-slate-300 font-hind font-medium px-4 py-1 cursor-pointer"
                    onClick={() => {
                      setLoginAsDropDown(false);
                      setLoginAs(data?.label);
                      setUserType(data?.type);
                      setUserRoute(data?.route);
                    }}
                  >
                    {data?.label}
                  </h1>
                );
              })}{" "}
            </div>
          </div>
        </div>
        <form className="flex flex-col gap-4" onSubmit={handleLogin}>
          <div className="flex flex-col gap-5">
            <div className="relative">
              <label
                htmlFor="username"
                className="absolute bottom-8 text-sm bg-white left-3 font-hind font-light tracking-wide"
              >
                Email Address
              </label>
              <input
                type="text"
                id="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-[1px] border-solid border-black w-[423px] h-[45px] rounded-md outline-none px-2"
              />
            </div>
            <div className="relative">
              <label
                htmlFor="password"
                className="absolute bottom-9 left-3 bg-white px-1 text-sm "
              >
                Password
              </label>
              <input
                type={showPassword ? `text` : `password`}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-solid border-black w-[423px] h-[45px] rounded-md outline-none px-3  text-base"
              />
              <div className="absolute right-4 bottom-4">
                <Image
                  src={
                    showPassword ? `./Eyeopen.png` : `./icon _eye close_.svg`
                  }
                  height={33.53}
                  width={19}
                  alt="Show Password icon"
                  className="object-contain cursor-pointer"
                  onClick={() => setShowPassword((prev) => !prev)}
                />
              </div>
            </div>
          </div>
          <div className="w-[423px] h-[45px] flex flex-row items-center justify-between">
            <div className="flex flex-row items-center gap-2">
              <input
                type="checkbox"
                name="Remember Me"
                id="rmlogin"
                className="w-6 h-6 rounded-lg cursor-pointer"
              />
              <label
                htmlFor="rmlogin"
                className="font-hind text-base font-light cursor-pointer"
              >
                Remember me
              </label>
            </div>
            <div>
              <p className="font-hind text-base font-medium text-[#4ABEC5] cursor-pointer bg-gradient-to-r bg-left-bottom from-[#4ABEC5] to-[#4ABEC5] bg-no-repeat bg-[length:100%_2px] ease-out transition-all duration-300">
                Forgot Password?
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center items-center">
            <a href="/Sign-Up" className="text-center text-[#13585c] font-hind">
              Don&lsquo;t have an account?{" "}
              <span className="text-[#4ABEC5] font-hind font-medium bg-left-bottom bg-gradient-to-r italic from-[#4ABEC5] to-[#4ABEC5] rounded-xs bg-no-repeat bg-[length:100%_2px] ease-in-out transition-all duration-300">
                Sign Up Here.
              </span>
            </a>
          </div>
          <div className="w-full flex justify-center">
            <input
              type="submit"
              value={loading ? `Signing In...` : `Submit`}
              className="cursor-pointer w-[230px] h-[50px] bg-[#6BE8DC] text-[22px] font-montserrat font-bold text-white rounded-lg hover:bg-blue-400 text-center"
            />
          </div>
        </form>
        <div
          onClick={googleAuth}
          className="flex flex-row items-center justify-between gap-4 text-[#4ABEC5] px-10 py-3 rounded-md border-[#4ABEC5] border-[2px] cursor-pointer active:scale-95 active:bg-[#4ABEC5] active:text-white"
        >
          <Image
            src={`/GoogleIcon.svg`}
            width={30}
            height={30}
            alt="Google Icon"
          />
          <h1 className="font-montserrat font-bold">Continue with Google</h1>
        </div>
        <div
          onClick={facebookAuth}
          className="flex flex-row items-center justify-between gap-4 text-[#4ABEC5] px-7 py-3 rounded-md border-[#4ABEC5] border-[2px] cursor-pointer active:scale-95 active:bg-[#4ABEC5] active:text-white"
        >
          <Image
            src={`/Facebook-Icon.svg`}
            width={30}
            height={30}
            alt="Google Icon"
          />
          <h1 className="font-montserrat font-bold">Continue with Facebook</h1>
        </div>
      </div>
    </div>
  );
}
