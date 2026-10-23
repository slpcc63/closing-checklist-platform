import type { Metadata } from "next";
import ClosingApp from "./closing-app";

export const metadata: Metadata = {
  title: "Spike’s Coffee & Tea — Tuesday close",
  description: "Spike’s mobile closing checklist and manager closeout view.",
};

export default function Home() {
  return <ClosingApp />;
}
