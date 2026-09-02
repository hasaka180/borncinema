import { Suspense } from "react";
import { SignupClient } from "./SignupClient";
export const metadata = { title: "Become a creator — Born Cinema" };
export default function SignupPage() { return <Suspense fallback={null}><SignupClient /></Suspense>; }
