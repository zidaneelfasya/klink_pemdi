import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type ProfileContentProps = {
  profile: {
    full_name: string;
    phone: string;
    nip: string;
    jabatan: string;
    satuan_kerja: string;
    instansi: string;
    bio: string;
    location: string;
    email: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

export default function ProfileContent({ profile, onChange }: ProfileContentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil Admin</CardTitle>
        <CardDescription>Update data profil Anda di bawah ini.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nama Lengkap</Label>
            <Input id="full_name" name="full_name" value={profile.full_name || ""} onChange={onChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" value={profile.email || ""} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">No. Telepon</Label>
            <Input id="phone" name="phone" value={profile.phone || ""} onChange={onChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nip">NIP</Label>
            <Input id="nip" name="nip" value={profile.nip || ""} onChange={onChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jabatan">Jabatan</Label>
            <Input id="jabatan" name="jabatan" value={profile.jabatan || ""} onChange={onChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="satuan_kerja">Satuan Kerja</Label>
            <Input id="satuan_kerja" name="satuan_kerja" value={profile.satuan_kerja || ""} onChange={onChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instansi">Instansi</Label>
            <Input id="instansi" name="instansi" value={profile.instansi || ""} onChange={onChange} />
          </div>
        </div>
      </CardContent>
    </Card>
  );


      {/* Account Settings */}
}
