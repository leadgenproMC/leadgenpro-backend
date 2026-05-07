import { ButtonHTMLAttributes } from "react"
import { clsx } from "clsx"

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: "primary" | "secondary"
}

export default function Button({ className, variant = "primary", ...props }: Props) {
	return (
		<button
			{...props}
			className={clsx(
				"rounded-md px-4 py-2 text-sm font-medium",
				variant === "primary"
					? "bg-blue-600 text-white hover:bg-blue-700"
					: "bg-gray-100 text-gray-900 hover:bg-gray-200",
				props.disabled && "opacity-70",
				className
			)}
		/>
	)
}
