import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MesaRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ mesa?: string }>;
}) {
  const resolvedParams = await searchParams;
  const mesaQuery = resolvedParams?.mesa ? `?mesa=${resolvedParams.mesa}` : "";
  redirect(`/app/menu${mesaQuery}`);
}
