import { Suspense } from "react";
import { DevelopClient } from "./DevelopClient";
export const metadata = { title: "Turn this story into cinema — Born Cinema" };
export default function DevelopPage() { return <Suspense fallback={null}><DevelopClient /></Suspense>; }
