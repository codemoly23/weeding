import { redirect } from "next/navigation";

export default async function VenueRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/vendors/${slug}`);
}
