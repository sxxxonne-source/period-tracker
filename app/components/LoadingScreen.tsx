"use client"

export default function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0e1a2b]">

      <div
        className="relative flex items-center justify-center"
        style={{
          width: "402px",
          height: "874px",
          borderRadius: "40px",
          background:
            "radial-gradient(circle at center, #2f4a6d 0%, #1f324d 40%, #0e1a2b 100%)"
        }}
      >

        {/* крест */}
        <div className="relative flex items-center justify-center">

          <div
            className="absolute"
            style={{
              width: "120px",
              height: "24px",
              background: "#c7ccd4",
              borderRadius: "6px",
              filter: "blur(1px)"
            }}
          />

          <div
            className="absolute"
            style={{
              width: "24px",
              height: "120px",
              background: "#4a8cff",
              borderRadius: "6px"
            }}
          />

        </div>

        {/* текст снизу */}
        <p className="absolute bottom-6 text-xs text-gray-400">
          2026TelegramMiniApp
        </p>

      </div>
    </div>
  )
}