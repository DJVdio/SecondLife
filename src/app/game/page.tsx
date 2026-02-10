import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { GameController } from "@/components/game/game-controller";

export default async function GamePage() {
  const session = await getSession();

  if (!session.accessToken) {
    redirect("/api/auth/login");
  }

  return <GameController />;
}
