import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium transition-transform duration-150 ease-studio active:scale-press disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        primary: "bg-fg text-paper hover:opacity-90",
        ghost: "glass-control text-fg",
        bronze: "bg-accent text-accent-fg hover:opacity-90",
      },
    },
    defaultVariants: { variant: "primary" },
  },
);

export function Button({
  className,
  variant,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant }), className)} {...props} />;
}
