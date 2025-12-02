import { type ButtonHTMLAttributes, type PropsWithChildren } from 'react';
import './Button.css';

type ButtonVariant = 'primary' | 'ghost' | 'muted';
type ButtonSize = 'default' | 'small';

type ButtonProps = PropsWithChildren<{
  variant?: ButtonVariant;
  size?: ButtonSize;
}> &
  ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  children,
  className = '',
  variant = 'muted',
  size = 'default',
  ...props
}: ButtonProps) {
  const classes = [
    'ui-btn',
    `ui-btn--${variant}`,
    size === 'small' ? 'ui-btn--small' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

export default Button;
