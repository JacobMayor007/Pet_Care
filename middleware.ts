import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
  const userID = req.cookies.get("userID")?.value; 
  const pathname = req.nextUrl.pathname; // Get the requested pathname

  console.log("userID:", userID); 
  console.log("Pathname:", pathname);

  if (userID === undefined && pathname === "/Userpage") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (userID && pathname === "/") {
    return NextResponse.redirect(new URL("/Userpage", req.url));
  }

  return NextResponse.next(); 
}
