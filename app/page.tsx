import { redirect } from "next/navigation";
import { getLatestDate } from "@/lib/data";

export default function Home() {
  redirect(`/day/${getLatestDate()}`);
}
