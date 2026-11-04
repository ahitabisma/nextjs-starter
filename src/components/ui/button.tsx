import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-foreground text-background hover:opacity-90",
  outline: "border border-foreground/20 hover:bg-foreground/5",
} as const;

export type ButtonVariant = keyof typeof variants;

export type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
};

export function Button({ variant = "primary", className, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium transition disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
