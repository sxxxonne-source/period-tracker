"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function BottomNav() {

  const pathname = usePathname()

  function isActive(path: string) {
    return pathname === path
      ? "bg-[#3b82f6]"
      : "bg-[#1e293b]"
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        display: "flex",
        justifyContent: "space-around",
        padding: "10px 0",
        background: "#0b1220"
      }}
    >

      <Link href="/dashboard">
        <button className={`${isActive("/dashboard")} px-4 py-2 rounded-xl text-white`}>
          🏠
        </button>
      </Link>

      <Link href="/add-period">
        <button className={`${isActive("/add-period")} px-4 py-2 rounded-xl text-white`}>
          ➕
        </button>
      </Link>

      <Link href="/history">
        <button className={`${isActive("/history")} px-4 py-2 rounded-xl text-white`}>
          📊
        </button>
      </Link>

    </div>
  )
}