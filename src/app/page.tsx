"use client";
import Image from "next/image";
import { useState } from "react";
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { app } from "@/app/firebase/config";
import { useRouter } from "next/navigation";

export default function Home() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [error, setError] = useState("");
  // const [loading, setLoading] = useState(false);
  const auth = getAuth(app);
  // const [userID] = useAuthState(auth);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    // setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);

      router.push("/Userpage");
    } catch (err) {
      setError("Invalid email or password. Please try again.");
      console.log(err);
    } finally {
      // setLoading(false);
    }
  };

  return (
    <div className="bg-login h-screen flex justify-center items-center relative">
      <div className="h-[450px] w-[525px] bg-white rounded-[20px] flex flex-col items-center p-11 gap-7">
        <div className="flex items-center gap-1">
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
        </div>
        <form className="flex flex-col gap-6" onSubmit={handleLogin}>
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
              <p className="font-hind text-base font-medium text-[#4ABEC5] cursor-pointer bg-gradient-to-r bg-left-bottom from-[#4ABEC5] to-[#4ABEC5] bg-[length:0%_2px] bg-no-repeat hover:bg-[length:100%_2px] ease-out transition-all duration-300">
                Forgot Password?
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center">
            <a href="/Sign-Up" className="text-center text-[#13585c] font-hind">
              Don&lsquo;t have an account?Sign Up Here.
            </a>
            <input
              type="submit"
              value="Submit"
              className="cursor-pointer w-[230px] h-[50px] bg-[#6BE8DC] text-[22px] font-montserrat font-bold text-white rounded-lg hover:bg-blue-400"
            />
          </div>
        </form>
      </div>
      <div
        className={
          error
            ? `h-32 w-96 rounded-lg flex justify-center items-center absolute top-0 bg-red-500 font-hind text-white transition-all ease-in-out duration-300`
            : `hidden`
        }
      >
        <p>Invalid email or password, please try again.</p>
      </div>
    </div>
  );
}
