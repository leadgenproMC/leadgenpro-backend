import { InputHTMLAttributes, forwardRef } from "react"
import { clsx } from "clsx"

type Props = InputHTMLAttributes<HTMLInputElement> & {
	label?: string
}

const Input = forwardRef<HTMLInputElement, Props>(function Input(
	{ className, label, id, ...props },
	ref
) {
	return (
		<div>
			{label && (
				<label htmlFor={id} className="mb-1 block text-sm font-medium">
					{label}
				</label>
			)}
			<input
				ref={ref}
				id={id}
				{...props}
				className={clsx(
					"w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
					className
				)}
			/>
		</div>
	)
})

export default Input
