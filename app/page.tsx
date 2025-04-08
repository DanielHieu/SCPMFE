import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/authOptions";

const Home = async () => {
  const session = await getServerSession(authOptions);

  // Redirect to dashboard if authenticated, otherwise to login
  if (session) {
    redirect("/dashboard");
  } else {
    redirect("/auth/login");
  }
}

export default Home;
