"use client"
import { useSearchParams } from "next/navigation"

export default function TicketPage() {
  const searchParams = useSearchParams()
  const ticketId = searchParams.get("ticketId")
  const question = searchParams.get("question")

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-[400px] text-center">
        <h1 className="text-2xl font-bold mb-4">🎟️ Tiket Anda</h1>
        <p className="mb-2">Kode Tiket: <span className="font-mono">{ticketId}</span></p>
        <p className="mb-2">Pertanyaan: {question}</p>

        <button
          onClick={() => window.print()}
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Cetak Tiket
        </button>
      </div>
    </div>
  )
}
