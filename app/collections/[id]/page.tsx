import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CollectionDetailPage from "./collection-detail";

export default async function CollectionDetail() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  return <CollectionDetailPage />;
}
