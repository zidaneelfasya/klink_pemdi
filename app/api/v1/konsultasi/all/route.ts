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
  
  // Filter parameters
  const search = searchParams.get('search');
  const kategori = searchParams.get('kategori');
  const status = searchParams.get('status');
  const unitIds = searchParams.get('units');
  
  // New parameter to enforce unit-based filtering
  const enforceUserUnits = searchParams.get('enforceUserUnits') === 'true';

  try {
    let userUnitIds: number[] = [];
    
    // If enforceUserUnits is true, get user's assigned units
    if (enforceUserUnits) {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (!userError && user) {
        const { data: userUnits } = await supabase
          .from('user_unit_penanggungjawab')
          .select('unit_id')
          .eq('user_id', user.id);
        
        userUnitIds = userUnits?.map(u => u.unit_id) || [];
        
        // If user has no assigned units, return empty result
        if (userUnitIds.length === 0) {
          return NextResponse.json({
            success: true,
            data: [],
            pagination: {
              total: 0,
              limit: limit ? parseInt(limit) : 0,
              offset: offset ? parseInt(offset) : 0,
              hasNext: false
            },
            message: 'User tidak memiliki unit yang ditugaskan'
          });
        }
      }
    }
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
            nama_pic
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
    query = query.order(sortBy, { 
      ascending: sortOrder === 'asc',
      nullsFirst: false // Ini akan menempatkan nilai NULL di akhir
    });

    // Apply filters
    if (search) {
      query = query.or(`nama_lengkap.ilike.%${search}%,instansi_organisasi.ilike.%${search}%,asal_kota_kabupaten.ilike.%${search}%,asal_provinsi.ilike.%${search}%`);
    }

    if (kategori) {
      const categories = kategori.split(',');
      query = query.in('kategori', categories);
    }

    if (status) {
      const statuses = status.split(',');
      query = query.in('status', statuses);
    }

    // For units filter, we'll need to do this differently because it's a relation
    if (unitIds) {
      const units = unitIds.split(',').map(id => parseInt(id));
      // We'll need to filter after getting the data due to the complex relation
    }

    // Get total count for pagination (with filters applied)
    let countQuery = supabase.from('konsultasi_spbe').select('*', { count: 'exact', head: true });
    
    if (search) {
      countQuery = countQuery.or(`nama_lengkap.ilike.%${search}%,instansi_organisasi.ilike.%${search}%,asal_kota_kabupaten.ilike.%${search}%,asal_provinsi.ilike.%${search}%`);
    }
    if (kategori) {
      const categories = kategori.split(',');
      countQuery = countQuery.in('kategori', categories);
    }
    if (status) {
      const statuses = status.split(',');
      countQuery = countQuery.in('status', statuses);
    }

    const { count: totalCount } = await countQuery;

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

    // Filter by units if specified (post-processing due to complex relation)
    let filteredData = data;
    
    // Apply user units filter if enforceUserUnits is true
    if (enforceUserUnits && userUnitIds.length > 0 && data) {
      filteredData = data.filter(item => 
        item.konsultasi_unit?.some((ku: any) => userUnitIds.includes(ku.unit_id))
      );
    }
    
    // Apply additional units filter if specified
    if (unitIds && filteredData) {
      const units = unitIds.split(',').map(id => parseInt(id));
      filteredData = filteredData.filter(item => 
        item.konsultasi_unit?.some((ku: any) => units.includes(ku.unit_id))
      );
    }

    // Transform data untuk format yang lebih mudah digunakan
    const transformedData = filteredData?.map(item => ({
      ...item,
      // Flatten PIC data
      pic_name: item.pic_list?.nama_pic || null,
      
      // Transform unit data menjadi array yang lebih simple
      units: item.konsultasi_unit?.map((ku: any) => ({
        unit_id: ku.unit_id,
        unit_name: ku.unit_penanggungjawab?.nama_unit || null,
        unit_pic_name: ku.unit_penanggungjawab?.nama_pic || null
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
        limit: limit ? parseInt(limit) : filteredData?.length || 0,
        offset: offset ? parseInt(offset) : 0,
        hasNext: totalCount ? (parseInt(offset || '0') + (parseInt(limit || String(totalCount)))) < totalCount : false
      },
      message: `Berhasil mengambil ${filteredData?.length || 0} dari ${totalCount || 0} data konsultasi`
    });

  } catch (error) {
    console.error('Error in GET /api/v1/konsultasi/all:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
