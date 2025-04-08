import React from "react";
import { Toaster } from "sonner";
import AuthorizedLayoutContent from "@/components/layout/AuthorizedLayoutContent";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/authOptions";

export default async function AuthorizedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side session check to prevent unnecessary client-side redirects
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AuthorizedLayoutContent>{children}</AuthorizedLayoutContent>
      <Toaster richColors position="top-right" />
    </div>
  );
}
