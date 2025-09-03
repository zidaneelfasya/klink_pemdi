import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  
  try {
    const { data, error } = await supabase
      .from('unit_penanggungjawab')
      .select(`
        *,
        pic_list:pic_id(
          id,
          nama_pic
        )
      `)
      .order('nama_unit', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: 'Gagal mengambil daftar unit penanggung jawab', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Daftar unit penanggung jawab berhasil diambil'
    });

  } catch (error) {
    console.error('Error in GET /api/v1/konsultasi/units:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
