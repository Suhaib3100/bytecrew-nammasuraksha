import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Smoothly scrolls to the element with the given ID
 * @param elementId - The ID of the element to scroll to (without the # prefix)
 */
export function smoothScrollTo(elementId: string) {
	// Remove the # if it's included
	const id = elementId.startsWith("#") ? elementId.substring(1) : elementId;

	const element = document.getElementById(id);
	if (!element) return;

	// For browsers that don't support smooth scrolling
	element.scrollIntoView({ behavior: "smooth", block: "start" });
}
