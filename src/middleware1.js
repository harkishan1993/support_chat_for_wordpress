// import { NextResponse } from "next/server";
// import { origin } from "./utils/origin";


// export async function middleware(request) {
//   const path = request.nextUrl.pathname;

//   // Define public paths that don't need authentication
//   const isPublicPath = path === "/login" || path === "/signup";

//   // Check authentication by calling the backend API
//   try {
//     const res = await fetch(`${origin}/api/auth/me`, {
//       method: "POST",
//       credentials: "include",  // Important for cookies!
//       headers: {
//         "Content-Type": "application/json",
//         Cookie: request.headers.get("cookie") || "",
//       },
//     });
//     const user = await res.json();
//     if (user?.id) {
//       // User is authenticated, prevent access to login/signup
//       if (isPublicPath) {
//         return NextResponse.redirect(new URL("/", request.url));
//       }
//     } else {
//       // User is NOT authenticated, restrict access to protected routes
//       if (!isPublicPath) {
//         return NextResponse.redirect(new URL("/login", request.url));
//       }
//     }
//   } catch (error) {
//     console.error("Auth Check Error:", error);
//     if (!isPublicPath) {
//       return NextResponse.redirect(new URL("/login", request.url));
//     }
//   }

//   return NextResponse.next();
// }

// // Apply middleware to specific routes
// export const config = {
//   matcher: ["/", "/login", "/signup"],
// };
