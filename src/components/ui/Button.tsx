import type { ButtonHTMLAttributes } from 'react';
type Variant = 'primary' | 'secondary' | 'ghost';
const VARIANT: Record<Variant, string> = {
  primary: 'text-background font-bold',
  secondary: 'border border-border-strong bg-surface-raised text-foreground-secondary',
  ghost: 'text-foreground-subtle hover:text-foreground-secondary',
};
export default function Button(
  { variant = 'secondary', className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant },
) {
  return <button className={['rounded-xl px-5 py-3 text-body02 transition', VARIANT[variant], className].join(' ')} {...rest} />;
}
