import { DataTableAdminKonsultasi } from "@/components/data-table-admin-konsultasi";
import { DataProvider } from "../context/data-context";

export default function AdminPage() {
	return (
		<div className="">
			<DataProvider>
				<DataTableAdminKonsultasi data={[]} />;
			</DataProvider>
		</div>
	);
}
