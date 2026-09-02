import { Suspense } from "react";
import { LoginClient } from "./LoginClient";
export const metadata = { title: "Sign in — Born Cinema" };
export default function LoginPage() { return <Suspense fallback={null}><LoginClient /></Suspense>; }
