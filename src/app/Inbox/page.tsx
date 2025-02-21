"use client";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { app } from "../firebase/config";
import { useAuthState } from "react-firebase-hooks/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import {
  faCircleUser,
  faCircleChevronDown,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import Signout from "../SignedOut/page";
import { db } from "../firebase/config";
import Image from "next/image";
import { SendOutlined } from "@ant-design/icons";
import {
  setDoc,
  orderBy,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
  DocumentData,
  Timestamp,
  addDoc,
  doc,
  limit,
} from "firebase/firestore";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect, useRef } from "react";

interface Message {
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Timestamp;
}

export default function Messages() {
  const router = useRouter();
  const [logout, setLogout] = useState(false);
  const auth = getAuth(app);
  const [user] = useAuthState(auth);
  const [searchUser, setSearchUser] = useState(false);
  const [userList, setUserList] = useState<DocumentData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<DocumentData[]>([]);
  const [filteredChattedUsers, setFilteredChattedUsers] = useState<
    DocumentData[]
  >([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const [receiveUser, setReceiveUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const dummy = useRef<HTMLDivElement | null>(null); // Ref for the scroll position

  useEffect(() => {
    // Only scroll if dummy.current is defined
    if (dummy.current) {
      dummy.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]); // This will run whenever messages array changes

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const fetchMyChats = async () => {
      if (!user?.email) return;

      try {
        const chatsCollection = collection(db, "chats");
        const q = query(
          chatsCollection,
          where("participants", "array-contains", user.email)
        );

        const snapshot = await getDocs(q);
        const chatsUsers = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data();
            const receiverEmail = data.participants.find(
              (email: string) => email !== user.email
            );

            // Fetch the last message for the chat
            const messagesCollection = collection(db, "messages");
            const messagesQuery = query(
              messagesCollection,
              where("senderId", "in", [user.email, receiverEmail]),
              where("receiverId", "in", [user.email, receiverEmail]),
              orderBy("timestamp", "desc"),
              limit(1)
            );
            const messagesSnapshot = await getDocs(messagesQuery);
            const lastMessage = messagesSnapshot.empty
              ? null
              : messagesSnapshot.docs[0].data().content;

            return {
              id: doc.id,
              email: receiverEmail,
              lastMessage: lastMessage,
            };
          })
        );

        const uniqueChats = chatsUsers.filter(
          (v, i, a) => a.findIndex((t) => t.email === v.email) === i
        );

        setFilteredChattedUsers(uniqueChats);
      } catch (error) {
        console.error("Error on fetching user chats", error);
      }
    };

    fetchMyChats();
  }, [user]); // Ensure this dependencies array is consistently present

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch data from the Firestore "Users" collection
        const userCollection = collection(db, "Users");

        const userSnapshot = await getDocs(userCollection);

        // Map over the snapshot to extract user data, including document ID
        const userList = userSnapshot.docs.map((doc) => {
          const data = doc.data();
          console.log("Document Data:", data); // Debugging line
          return {
            id: doc.id, // Add the document ID here
            fullName: `${data.User_FName || ""} ${
              data.User_LName || ""
            }`.trim(),
            email: data.User_Email || "No Email",
          };
        });

        console.log("Fetched Users:", userList); // Debugging line
        setUserList(userList); // Update the state with all users
        setFilteredUsers(userList); // Initially set filteredUsers to all users
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const receiver = userList.find(
    (user) => user.email === "receiver@example.com"
  );
  if (receiver) {
    console.log("Receiver ID:", receiver.id); // Use this ID as receiverId
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchValue(value); // Update search value in state

    // Filter users based on full name or email
    const filtered = userList.filter(
      (user) =>
        user.fullName.toLowerCase().includes(searchValue) ||
        user.email.toLowerCase().includes(searchValue)
    );

    setFilteredUsers(filtered); // Update filtered users with the search results
  };

  useEffect(() => {
    console.log("Current user email:", user?.email);
    console.log("Selected receiver email:", receiveUser?.email);
    console.log("Fetched messages:", messages);
  }, [messages, user, receiveUser]);

  useEffect(() => {
    if (user?.email && receiveUser?.email) {
      console.log(
        "Fetching messages for:",
        user.email,
        "and",
        receiveUser.email
      );

      const q = query(
        collection(db, "messages"),
        where("senderId", "==", user.email),
        where("receiverId", "==", receiveUser.email),
        orderBy("timestamp", "asc")
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const sentMessages = snapshot.docs.map((doc) => doc.data() as Message);

        const q2 = query(
          collection(db, "messages"),
          where("senderId", "==", receiveUser.email),
          where("receiverId", "==", user.email),
          orderBy("timestamp", "desc")
        );

        onSnapshot(q2, (snapshot2) => {
          const receivedMessages = snapshot2.docs.map(
            (doc) => doc.data() as Message
          );

          const combinedMessages = [...sentMessages, ...receivedMessages].sort(
            (a, b) => a.timestamp.toMillis() - b.timestamp.toMillis()
          );

          setMessages(combinedMessages);
          console.log("Fetched messages:", combinedMessages);
        });
      });

      return () => unsubscribe();
    }
  }, [user, receiveUser]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    setNewMessage("");
    // Check if newMessage, user, and receiveUser are valid
    if (newMessage.trim() === "" || !receiveUser || !user) {
      console.error("Invalid data: ", { newMessage, user, receiveUser });
      return;
    }

    // Check if the user and receiveUser have valid UID (email in this case)
    if (!user.email || !receiveUser.email) {
      console.error("User email or ReceiveUser email is missing:", {
        user,
        receiveUser,
      });
      return;
    }

    const message: Message = {
      senderId: user.email, // Use email as sender ID
      receiverId: receiveUser.email, // Use email as receiver ID
      content: newMessage,
      timestamp: Timestamp.now(),
    };

    console.log("Sending message: ", message); // Log the message to check values

    try {
      // Add the message to the 'messages' collection
      await addDoc(collection(db, "messages"), message);

      // Add/update the 'chats' collection
      const chatId = [user.email, receiveUser.email].join("_"); // Consistent chatId using email
      const chatRef = doc(db, "chats", chatId);

      // Set the chat document with participants and last message
      await setDoc(chatRef, {
        participants: [user.email, receiveUser.email],
        lastMessage: newMessage,
        timestamp: Timestamp.now(),
      });

      // Reset the message input
    } catch (error) {
      console.error("Error sending message or updating chat: ", error);
    }
  };

  const handleReceivedUser = (selectedUser: DocumentData) => {
    console.log("Selected user:", selectedUser);
    const userObj = { email: selectedUser.email } as User;
    setReceiveUser(userObj);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/Login");
      }
    });
    return () => unsubscribe();
  });

  return (
    <div>
      {user ? (
        <section className="relative">
          <nav className="h-20 flex flex-row justify-center items-center relative z-[10]">
            <div className="flex items-center gap-16">
              {/* Logo */}
              <div className="flex items-center">
                <Image src="/Logo.svg" height={54} width={54} alt="Logo" />
                <h1 className="text-2xl font-sigmar font-normal text-[#006B95]">
                  Pet Care
                </h1>
              </div>

              {/* Navigation Links */}
              <ul className="list-type-none flex items-center gap-3">
                <li className="w-28 h-14 flex items-center justify-center">
                  <a
                    href="/Provider"
                    className="font-montserrat text-base text-[#006B95]"
                  >
                    Dashboard
                  </a>
                </li>
                <li className="w-28 h-14 flex items-center justify-center ">
                  <a
                    href="/Inbox"
                    className="font-montserrat text-base text-[#006B95] flex flex-col"
                  >
                    Inbox
                    <span className="bg-blue-950 h-1 w-full rounded-full" />
                  </a>
                </li>
                <li className="w-28 h-14 flex items-center justify-center">
                  <a
                    href="/Notifications"
                    className="font-montserrat text-base text-[#006B95]"
                  >
                    Notifications
                  </a>
                </li>
                <li className="w-36 h-14 flex items-center justify-center">
                  <a
                    href="/AddProduct"
                    className="font-montserrat text-base text-[#006B95]"
                  >
                    Add New Product
                  </a>
                </li>
              </ul>

              {/* User Info */}
              <div className="flex items-center gap-4">
                <div className="relative cursor-pointer">
                  <FontAwesomeIcon
                    icon={faCircleUser}
                    className="text-blue-950 text-3xl"
                  />
                  <FontAwesomeIcon
                    icon={faCircleChevronDown}
                    className="absolute left-5 top-5 text-blue-950"
                    onClick={() => setLogout((prev) => !prev)}
                  />
                  <div
                    className={
                      logout
                        ? `flex flex-row absolute top-10 -left-8`
                        : `hidden`
                    }
                    onClick={() => setLogout(false)}
                  >
                    <Signout />
                  </div>
                </div>
                <h1 className="font-montserrat text-base text-[#006B95]">
                  {user.email}
                </h1>
              </div>
            </div>
          </nav>
          <div className="grid grid-cols-[35%_70%] h-screen px-32 py-5 gap-4 z-[1] ">
            <div className="pt-5 bg-white drop-shadow-xl rounded-xl px-5 flex flex-col gap-4 overflow-y-scroll relative">
              <div className="flex flex-row justify-between ">
                <h1 className="text-3xl font-montserrat font-bold text-[#393939]">
                  My Inbox
                </h1>
                <Image
                  src="Create Message.svg"
                  width={36}
                  height={36}
                  alt="Create A Message Icon"
                  className="object-contain cursor-pointer transform transition-all duration-50 ease-in-out active:scale-95"
                  onClick={() => setSearchUser((prev) => !prev)}
                />
              </div>
              <div className="h-12 bg-[#EAEBEC] rounded-xl flex flex-row items-center gap-5 px-4">
                <FontAwesomeIcon icon={faSearch} className="text-[#b6bbc0]" />
                <input
                  type="text"
                  className="w-full h-full outline-none bg-[#EAEBEC] rounded-xl font-hind tracking-wide text-base text-slate-900"
                  placeholder="Search for keywords here"
                />
              </div>
              <div>
                {filteredChattedUsers.length > 0 ? (
                  filteredChattedUsers.map((chatted, index) => {
                    return (
                      <ul
                        key={index}
                        className="cursor-pointer grid grid-cols-[50px_80%] items-center gap-1 grid-rows-[70px] border-[1px] bg-white drop-shadow-lg pl-4 rounded-2xl text-wrap"
                        onClick={() => handleReceivedUser(chatted)}
                      >
                        <li className="">
                          <FontAwesomeIcon
                            icon={faCircleUser}
                            className="text-4xl text-blue-950"
                          />{" "}
                        </li>
                        <div className="w-full">
                          <li className="text-lg font-hind font-medium text-[#292828] text-wrap overflow-hidden text-ellipsis whitespace-nowrap">
                            {chatted.email}
                          </li>
                          <li className="text-sm font-hind font-semibold text-[#9b9b9b]">
                            {chatted.lastMessage}
                          </li>
                        </div>
                      </ul>
                    );
                  })
                ) : (
                  <p className="text-gray-500">No users to display</p>
                )}
              </div>
            </div>
            <div className="pt-5 bg-white drop-shadow-xl rounded-xl overflow-y-scroll  relative flex-col h-full">
              {receiveUser ? (
                <div className="flex flex-col justify-between h-full gap-2">
                  <div className="h-10 px-5 border-b-[1px] border-slate-300 drop-shadow-md flex flex-row items-center pb-1 gap-4 ">
                    <FontAwesomeIcon icon={faCircleUser} className="text-2xl" />
                    <h1 className="font-montserrat font-medium text-[#565656] text-lg">
                      {receiveUser.email}
                    </h1>{" "}
                  </div>
                  <div className="w-full h-full overflow-y-auto p-4 flex flex-col">
                    {messages.length > 0 ? (
                      messages.map((msg, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg mb-2 max-w-[70%] ${
                            msg.senderId === user?.email
                              ? "bg-blue-500 text-white ml-auto text-right font-hind font-medium text-base"
                              : "bg-gray-300 text-black mr-auto text-left font-hind font-medium text-base"
                          }`}
                        >
                          {msg.content}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center">
                        No messages to display
                      </p>
                    )}
                    <div ref={messagesEndRef} />{" "}
                  </div>

                  {/*Submit Messages*/}
                  <form
                    className="w-full bg-[#f5f9d7] pr-1 pl-2 py-2 flex flex-row"
                    onSubmit={(e) => {
                      e.preventDefault(); // Prevent form submission
                      handleSend(e); // Trigger the send action
                    }}
                  >
                    <textarea
                      name="messages"
                      id="message"
                      className="resize-none bg-orange-400 outline-none w-full h-10 max-h-[8rem] px-4 py-2 rounded-2xl overflow-y-auto"
                      value={newMessage} // Bind value to newMessage state
                      onChange={(e) => setNewMessage(e.target.value)} // Update the state on input change
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault(); // Prevent adding a new line
                          handleSend(e); // Trigger the send action
                        }
                      }}
                      rows={1}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = "2.25rem"; // Reset height
                        target.style.height = `${Math.min(
                          target.scrollHeight,
                          128
                        )}px`; // Dynamically adjust height
                      }}
                    />
                    <button
                      type="submit" // Change to 'submit' to trigger form submission
                      className="ml-2 flex items-center justify-center bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 focus:outline-none"
                    >
                      <SendOutlined tabIndex={0} />
                    </button>
                  </form>
                </div>
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <div className="flex flex-col items-center gap-5">
                    <h1 className="font-sigmar font-extrabold text-5xl text-[#393939] ">
                      Select a message <br /> to display
                    </h1>
                    <button
                      className="bg-[#006B95] rounded-xl h-12 w-80 text-xl text-[#FEFEFE] transform transition-all duration-50 ease-in-out active:scale-95"
                      onClick={() => setSearchUser(true)}
                    >
                      New Message
                    </button>
                  </div>
                </div>
              )}
            </div>{" "}
          </div>
          {searchUser ? (
            <div className="absolute top-32 bg-white left-[480px] h-2/3 w-96 border-[1px] border-[#c9c8c8] drop-shadow-lg rounded-xl py-2 px-1">
              <div className="flex justify-end pr-1 mb-2">
                <FontAwesomeIcon
                  icon={faXmark}
                  className="cursor-pointer text-xl text-[#565656]"
                  onClick={() => setSearchUser(false)}
                />
              </div>

              <div className="h-10 bg-[#EAEBEC] rounded-xl flex flex-row items-center gap-5 px-4">
                <FontAwesomeIcon icon={faSearch} className="text-[#b6bbc0]" />
                <input
                  type="text"
                  className="w-full h-full outline-none bg-[#EAEBEC] rounded-xl font-hind tracking-wide text-base text-slate-900"
                  placeholder="To"
                  onChange={handleInputChange}
                />
              </div>
              <div>
                {filteredUsers.length > 0 && searchValue ? (
                  <ul>
                    {filteredUsers.map((user, index) => (
                      <li
                        key={index}
                        className="p-2 border-b border-gray-200 grid grid-cols-[50px_auto] w-full items-center gap-4"
                        onClick={() => {
                          handleReceivedUser(user);
                          setSearchUser(false);
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faCircleUser}
                          className="text-5xl text-gray-500"
                        />
                        <div className="font-bold flex flex-col">
                          <h1 className="font-montserrat text-lg font-extrabold text-[#393939]">
                            {user.fullName}
                          </h1>
                          <p className="text-sm font-montserrat font-light text-[#393939]">
                            {user.email}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p></p>
                )}
              </div>
            </div>
          ) : (
            <div></div>
          )}
        </section>
      ) : (
        <div className={user ? `block` : `hidden`}></div>
      )}
    </div>
  );
}
