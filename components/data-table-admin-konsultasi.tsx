"use client"

import React from "react"
import { z } from "zod"
import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { toast } from "sonner"
import {
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ColumnsIcon,
  GripVerticalIcon,
  LoaderIcon,
  MoreVerticalIcon,
  PlusIcon,
  ClockIcon,
  BuildingIcon,
  UserIcon,
  TagIcon,
  FileTextIcon,
  Building2Icon,
  XIcon,
  CheckIcon,
} from "lucide-react"

export const konsultasiSchema = z.object({
  id: z.number(),
  nama_lengkap: z.string().nullable(),
  instansi_organisasi: z.string().nullable(),
  asal_kota_kabupaten: z.string().nullable(),
  asal_provinsi: z.string().nullable(),
  status: z.enum(['new', 'on process', 'ready to send', 'konsultasi zoom', 'done', 'FU pertanyaan', 'cancel']),
  kategori: z.enum(['tata kelola', 'infrastruktur', 'aplikasi', 'keamanan informasi', 'SDM']),
  pic_name: z.string().nullable(),
  skor_indeks_spbe: z.number().nullable(),
  uraian_kebutuhan_konsultasi: z.string().nullable(),
  solusi: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  units: z.array(z.object({
    unit_id: z.number(),
    unit_name: z.string().nullable(),
    unit_pic_name: z.string().nullable(),
  })).optional(),
  topics: z.array(z.object({
    topik_id: z.number(),
    topik_name: z.string().nullable(),
  })).optional(),
})

type KonsultasiData = z.infer<typeof konsultasiSchema>

// Interface for PIC data
interface PICData {
  id: number;
  nama_pic: string;
}

// PIC Selector Component
function PICSelector({ 
  konsultasiId, 
  currentPicName, 
  onUpdate 
}: { 
  konsultasiId: number;
  currentPicName: string | null;
  onUpdate: (newPicName: string | null) => void;
}) {
  const [picList, setPicList] = React.useState<PICData[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [updating, setUpdating] = React.useState(false);

  // Fetch PIC list when component mounts
  React.useEffect(() => {
    const fetchPicList = async () => {
      try {
        const response = await fetch('/api/v1/konsultasi/pic');
        if (!response.ok) throw new Error('Failed to fetch PIC list');
        
        const result = await response.json();
        if (result.success && result.data) {
          setPicList(result.data);
        }
      } catch (error) {
        console.error('Error fetching PIC list:', error);
        toast.error('Gagal memuat daftar PIC');
      }
    };

    fetchPicList();
  }, []);

  const handlePicChange = async (selectedPicId: string) => {
    // Handle "null" case for unassigning PIC
    if (selectedPicId === "null") {
      setUpdating(true);
      const loadingToast = toast.loading("Menghapus PIC assignment...");

      try {
        const response = await fetch('/api/v1/konsultasi', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: konsultasiId,
            pic_id: null,
          }),
        });

        if (!response.ok) throw new Error('Failed to remove PIC');
        
        const result = await response.json();
        if (result.success) {
          onUpdate(null);
          
          toast.dismiss(loadingToast);
          toast.success("PIC assignment berhasil dihapus!", {
            description: `Konsultasi #${konsultasiId} sekarang belum memiliki PIC`,
            duration: 4000,
          });
        } else {
          throw new Error(result.message || 'Update failed');
        }
      } catch (error) {
        console.error('Error removing PIC:', error);
        
        toast.dismiss(loadingToast);
        toast.error('Gagal menghapus PIC assignment', {
          description: error instanceof Error ? error.message : 'Terjadi kesalahan saat menghapus PIC',
          duration: 4000,
        });
      } finally {
        setUpdating(false);
      }
      return;
    }

    // Handle selecting a specific PIC
    const selectedPic = picList.find(pic => pic.id.toString() === selectedPicId);
    if (!selectedPic) return;

    setUpdating(true);

    // Show loading toast
    const loadingToast = toast.loading(`Mengupdate PIC ke ${selectedPic.nama_pic}...`);

    try {
      const response = await fetch('/api/v1/konsultasi', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: konsultasiId,
          pic_id: selectedPic.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to update PIC');
      
      const result = await response.json();
      if (result.success) {
        onUpdate(selectedPic.nama_pic);
        
        // Dismiss loading toast and show success
        toast.dismiss(loadingToast);
        toast.success(`PIC berhasil diupdate ke ${selectedPic.nama_pic}!`, {
          description: `Konsultasi #${konsultasiId} sekarang ditangani oleh ${selectedPic.nama_pic}`,
          duration: 4000,
        });
      } else {
        throw new Error(result.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating PIC:', error);
      
      // Dismiss loading toast and show error
      toast.dismiss(loadingToast);
      toast.error('Gagal mengupdate PIC', {
        description: error instanceof Error ? error.message : 'Terjadi kesalahan saat mengupdate PIC',
        duration: 4000,
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Select onValueChange={handlePicChange} disabled={updating}>
      <SelectTrigger className="h-8 w-full border-transparent bg-transparent hover:bg-muted/30 focus:border focus:bg-background">
        <div className="flex items-center gap-1">
          <UserIcon className="size-3 text-muted-foreground" />
          <span className="text-sm">
            {currentPicName || "Pilih PIC"}
          </span>
        </div>
      </SelectTrigger>
      <SelectContent>
        {picList.length === 0 ? (
          <div className="p-2 text-sm text-muted-foreground">
            Memuat daftar PIC...
          </div>
        ) : (
          <>
            <SelectItem value="null">Belum ditentukan</SelectItem>
            {picList.map((pic) => (
              <SelectItem key={pic.id} value={pic.id.toString()}>
                <div className="flex items-center gap-2">
                  <UserIcon className="size-4" />
                  {pic.nama_pic}
                </div>
              </SelectItem>
            ))}
          </>
        )}
      </SelectContent>
    </Select>
  );
}

// Status Selector Component
function StatusSelector({ 
  konsultasiId, 
  currentStatus, 
  onUpdate 
}: { 
  konsultasiId: number;
  currentStatus: string;
  onUpdate: (newStatus: string) => void;
}) {
  const [updating, setUpdating] = React.useState(false);

  const statusOptions = [
    { value: 'new', label: 'New', icon: <ClockIcon className="size-3" /> },
    { value: 'on process', label: 'On Process', icon: <LoaderIcon className="size-3 animate-spin" /> },
    { value: 'ready to send', label: 'Ready to Send', icon: <ClockIcon className="size-3" /> },
    { value: 'konsultasi zoom', label: 'Konsultasi Zoom', icon: <ClockIcon className="size-3" /> },
    { value: 'done', label: 'Done', icon: <CheckCircle2Icon className="size-3" /> },
    { value: 'FU pertanyaan', label: 'FU Pertanyaan', icon: <ClockIcon className="size-3" /> },
    { value: 'cancel', label: 'Cancel', icon: <ClockIcon className="size-3" /> }
  ];

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;

    setUpdating(true);
    const loadingToast = toast.loading(`Mengupdate status ke ${newStatus}...`);

    try {
      const response = await fetch('/api/v1/konsultasi', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: konsultasiId,
          status: newStatus,
        }),
      });

      if (!response.ok) throw new Error('Failed to update status');
      
      const result = await response.json();
      if (result.success) {
        onUpdate(newStatus);
        
        toast.dismiss(loadingToast);
        toast.success(`Status berhasil diupdate ke ${newStatus}!`, {
          description: `Konsultasi #${konsultasiId} sekarang berstatus ${newStatus}`,
          duration: 4000,
        });
      } else {
        throw new Error(result.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      
      toast.dismiss(loadingToast);
      toast.error('Gagal mengupdate status', {
        description: error instanceof Error ? error.message : 'Terjadi kesalahan saat mengupdate status',
        duration: 4000,
      });
    } finally {
      setUpdating(false);
    }
  };

  const currentStatusOption = statusOptions.find(option => option.value === currentStatus);

  return (
    <Select onValueChange={handleStatusChange} disabled={updating} value={currentStatus}>
      <SelectTrigger className="h-8 w-full border-transparent bg-transparent hover:bg-muted/30 focus:border focus:bg-background">
        <Badge
          variant="outline"
          className={`flex gap-1 px-2 py-1 text-xs capitalize ${getStatusColor(currentStatus)}`}
        >
          {currentStatusOption?.icon}
          {currentStatus}
        </Badge>
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center gap-2">
              {option.icon}
              <span className="capitalize">{option.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Category Selector Component
function CategorySelector({ 
  konsultasiId, 
  currentCategory, 
  onUpdate 
}: { 
  konsultasiId: number;
  currentCategory: string;
  onUpdate: (newCategory: string) => void;
}) {
  const [updating, setUpdating] = React.useState(false);

  const categoryOptions = [
    { value: 'tata kelola', label: 'Tata Kelola' },
    { value: 'infrastruktur', label: 'Infrastruktur' },
    { value: 'aplikasi', label: 'Aplikasi' },
    { value: 'keamanan informasi', label: 'Keamanan Informasi' },
    { value: 'SDM', label: 'SDM' }
  ];

  const handleCategoryChange = async (newCategory: string) => {
    if (newCategory === currentCategory) return;

    setUpdating(true);
    const loadingToast = toast.loading(`Mengupdate kategori ke ${newCategory}...`);

    try {
      const response = await fetch('/api/v1/konsultasi', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: konsultasiId,
          kategori: newCategory,
        }),
      });

      if (!response.ok) throw new Error('Failed to update category');
      
      const result = await response.json();
      if (result.success) {
        onUpdate(newCategory);
        
        toast.dismiss(loadingToast);
        toast.success(`Kategori berhasil diupdate ke ${newCategory}!`, {
          description: `Konsultasi #${konsultasiId} sekarang berkategori ${newCategory}`,
          duration: 4000,
        });
      } else {
        throw new Error(result.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      
      toast.dismiss(loadingToast);
      toast.error('Gagal mengupdate kategori', {
        description: error instanceof Error ? error.message : 'Terjadi kesalahan saat mengupdate kategori',
        duration: 4000,
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Select onValueChange={handleCategoryChange} disabled={updating} value={currentCategory}>
      <SelectTrigger className="h-8 w-full border-transparent bg-transparent hover:bg-muted/30 focus:border focus:bg-background">
        <Badge
          variant="outline"
          className={`px-2 py-1 text-xs capitalize ${getCategoryColor(currentCategory)}`}
        >
          <TagIcon className="size-3 mr-1" />
          {currentCategory}
        </Badge>
      </SelectTrigger>
      <SelectContent>
        {categoryOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center gap-2">
              <TagIcon className="size-4" />
              <span className="capitalize">{option.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id,
  })

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:bg-transparent"
    >
      {/* <GripVerticalIcon className="size-3 text-muted-foreground" /> */}
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

// Solusi Editor Component
function SolusiEditor({ 
  konsultasiId, 
  currentSolusi, 
  onUpdate 
}: { 
  konsultasiId: number;
  currentSolusi: string | null;
  onUpdate: (newSolusi: string | null) => void;
}) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(currentSolusi || '');
  const [updating, setUpdating] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);

  const solusiText = currentSolusi;
  const shouldTruncate = solusiText && solusiText.length > 100;

  const handleSave = async () => {
    if (editValue === currentSolusi) {
      setIsEditing(false);
      return;
    }

    setUpdating(true);
    const loadingToast = toast.loading("Menyimpan solusi...");

    try {
      const response = await fetch('/api/v1/konsultasi', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: konsultasiId,
          solusi: editValue || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to update solusi');
      
      const result = await response.json();
      if (result.success) {
        onUpdate(editValue || null);
        setIsEditing(false);
        
        toast.dismiss(loadingToast);
        toast.success("Solusi berhasil disimpan!", {
          description: `Konsultasi #${konsultasiId} telah diperbarui`,
          duration: 4000,
        });
      } else {
        throw new Error(result.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating solusi:', error);
      
      toast.dismiss(loadingToast);
      toast.error('Gagal menyimpan solusi', {
        description: error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan solusi',
        duration: 4000,
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditValue(currentSolusi || '');
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setIsExpanded(true);
  };

  if (isEditing) {
    return (
      <div className="max-w-sm w-full space-y-2">
        <Textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          placeholder="Masukkan solusi konsultasi..."
          className="min-h-[120px] text-sm resize-none"
          disabled={updating}
        />
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={updating}
            className="h-7 px-3"
          >
            {updating ? (
              <LoaderIcon className="size-3 animate-spin" />
            ) : (
              <CheckIcon className="size-3" />
            )}
            Simpan
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={updating}
            className="h-7 px-3"
          >
            <XIcon className="size-3" />
            Batal
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-sm w-full">
      {solusiText ? (
        <div className="flex flex-col items-start gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            onDoubleClick={handleEdit}
            className="text-left hover:bg-muted/30 rounded px-2 py-1 transition-colors w-full group"
            title="Klik dua kali untuk edit"
          >
            <div 
              className={`text-sm text-muted-foreground leading-relaxed transition-all duration-200 ${
                isExpanded 
                  ? 'whitespace-pre-wrap break-words' 
                  : 'line-clamp-3'
              }`}
            >
              {solusiText}
            </div>

          </button>
          {isExpanded && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleEdit}
              className="h-7 px-2 mt-1 flex-shrink-0"
            >
              <FileTextIcon className="size-3" />
              Edit
            </Button>
          )}
        </div>
      ) : (
        <button
          onClick={handleEdit}
          className="text-muted-foreground text-sm flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <FileTextIcon className="size-3" />
          Belum ada solusi - Klik untuk tambah
        </button>
      )}
    </div>
  );
}

// Status color mapping
const getStatusColor = (status: string) => {
  switch (status) {
    case 'done':
      return 'text-green-600 bg-green-50 border-green-200'
    case 'on process':
      return 'text-blue-600 bg-blue-50 border-blue-200'
    case 'new':
      return 'text-gray-600 bg-gray-50 border-gray-200'
    case 'konsultasi zoom':
      return 'text-purple-600 bg-purple-50 border-purple-200'
    case 'ready to send':
      return 'text-orange-600 bg-orange-50 border-orange-200'
    case 'cancel':
      return 'text-red-600 bg-red-50 border-red-200'
    case 'FU pertanyaan':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

// Category color mapping
const getCategoryColor = (category: string) => {
  switch (category) {
    case 'tata kelola':
      return 'text-indigo-600 bg-indigo-50 border-indigo-200'
    case 'infrastruktur':
      return 'text-cyan-600 bg-cyan-50 border-cyan-200'
    case 'aplikasi':
      return 'text-emerald-600 bg-emerald-50 border-emerald-200'
    case 'keamanan informasi':
      return 'text-red-600 bg-red-50 border-red-200'
    case 'SDM':
      return 'text-pink-600 bg-pink-50 border-pink-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

const columns: ColumnDef<KonsultasiData>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="">
        {/* <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        /> */}
      </div>
    ),
    cell: ({ row }) => (
      <div className="">
        {/* <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        /> */}
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "nama_lengkap",
    header: "Nama & Instansi",
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} />
    },
    enableHiding: false,
  },
  {
    accessorKey: "kategori",
    header: "Kategori",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={`px-2 py-1 text-xs capitalize ${getCategoryColor(row.original.kategori)}`}
      >
        <TagIcon className="size-3 mr-1" />
        {row.original.kategori}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={`flex gap-1 px-2 py-1 text-xs capitalize ${getStatusColor(row.original.status)}`}
      >
        {row.original.status === "done" ? (
          <CheckCircle2Icon className="size-3" />
        ) : row.original.status === "on process" ? (
          <LoaderIcon className="size-3 animate-spin" />
        ) : (
          <ClockIcon className="size-3" />
        )}
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "skor_indeks_spbe",
    header: () => <div className="text-center">Skor SPBE</div>,
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.skor_indeks_spbe ? (
          <Badge variant="secondary" className="px-2 py-1">
            {row.original.skor_indeks_spbe}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "solusi",
    header: "Solusi",
    cell: ({ row }) => {
      const [isExpanded, setIsExpanded] = React.useState(false);
      const solusiText = row.original.solusi;
      const shouldTruncate = solusiText && solusiText.length > 100;

      return (
        <div className="max-w-sm w-full">
          {solusiText ? (
            <div className="flex flex-col items-start gap-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-left hover:bg-muted/30 rounded px-2 py-1 transition-colors w-full group"
              >
                <div 
                  className={`text-sm text-muted-foreground leading-relaxed transition-all duration-200 ${
                    isExpanded 
                      ? 'whitespace-pre-wrap break-words' 
                      : 'line-clamp-3'
                  }`}
                >
                  {solusiText}
                </div>
                {shouldTruncate && (
                  <div className="text-xs text-blue-600 group-hover:text-blue-800 mt-2 font-medium">
                    {isExpanded ? '↑ Sembunyikan' : '↓ Lihat selengkapnya'}
                  </div>
                )}
              </button>
            </div>
          ) : (
            <span className="text-muted-foreground text-sm flex items-center gap-1">
              <FileTextIcon className="size-3" />
              Belum ada solusi
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "units",
    header: "Unit",
    cell: ({ row }) => (
      <div className="max-w-sm">
        {row.original.units && row.original.units.length > 0 ? (
          <div className="space-y-1">
            {row.original.units.slice(0, 2).map((unit, index) => (
              <Badge
                key={unit.unit_id}
                variant="outline"
                className="text-xs px-2 py-1 block w-fit"
              >
                {/* <Building2Icon className="size-3 mr-1" /> */}
                {unit.unit_name}
              </Badge>
            ))}
            {row.original.units.length > 2 && (
              <span className="text-xs text-muted-foreground">
                +{row.original.units.length - 2} unit lainnya
              </span>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm flex items-center gap-1">
            {/* <Building2Icon className="size-3" /> */}
            Belum ada unit
          </span>
        )}
      </div>
    ),
  },
  // PIC column will be defined inside the component where setData is available
]

// Create columns function that accepts setData
const createColumns = (setData: React.Dispatch<React.SetStateAction<KonsultasiData[]>>): ColumnDef<KonsultasiData>[] => [
  ...columns.slice(0, 3), // drag, select, nama_lengkap
  {
    accessorKey: "kategori",
    header: "Kategori",
    cell: ({ row }) => (
      <CategorySelector 
        konsultasiId={row.original.id}
        currentCategory={row.original.kategori}
        onUpdate={(newCategory) => {
          // Update local data state
          setData(prevData => 
            prevData.map(item => 
              item.id === row.original.id 
                ? { ...item, kategori: newCategory as KonsultasiData['kategori'] }
                : item
            )
          )
        }}
      />
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusSelector 
        konsultasiId={row.original.id}
        currentStatus={row.original.status}
        onUpdate={(newStatus) => {
          // Update local data state
          setData(prevData => 
            prevData.map(item => 
              item.id === row.original.id 
                ? { ...item, status: newStatus as KonsultasiData['status'] }
                : item
            )
          )
        }}
      />
    ),
  },
  ...columns.slice(5, 6), // skor_indeks_spbe
  {
    accessorKey: "solusi",
    header: "Solusi",
    cell: ({ row }) => (
      <SolusiEditor 
        konsultasiId={row.original.id}
        currentSolusi={row.original.solusi}
        onUpdate={(newSolusi) => {
          // Update local data state
          setData(prevData => 
            prevData.map(item => 
              item.id === row.original.id 
                ? { ...item, solusi: newSolusi }
                : item
            )
          )
        }}
      />
    ),
  },
  ...columns.slice(7), // units
  {
    accessorKey: "pic_name",
    header: "PIC",
    cell: ({ row }) => (
      <PICSelector 
        konsultasiId={row.original.id}
        currentPicName={row.original.pic_name}
        onUpdate={(newPicName) => {
          // Update local data state
          setData(prevData => 
            prevData.map(item => 
              item.id === row.original.id 
                ? { ...item, pic_name: newPicName }
                : item
            )
          )
        }}
      />
    ),
  },
  {
    accessorKey: "created_at",
    header: "Tanggal",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {new Date(row.original.created_at).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
            size="icon"
          >
            <MoreVerticalIcon />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>View Details</DropdownMenuItem>
          <DropdownMenuItem>Assign PIC</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

function DraggableRow({ row }: { row: Row<KonsultasiData> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })

  return (
    <TableRow
      // data-state={row.getIsSelected() && "selected"}
      // data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80 align-top"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id} className="align-top">
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

export function DataTableAdminKonsultasi({
  data: initialData,
}: {
  data: KonsultasiData[]
}) {
  const [data, setData] = React.useState(() => initialData)
  const [loading, setLoading] = React.useState(false)
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  )

  // Fetch data from API
  const fetchKonsultasiData = React.useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/v1/konsultasi/all')
      if (!response.ok) throw new Error('Failed to fetch data')
      
      const result = await response.json()
      if (result.success && result.data) {
        setData(result.data)
      } else {
        throw new Error(result.message || 'Failed to fetch data')
      }
    } catch (error) {
      console.error('Error fetching konsultasi data:', error)
      toast.error('Gagal memuat data konsultasi')
    } finally {
      setLoading(false)
    }
  }, [])

  // Load data on mount
  React.useEffect(() => {
    if (!initialData?.length) {
      fetchKonsultasiData()
    }
  }, [initialData, fetchKonsultasiData])

  // Create columns with setData function
  const columnsWithData = React.useMemo(() => createColumns(setData), [setData])

  const table = useReactTable({
    data,
    columns: columnsWithData,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  return (
    <Tabs
      defaultValue="konsultasi"
      className="flex w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Data Konsultasi SPBE</h2>
          <Badge variant="secondary" className="text-sm">
            {data.length} konsultasi
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ColumnsIcon />
                <span className="hidden lg:inline">Kolom</span>
                <ChevronDownIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" onClick={fetchKonsultasiData} disabled={loading}>
            {loading ? <LoaderIcon className="animate-spin" /> : <PlusIcon />}
            <span className="hidden lg:inline">
              {loading ? 'Loading...' : 'Refresh Data'}
            </span>
          </Button>
        </div>
      </div>

      <TabsContent
        value="konsultasi"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columnsWithData.length}
                      className="h-24 text-center"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <LoaderIcon className="animate-spin" />
                        Memuat data konsultasi...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columnsWithData.length}
                      className="h-24 text-center"
                    >
                      Tidak ada data konsultasi.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} dari{" "}
            {table.getFilteredRowModel().rows.length} baris dipilih.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Baris per halaman
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Halaman {table.getState().pagination.pageIndex + 1} dari{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRightIcon />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRightIcon />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}

function TableCellViewer({ item }: { item: KonsultasiData }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="link" className="w-fit px-0 text-left text-foreground h-auto">
          <div className="flex flex-col items-start text-left">
            <span className="font-medium text-sm">
              {item.nama_lengkap || "Nama tidak tersedia"}
            </span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <BuildingIcon className="size-3" />
              <span>{item.instansi_organisasi || "Instansi tidak tersedia"}</span>
            </div>
            {item.asal_kota_kabupaten && (
              <span className="text-xs text-muted-foreground">
                {item.asal_kota_kabupaten}, {item.asal_provinsi}
              </span>
            )}
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col w-full sm:max-w-lg">
        <SheetHeader className="gap-1">
          <SheetTitle>Detail Konsultasi</SheetTitle>
          <SheetDescription>
            Informasi lengkap konsultasi SPBE
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto py-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">Informasi Dasar</h4>
            <div className="grid gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">ID</Label>
                <div className="font-mono text-sm">
                  #{item.id.toString().padStart(4, '0')}
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Nama Lengkap</Label>
                <div className="text-sm">{item.nama_lengkap || "-"}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Instansi/Organisasi</Label>
                <div className="text-sm">{item.instansi_organisasi || "-"}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Asal Daerah</Label>
                <div className="text-sm">
                  {item.asal_kota_kabupaten && item.asal_provinsi 
                    ? `${item.asal_kota_kabupaten}, ${item.asal_provinsi}`
                    : "-"}
                </div>
              </div>
            </div>
          </div>

          {/* Status & Category */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">Status & Kategori</h4>
            <div className="grid gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Status</Label>
                <div className="mt-1">
                  <Badge
                    variant="outline"
                    className={`capitalize ${getStatusColor(item.status)}`}
                  >
                    {item.status}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Kategori</Label>
                <div className="mt-1">
                  <Badge
                    variant="outline"
                    className={`capitalize ${getCategoryColor(item.kategori)}`}
                  >
                    {item.kategori}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">PIC</Label>
                <div className="text-sm">{item.pic_name || "Belum ditentukan"}</div>
              </div>
              {item.skor_indeks_spbe && (
                <div>
                  <Label className="text-xs text-muted-foreground">Skor Indeks SPBE</Label>
                  <div className="text-sm font-medium">{item.skor_indeks_spbe}</div>
                </div>
              )}
            </div>
          </div>

          {/* Consultation Details */}
          {item.uraian_kebutuhan_konsultasi && (
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Uraian Kebutuhan</h4>
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                {item.uraian_kebutuhan_konsultasi}
              </div>
            </div>
          )}

          {/* Units */}
          {item.units && item.units.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Unit Penanggung Jawab</h4>
              <div className="space-y-2">
                {item.units.map((unit, index) => (
                  <div key={index} className="text-sm bg-muted/50 p-2 rounded">
                    <div className="font-medium">{unit.unit_name}</div>
                    {unit.unit_pic_name && (
                      <div className="text-xs text-muted-foreground">
                        PIC: {unit.unit_pic_name}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Topics */}
          {item.topics && item.topics.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Topik Konsultasi</h4>
              <div className="flex flex-wrap gap-2">
                {item.topics.map((topic, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {topic.topik_name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">Riwayat</h4>
            <div className="grid gap-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Dibuat:</span>
                <span>
                  {new Date(item.created_at).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Diperbarui:</span>
                <span>
                  {new Date(item.updated_at).toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <SheetFooter className="mt-auto flex gap-2 sm:flex-col sm:space-x-0">
          <Button className="w-full">Edit Konsultasi</Button>
          <SheetClose asChild>
            <Button variant="outline" className="w-full">
              Tutup
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
