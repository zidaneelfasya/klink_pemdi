import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  
  // Get search parameters
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit');
  const offset = searchParams.get('offset');
  const sortBy = searchParams.get('sortBy') || 'created_at';
  const sortOrder = searchParams.get('sortOrder') || 'desc';

  try {
    // Query untuk mengambil SEMUA data konsultasi dengan semua relasi
    let query = supabase
      .from('konsultasi_spbe')
      .select(`
        *,
        pic_list:pic_id(
          id,
          nama_pic
        ),
        konsultasi_unit(
          konsultasi_id,
          unit_id,
          unit_penanggungjawab(
            id,
            nama_unit,
            pic_list:pic_id(
              id,
              nama_pic
            )
          )
        ),
        konsultasi_topik(
          konsultasi_id,
          topik_id,
          topik_konsultasi(
            id,
            nama_topik
          )
        )
      `);

    // Apply sorting
    // query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    query = query.order(sortBy, { 
      ascending: sortOrder === 'asc',
      nullsFirst: false // Ini akan menempatkan nilai NULL di akhir
    });

    // Apply pagination jika ada
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    if (offset && limit) {
      query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Gagal mengambil semua data konsultasi', details: error.message },
        { status: 500 }
      );
    }

    // Get total count
    const { count: totalCount } = await supabase
      .from('konsultasi_spbe')
      .select('*', { count: 'exact', head: true });

    // Transform data untuk format yang lebih mudah digunakan
    const transformedData = data?.map(item => ({
      ...item,
      // Flatten PIC data
      pic_name: item.pic_list?.nama_pic || null,
      
      // Transform unit data menjadi array yang lebih simple
      units: item.konsultasi_unit?.map((ku: any) => ({
        unit_id: ku.unit_id,
        unit_name: ku.unit_penanggungjawab?.nama_unit || null,
        unit_pic_name: ku.unit_penanggungjawab?.pic_list?.nama_pic || null
      })) || [],
      
      // Transform topik data menjadi array yang lebih simple
      topics: item.konsultasi_topik?.map((kt: any) => ({
        topik_id: kt.topik_id,
        topik_name: kt.topik_konsultasi?.nama_topik || null
      })) || [],
      
      // Remove nested objects untuk cleaner response
      pic_list: undefined,
      konsultasi_unit: undefined,
      konsultasi_topik: undefined
    }));

    return NextResponse.json({
      success: true,
      data: transformedData,
      pagination: {
        total: totalCount || 0,
        limit: limit ? parseInt(limit) : data?.length || 0,
        offset: offset ? parseInt(offset) : 0,
        hasNext: totalCount ? (parseInt(offset || '0') + (parseInt(limit || String(totalCount)))) < totalCount : false
      },
      message: `Berhasil mengambil ${data?.length || 0} dari ${totalCount || 0} data konsultasi`
    });

  } catch (error) {
    console.error('Error in GET /api/v1/konsultasi/all:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
