import { AppLayout } from "@/components/app-layout";
import LoanApplicationForm from "./loan-application-form";

export default function ApplyPage() {
    return (
        <AppLayout>
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight font-headline">Loan Application</h2>
                </div>
                <div className="max-w-4xl mx-auto">
                    <LoanApplicationForm />
                </div>
            </div>
        </AppLayout>
    );
}
