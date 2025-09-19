import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ✅ generate ID tiket
function generateTicketId() {
  return "TICKET-" + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// ✅ POST → buat tiket baru
export async function POST(req: Request) {
  const supabase = await createClient();
  const body = await req.json();
  const ticketId = generateTicketId();

  const { data, error } = await supabase
    .from("konsultasi_spbe")
    .insert([
      {
        ticket: ticketId,
        nama_lengkap: body.nama,
        nomor_telepon: body.telepon,
        instansi_organisasi: body.instansi,
        asal_kota_kabupaten: body.kota,
        asal_provinsi: body.provinsi,
        uraian_kebutuhan_konsultasi: body.uraian_kebutuhan_konsultasi,
        skor_indeks_spbe: body.skorSpbe ?? null,
        kondisi_implementasi_spbe: body.kondisi ?? null,
        fokus_tujuan: body.fokusTujuan ?? null,
        mekanisme_konsultasi: body.mekanisme,
        surat_permohonan: body.suratPermohonan ?? null,
        butuh_konsultasi_lanjut: body.konsultasiLanjut === "Ya",
        status: "new",
        kategori: body.kategori ?? "tata kelola",
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Supabase insert error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, ticket: ticketId, data });
}

// ✅ GET → ambil tiket berdasarkan kode
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ticketCode = searchParams.get("ticket");

  if (!ticketCode) {
    return NextResponse.json(
      { error: "Kode tiket wajib diisi" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("konsultasi_spbe")
    .select("*")
    .eq("ticket", ticketCode)
    .maybeSingle();

  if (error) {
    console.error("Supabase fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Tiket tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(data);
}
