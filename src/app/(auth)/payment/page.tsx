"use client";

import { createCheckoutSession } from "@/actions/actions";
import H1 from "@/components/h1";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Page({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
	const { success, canceled } = searchParams;
	const [isPending, startTransition] = useTransition();
	const { data: session, update, status } = useSession();
	const router = useRouter();

	return (
		<main className="flex flex-col items-center space-y-10">
			<H1>PetSoft access requires payment</H1>

			{success && (
				<Button
					onClick={async () => {
						await update(true);
						router.push("/app/dashboard");
					}}
					disabled={status === "loading" || session?.user.hasAccess}>
					Access PetSoft
				</Button>
			)}

			{!success && (
				<Button
					disabled={isPending}
					onClick={async () => {
						startTransition(async () => {
							await createCheckoutSession();
						});
					}}>
					Buy lifetime access for $299
				</Button>
			)}
			{success && <p className="text-sm text-green-700">Payment successful! You now have lifetime access to PetSoft.</p>}
			{canceled && <p className="text-sm text-red-700">Payment canceled. You can try again.</p>}
		</main>
	);
}
