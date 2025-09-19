import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

function generateTicketId() {
  return "TICKET-" + Math.random().toString(36).substr(2, 9).toUpperCase()
}

// 📌 CREATE TICKET
export async function POST(req: Request) {
  const supabase = await createClient()
  const body = await req.json()
  const ticketId = generateTicketId()

  const { data, error } = await supabase
    .from("konsultasi_spbe")
    .insert([{
      ticket: ticketId,
      nama_lengkap: body.nama,
      nomor_telepon: body.telepon,
      instansi_organisasi: body.instansi,
      asal_kota_kabupaten: body.kota,
      asal_provinsi: body.provinsi,
      uraian_kebutuhan_konsultasi: body.uraianKebutuhan,
      skor_indeks_spbe: body.skorSpbe ?? null,
      kondisi_implementasi_spbe: body.kondisi ?? null,
      fokus_tujuan: body.fokusTujuan ?? null,
      mekanisme_konsultasi: body.mekanisme,
      surat_permohonan: body.suratPermohonan ?? null,
      butuh_konsultasi_lanjut: body.konsultasiLanjut === "Ya",
      status: "new",
      kategori: body.kategori ?? "tata kelola"
    }])
    .select()
    .single()

  if (error) {
    console.error("Supabase insert error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, ticket: ticketId, data })
}

// 📌 GET TICKET BY ID
export async function GET(req: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(req.url)
  const ticketId = searchParams.get("ticket")

  console.log("Mencari tiket:", ticketId)

  if (!ticketId) {
    return NextResponse.json(
      { success: false, error: "Ticket ID tidak ditemukan" },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from("konsultasi_spbe")
    .select("*")
    .eq("ticket", ticketId)
    .maybeSingle() // supaya gak error keras kalau kosong

  if (error) {
    console.error("Supabase fetch error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }

  if (!data) {
    return NextResponse.json(
      { success: false, error: "Tiket tidak ditemukan" },
      { status: 404 }
    )
  }

  return NextResponse.json({ success: true, data })
}
