import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CollectionsPage from "./collections-page";

export default async function Collections() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  return <CollectionsPage />;
}
