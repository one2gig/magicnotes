import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lavender",
  {
    variants: {
      variant: {
        primary: "bg-lavender-deep text-cream shadow-lg hover:bg-[#68558d]",
        ghost: "bg-white/25 text-ink hover:bg-white/40",
        dark: "bg-white/10 text-cream hover:bg-white/20",
      },
      size: {
        md: "h-11 px-5 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
