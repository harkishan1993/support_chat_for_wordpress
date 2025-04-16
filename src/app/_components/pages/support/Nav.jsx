"use client"
import React from 'react'
import Link from "next/link"
import { Button } from "@mui/material";
import { usePathname } from "next/navigation";
import Send from "@mui/icons-material/Send";
function Nav() {
    const pathname = usePathname();
  return (
    <nav className="text-white p-4 flex justify-between items-center shadow-md bottom-0 w-full h-[50px]">
    <Link href="/support" passHref>
      <Button
        variant={pathname === "/support" ? "contained" : "outlined"}
        color="secondary"
      >
        Home
      </Button>
    </Link>
    <Link href="/chat" passHref>
      <Button
        variant={pathname === "/chat" ? "contained" : "outlined"}
        color="secondary"
        endIcon={<Send />}
      >
        Chat with Us
      </Button>
    </Link>
  </nav>
  )
}

export default Nav