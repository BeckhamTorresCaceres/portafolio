import { getPortfolioData } from "@/lib/db/actions";
import { PortfolioClient } from "@/features/portfolio/components/PortfolioClient";

export const instant = false;

export default async function Home() {
  const portfolioData = await getPortfolioData();

  return <PortfolioClient initialData={portfolioData} />;
}
