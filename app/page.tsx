import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import SearchApp from "@/components/SearchApp";

export default async function HomePage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  return <SearchApp user={user} />;
}
