import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

export const metadata = {
  title: "SCPM Management",
  description: "Smart Car Parking Management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
