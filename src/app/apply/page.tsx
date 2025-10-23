
import { AppLayout } from "@/components/app-layout";
import LoanApplicationForm from "./loan-application-form";

export default function ApplyPage() {
    return (
        <AppLayout>
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl font-headline">Loan Application</h1>
            </div>
            <div
                className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm"
                x-chunk="dashboard-02-chunk-1"
            >
                <div className="flex flex-col items-center gap-1 text-center p-4 w-full">
                     <div className="w-full max-w-4xl mx-auto">
                        <LoanApplicationForm />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
