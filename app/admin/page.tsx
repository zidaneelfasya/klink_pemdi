
import data from "./data.json";
import { DataTableAdmin } from "@/components/data-table-admin";

export default function AdminPage() {
	return <DataTableAdmin data={data} />;
}
