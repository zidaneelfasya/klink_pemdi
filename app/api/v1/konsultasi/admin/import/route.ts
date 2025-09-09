import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import * as XLSX from 'xlsx';

interface ImportedRow {
  nama_lengkap?: string;
  nomor_telepon?: string;
  instansi_organisasi?: string;
  asal_kota_kabupaten?: string;
  asal_provinsi?: string;

  uraian_kebutuhan_konsultasi?: string;
  topik_konsultasi?: string; // Contains comma-separated topics
  skor_indeks_spbe?: number;
  kondisi_implementasi_spbe?: string;
  fokus_tujuan?: string;
  mekanisme_konsultasi?: string;
  surat_permohonan?: string;
  butuh_konsultasi_lanjut?: string | boolean;
  kategori?: string;
  status?: string;
  pic?: string; // PIC name from CSV
  pic_name?: string; // Alternative column name for PIC
  unit?: string; // Unit names from CSV (comma-separated)
  unit_names?: string; // Alternative column name for units
  topik_names?: string; // Alternative column name for topics
  solusi?: string;
  ticket?: string;
  timestamp?: string;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    error: string;
    data?: any;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check user authentication and permissions
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Check file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
      'application/csv' // alternative CSV MIME type
    ];

    if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload Excel (.xlsx, .xls) or CSV file.' },
        { status: 400 }
      );
    }

    // Read file
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet) as ImportedRow[];

    if (jsonData.length === 0) {
      return NextResponse.json(
        { error: 'File is empty or no valid data found' },
        { status: 400 }
      );
    }

    // Get reference data for validation
    const [picResult, unitResult, topikResult] = await Promise.all([
      supabase.from('pic_list').select('id, nama_pic'),
      supabase.from('unit_penanggungjawab').select('id, nama_unit'),
      supabase.from('topik_konsultasi').select('id, nama_topik')
    ]);

    const picMap = new Map(
      picResult.data?.map(pic => [pic.nama_pic.toLowerCase(), pic.id]) || []
    );
    
    const unitMap = new Map(
      unitResult.data?.map(unit => [unit.nama_unit.toLowerCase(), unit.id]) || []
    );
    
    // Create unit alias mapping for common abbreviations and variations
    const unitAliasMap = new Map<string, number>();
    unitResult.data?.forEach(unit => {
      const lowerName = unit.nama_unit.toLowerCase();
      unitAliasMap.set(lowerName, unit.id);
      
      // Add common aliases
      if (lowerName.includes('akselerasi')) {
        unitAliasMap.set('aksel', unit.id);
        unitAliasMap.set('tim aksel', unit.id);
      }
      if (lowerName.includes('aplikasi')) {
        unitAliasMap.set('aplikasi', unit.id);
        unitAliasMap.set('direktorat aplikasi', unit.id);
      }
      if (lowerName.includes('infrastruktur')) {
        unitAliasMap.set('infrastruktur', unit.id);
        unitAliasMap.set('direktorat infrastruktur', unit.id);
      }
      if (lowerName.includes('strajak')) {
        unitAliasMap.set('strajak', unit.id);
      }
      if (lowerName.includes('bakti')) {
        unitAliasMap.set('bakti', unit.id);
      }
      if (lowerName.includes('bssn')) {
        unitAliasMap.set('bssn', unit.id);
      }
      if (lowerName.includes('kemenpanrb') || lowerName.includes('menpanrb')) {
        unitAliasMap.set('kemenpanrb', unit.id);
        unitAliasMap.set('menpanrb', unit.id);
      }
      if (lowerName.includes('ditjen')) {
        unitAliasMap.set('ditjen infrastruktur digital', unit.id);
      }
    });
    
    const topikMap = new Map(
      topikResult.data?.map(topik => [topik.nama_topik.toLowerCase(), topik.id]) || []
    );
    
    // Create topic alias mapping for variations
    const topikAliasMap = new Map<string, number>();
    topikResult.data?.forEach(topik => {
      const lowerName = topik.nama_topik.toLowerCase();
      topikAliasMap.set(lowerName, topik.id);
      
      // Add common aliases and partial matches based on the CSV data
      if (lowerName.includes('arsitektur') && lowerName.includes('tata kelola')) {
        topikAliasMap.set('arsitektur, tata kelola, regulasi, dan kebijakan', topik.id);
      }
      if (lowerName.includes('aplikasi spbe')) {
        topikAliasMap.set('aplikasi spbe/pemerintah digital', topik.id);
      }
      if (lowerName.includes('infrastruktur spbe')) {
        topikAliasMap.set('infrastruktur spbe/pemerintah digital', topik.id);
      }
      if (lowerName.includes('akses internet')) {
        topikAliasMap.set('akses internet', topik.id);
      }
      if (lowerName.includes('manajemen data')) {
        topikAliasMap.set('manajemen data dan informasi', topik.id);
      }
      if (lowerName.includes('keamanan data')) {
        topikAliasMap.set('keamanan data', topik.id);
      }
      if (lowerName.includes('layanan digital')) {
        topikAliasMap.set('layanan digital pemerintah', topik.id);
      }
      if (lowerName.includes('sumber daya manusia')) {
        topikAliasMap.set('pengelolaan sumber daya manusia spbe/pemerintah digital', topik.id);
      }
      if (lowerName.includes('pengukuran') && lowerName.includes('evaluasi')) {
        topikAliasMap.set('pengukuran dan evaluasi spbe/pemerintah digital', topik.id);
      }
      
      // Handle special cases from CSV
      topikAliasMap.set('literasi spbe', topik.id);
      topikAliasMap.set('provinsi cerdas', topik.id);
      topikAliasMap.set('implentasi indeks pemerintah digital (pemdi)', topik.id);
      topikAliasMap.set('implementasi indeks pemerintah digital', topik.id);
    });

    const result: ImportResult = {
      success: 0,
      failed: 0,
      errors: []
    };

    // Process each row
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowNumber = i + 2; // +2 because Excel rows start at 1 and we skip header

      try {
        // Validate required fields (only nama_lengkap is truly required)
        if (!row.nama_lengkap?.trim()) {
          throw new Error('Nama lengkap is required');
        }

        // Validate enum values
        const validKategori = ['tata kelola', 'infrastruktur', 'aplikasi', 'keamanan informasi', 'SDM'];
        const validStatus = ['new', 'on process', 'ready to send', 'konsultasi zoom', 'done', 'FU pertanyaan', 'cancel'];

        // Normalize kategori and status to match database enums
        let normalizedKategori = row.kategori?.trim();
        if (normalizedKategori) {
          // Handle case variations
          if (normalizedKategori.toLowerCase() === 'sdm') {
            normalizedKategori = 'SDM';
          } else {
            normalizedKategori = normalizedKategori.toLowerCase();
          }
          
          if (!validKategori.includes(normalizedKategori)) {
            throw new Error(`Invalid kategori: ${row.kategori}`);
          }
        }

        let normalizedStatus = row.status?.trim();
        if (normalizedStatus) {
          // Handle case variations
          if (normalizedStatus.toLowerCase() === 'done') {
            normalizedStatus = 'done';
          } else if (normalizedStatus.toLowerCase() === 'fu pertanyaan') {
            normalizedStatus = 'FU pertanyaan';
          } else {
            normalizedStatus = normalizedStatus.toLowerCase();
          }
          
          if (!validStatus.includes(normalizedStatus)) {
            throw new Error(`Invalid status: ${row.status}`);
          }
        }

        // Find PIC ID
        let picId = null;
        const picName = row.pic?.trim() || row.pic_name?.trim();
        if (picName) {
          picId = picMap.get(picName.toLowerCase());
          if (!picId) {
            console.warn(`PIC not found: ${picName} (row ${rowNumber})`);
          }
        }

        // Parse timestamp
        let timestamp = null;
        if (row.timestamp) {
          timestamp = new Date(row.timestamp);
          if (isNaN(timestamp.getTime())) {
            timestamp = null;
          }
        }

        // Parse butuh_konsultasi_lanjut
        let butuhKonsultasiLanjut = null;
        if (row.butuh_konsultasi_lanjut !== undefined && row.butuh_konsultasi_lanjut !== null) {
          if (typeof row.butuh_konsultasi_lanjut === 'boolean') {
            butuhKonsultasiLanjut = row.butuh_konsultasi_lanjut;
          } else if (typeof row.butuh_konsultasi_lanjut === 'string') {
            const lowerValue = row.butuh_konsultasi_lanjut.toLowerCase().trim();
            butuhKonsultasiLanjut = ['ya', 'yes', 'true', '1'].includes(lowerValue);
          }
        }

        // Insert konsultasi
        const konsultasiData = {
          nama_lengkap: row.nama_lengkap?.trim() || null,
          nomor_telepon: row.nomor_telepon?.trim() || null,
          instansi_organisasi: row.instansi_organisasi?.trim() || null,
          asal_kota_kabupaten: row.asal_kota_kabupaten?.trim() || null,
          asal_provinsi: row.asal_provinsi?.trim() || null,
          uraian_kebutuhan_konsultasi: row.uraian_kebutuhan_konsultasi?.trim() || null,
          skor_indeks_spbe: row.skor_indeks_spbe ? Number(row.skor_indeks_spbe) : null,
          kondisi_implementasi_spbe: row.kondisi_implementasi_spbe?.trim() || null,
          fokus_tujuan: row.fokus_tujuan?.trim() || null,
          mekanisme_konsultasi: row.mekanisme_konsultasi?.trim() || null,
          surat_permohonan: row.surat_permohonan?.trim() || null,
          butuh_konsultasi_lanjut: butuhKonsultasiLanjut,
          kategori: normalizedKategori || 'tata kelola',
          status: normalizedStatus || 'new',
          pic_id: picId,
          solusi: row.solusi?.trim() || null,
          ticket: row.ticket?.trim() || null,
          timestamp,
        };

        const { data: insertedKonsultasi, error: insertError } = await supabase
          .from('konsultasi_spbe')
          .insert(konsultasiData)
          .select('id')
          .single();

        if (insertError) {
          throw new Error(`Failed to insert konsultasi: ${insertError.message}`);
        }

        const konsultasiId = insertedKonsultasi.id;

        // Insert units if provided
        const unitNamesString = row.unit?.trim() || row.unit_names?.trim();
        if (unitNamesString) {
          const unitNames = unitNamesString.split(',').map(name => name.trim());
          const unitInserts = [];

          for (const unitName of unitNames) {
            const lowerUnitName = unitName.toLowerCase();
            let unitId = unitAliasMap.get(lowerUnitName) || unitMap.get(lowerUnitName);
            
            if (unitId) {
              unitInserts.push({
                konsultasi_id: konsultasiId,
                unit_id: unitId
              });
            } else {
              console.warn(`Unit not found: ${unitName} (row ${rowNumber})`);
            }
          }

          if (unitInserts.length > 0) {
            const { error: unitError } = await supabase
              .from('konsultasi_unit')
              .insert(unitInserts);

            if (unitError) {
              console.warn(`Failed to insert units for row ${rowNumber}:`, unitError);
            }
          }
        }

        // Insert topics if provided
        const topikNamesString = row.topik_konsultasi?.trim() || row.topik_names?.trim();
        if (topikNamesString) {
          const topikNames = topikNamesString.split(',').map(name => name.trim());
          const topikInserts = [];

          for (const topikName of topikNames) {
            const lowerTopikName = topikName.toLowerCase();
            let topikId = topikAliasMap.get(lowerTopikName) || topikMap.get(lowerTopikName);
            
            if (topikId) {
              topikInserts.push({
                konsultasi_id: konsultasiId,
                topik_id: topikId
              });
            } else {
              console.warn(`Topik not found: ${topikName} (row ${rowNumber})`);
            }
          }

          if (topikInserts.length > 0) {
            const { error: topikError } = await supabase
              .from('konsultasi_topik')
              .insert(topikInserts);

            if (topikError) {
              console.warn(`Failed to insert topics for row ${rowNumber}:`, topikError);
            }
          }
        }

        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          row: rowNumber,
          error: error instanceof Error ? error.message : 'Unknown error',
          data: row
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import completed. ${result.success} records imported successfully, ${result.failed} failed.`,
      result
    });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { 
        error: 'Import failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}