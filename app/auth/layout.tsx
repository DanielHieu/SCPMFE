import { Suspense } from "react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden relative">
            {/* Background decoration */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-100 blur-3xl opacity-30"></div>
                <div className="absolute top-1/4 -right-24 w-96 h-96 rounded-full bg-indigo-100 blur-3xl opacity-30"></div>
                <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-blue-50 blur-3xl opacity-30"></div>
            </div>
            
            {/* Content */}
            <div className="relative z-10">
                <Suspense fallback={
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="animate-spin w-10 h-10 border-4 border-blue-600 rounded-full border-t-transparent"></div>
                    </div>
                }>
                    {children}
                </Suspense>
            </div>
        </div>
    );
}