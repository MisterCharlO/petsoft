"use client";

import { PlusIcon } from "@radix-ui/react-icons";
import { Button } from "./ui/button";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import PetForm from "./pet-form";
import { flushSync } from "react-dom";

type PetButtonProps = {
	actiontype: "add" | "edit" | "checkout";
	disabled?: boolean;
	onClick?: () => void;
	children?: React.ReactNode;
};

export default function PetButton({ actiontype, disabled, onClick, children }: PetButtonProps) {
	const [isFormOpen, setIsFormOpen] = useState(false);

	if (actiontype === "checkout") {
		return (
			<Button variant="destructive" disabled={disabled} onClick={onClick}>
				{children}
			</Button>
		);
	}

	return (
		<Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
			<DialogTrigger asChild>
				{actiontype === "add" ? (
					<Button size="icon">
						<PlusIcon />
					</Button>
				) : (
					<Button variant="secondary">{children}</Button>
				)}
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{actiontype === "add" ? "Add a new pet" : "Edit pet"}</DialogTitle>
				</DialogHeader>
				<PetForm
					actionType={actiontype}
					onFormSubmission={() => {
						flushSync(() => {
							setIsFormOpen(false);
						});
					}}
				/>
			</DialogContent>
		</Dialog>
	);
}
