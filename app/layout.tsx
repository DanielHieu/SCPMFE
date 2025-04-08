import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

export const metadata = {
  title: "SCPM Admin",
  description: "Smart Car Parking Management Admin",
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
