import { DataTableAdminKonsultasi } from "@/components/data-table-admin-konsultasi";
import { DataProvider } from "../context/data-context";
import { UserProvider } from "../context/user-context";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function AdminPageLoading() {
	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<Skeleton className="h-8 w-[300px]" />
				<Skeleton className="h-4 w-[400px]" />
			</div>
			<div className="space-y-3">
				<div className="flex gap-2">
					<Skeleton className="h-10 w-[200px]" />
					<Skeleton className="h-10 w-[150px]" />
					<Skeleton className="h-10 w-[120px]" />
				</div>
				<Skeleton className="h-[400px] w-full" />
			</div>
		</div>
	);
}

export default function AdminPage() {
	return (
		<div className="">
			<UserProvider>
				<DataProvider>
					<Suspense fallback={<AdminPageLoading />}>
						<DataTableAdminKonsultasi data={[]} />
					</Suspense>
				</DataProvider>
			</UserProvider>
		</div>
	);
}
