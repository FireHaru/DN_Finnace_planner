import { TransactionsPage } from "@/components/TransactionsPage";

export default async function TransactionsRoute({
  searchParams,
}: {
  searchParams: Promise<{ add?: string | string[] }>;
}) {
  const params = await searchParams;
  return <TransactionsPage initialAdd={params.add === "1"} />;
}
