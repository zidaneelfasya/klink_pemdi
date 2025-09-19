import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan atau belum login' },
        { status: 401 }
      );
    }

    // Get user's assigned units to check if superadmin
    const { data: userUnits } = await supabase
      .from('user_unit_penanggungjawab')
      .select('unit_id')
      .eq('user_id', user.id);

    const isSuperAdmin = userUnits?.some(unit => unit.unit_id === 1) || false;

    // Base query for statistics - adjust based on user access
    let filteredData;
    
    if (!isSuperAdmin && userUnits && userUnits.length > 0) {
      // Filter by user's units if not superadmin
      const userUnitIds = userUnits.map(unit => unit.unit_id);
      
      // Get konsultasi IDs that belong to user's units
      const { data: userKonsultasiIds } = await supabase
        .from('konsultasi_unit')
        .select('konsultasi_id')
        .in('unit_id', userUnitIds);
      
      const konsultasiIds = userKonsultasiIds?.map(item => item.konsultasi_id) || [];
      
      if (konsultasiIds.length === 0) {
        // User has no consultations
        filteredData = [];
      } else {
        // Get konsultasi data for user's units
        const { data } = await supabase
          .from('konsultasi_spbe')
          .select('*')
          .in('id', konsultasiIds);
        filteredData = data || [];
      }
    } else {
      // Get all data for superadmin
      const { data } = await supabase
        .from('konsultasi_spbe')
        .select('*');
      filteredData = data || [];
    }

    // 1. Total konsultasi
    const totalCount = filteredData.length;

    // 2. Statistics by status
    const statusStats = filteredData.reduce((acc: Record<string, number>, item: any) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});

    // 3. Statistics by kategori
    const kategoriStats = filteredData.reduce((acc: Record<string, number>, item: any) => {
      acc[item.kategori] = (acc[item.kategori] || 0) + 1;
      return acc;
    }, {});

    // 4. Monthly trend (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyData = filteredData.filter((item: any) => 
      new Date(item.created_at) >= twelveMonthsAgo
    );
      
    const monthlyStats = monthlyData.reduce((acc: Record<string, number>, item: any) => {
      const month = new Date(item.created_at).toISOString().slice(0, 7); // YYYY-MM format
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    // 4.5. Statistics by topik (get from join table)
    let topikStats = {};
    if (isSuperAdmin) {
      // Get all topik data for superadmin
      const { data: topikData } = await supabase
        .from('konsultasi_topik')
        .select(`
          topik_id,
          topik_konsultasi(nama_topik)
        `);

      topikStats = topikData?.reduce((acc: Record<string, number>, item: any) => {
        const topikName = item.topik_konsultasi?.nama_topik || 'Unknown';
        acc[topikName] = (acc[topikName] || 0) + 1;
        return acc;
      }, {}) || {};
    } else {
      // Get topik data filtered by user's consultations
      const konsultasiIds = filteredData.map((item: any) => item.id);
      if (konsultasiIds.length > 0) {
        const { data: topikData } = await supabase
          .from('konsultasi_topik')
          .select(`
            topik_id,
            topik_konsultasi(nama_topik)
          `)
          .in('konsultasi_id', konsultasiIds);

        topikStats = topikData?.reduce((acc: Record<string, number>, item: any) => {
          const topikName = item.topik_konsultasi?.nama_topik || 'Unknown';
          acc[topikName] = (acc[topikName] || 0) + 1;
          return acc;
        }, {}) || {};
      }
    }

    // Generate complete months array for the last 12 months
    const monthlyTrend = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7);
      const monthName = date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long' });
      
      monthlyTrend.push({
        month: monthKey,
        monthName,
        count: monthlyStats[monthKey] || 0
      });
    }

    // 5. Top units (for superadmin) or user units performance
    let unitStats = [];
    if (isSuperAdmin) {
      const { data: unitData } = await supabase
        .from('konsultasi_unit')
        .select(`
          unit_id,
          unit_penanggungjawab(nama_unit),
          konsultasi_spbe(id)
        `);

      const unitCounts = unitData?.reduce((acc: Record<number, any>, item: any) => {
        const unitId = item.unit_id;
        if (!acc[unitId]) {
          acc[unitId] = {
            unit_id: unitId,
            unit_name: item.unit_penanggungjawab?.nama_unit || 'Unknown',
            count: 0
          };
        }
        acc[unitId].count += 1;
        return acc;
      }, {}) || {};

      unitStats = Object.values(unitCounts)
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 5); // Top 5 units
    } else {
      // For regular users, show their unit's performance
      const userUnitIds = userUnits?.map(unit => unit.unit_id) || [];
      const { data: userUnitData } = await supabase
        .from('unit_penanggungjawab')
        .select('id, nama_unit')
        .in('id', userUnitIds);

      for (const unit of userUnitData || []) {
        const { count } = await supabase
          .from('konsultasi_unit')
          .select('*', { count: 'exact', head: true })
          .eq('unit_id', unit.id);

        unitStats.push({
          unit_id: unit.id,
          unit_name: unit.nama_unit,
          count: count || 0
        });
      }
    }

    // 6. Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentData = filteredData.filter((item: any) => 
      new Date(item.created_at) >= thirtyDaysAgo
    );
    const recentCount = recentData.length;

    // 7. Status distribution for charts
    const statusDistribution = Object.entries(statusStats).map(([status, count]) => ({
      name: status,
      value: count,
      color: getStatusColor(status)
    }));

    const kategoriDistribution = Object.entries(kategoriStats).map(([kategori, count]) => ({
      name: kategori,
      value: count,
      color: getKategoriColor(kategori)
    }));

    // Convert topik stats to chart format
    const topikDistribution = Object.entries(topikStats)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 10) // Top 10 topics
      .map(([topik, count]) => ({
        name: topik.length > 30 ? topik.substring(0, 30) + '...' : topik, // Truncate long names
        fullName: topik,
        value: count,
        color: getTopikColor(topik)
      }));

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          total: totalCount || 0,
          recentActivity: recentCount || 0,
          accessLevel: isSuperAdmin ? 'superadmin' : 'unit-restricted'
        },
        statusStats,
        kategoriStats,
        topikStats,
        monthlyTrend,
        unitStats,
        charts: {
          statusDistribution,
          kategoriDistribution,
          topikDistribution
        }
      }
    });

  } catch (error) {
    console.error("Error fetching summary data:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Helper functions for colors
function getStatusColor(status: string): string {
  switch (status) {
    case 'new': return '#ef4444'; // red
    case 'on process': return '#f59e0b'; // amber
    case 'ready to send': return '#3b82f6'; // blue
    case 'konsultasi zoom': return '#8b5cf6'; // violet
    case 'done': return '#10b981'; // emerald
    case 'FU pertanyaan': return '#f97316'; // orange
    case 'cancel': return '#6b7280'; // gray
    default: return '#6b7280';
  }
}

function getKategoriColor(kategori: string): string {
  switch (kategori) {
    case 'tata kelola': return '#6366f1'; // indigo
    case 'infrastruktur': return '#06b6d4'; // cyan
    case 'aplikasi': return '#10b981'; // emerald
    case 'keamanan informasi': return '#ef4444'; // red
    case 'SDM': return '#ec4899'; // pink
    default: return '#6b7280';
  }
}

function getTopikColor(topik: string): string {
  // Generate consistent colors for topics based on hash
  const colors = [
    '#8b5cf6', // violet
    '#f59e0b', // amber
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#f97316', // orange
    '#3b82f6', // blue
    '#ec4899', // pink
    '#10b981', // emerald
    '#6366f1', // indigo
    '#ef4444'  // red
  ];
  
  // Simple hash function to get consistent color for each topic
  let hash = 0;
  for (let i = 0; i < topik.length; i++) {
    const char = topik.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return colors[Math.abs(hash) % colors.length];
}
