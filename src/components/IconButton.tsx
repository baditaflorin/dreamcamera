import type { ButtonHTMLAttributes, ReactNode } from "react";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  active?: boolean;
  children: ReactNode;
};

export function IconButton({
  label,
  active = false,
  children,
  className = "",
  ...props
}: IconButtonProps) {
  return (
    <button
      {...props}
      aria-label={label}
      title={label}
      data-active={active}
      className={`grid size-11 place-items-center rounded-md border border-paper/14 bg-ink/68 text-paper shadow-soft backdrop-blur transition hover:border-gold/70 hover:text-gold disabled:cursor-not-allowed disabled:opacity-45 data-[active=true]:border-teal data-[active=true]:bg-teal/18 ${className}`}
    >
      {children}
    </button>
  );
}
