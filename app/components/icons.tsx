import type { SVGProps } from "react";

// One consistent line set (24-grid, 1.6 stroke, round joints) so no two
// glyphs feel like they came from different families.
type IconProps = SVGProps<SVGSVGElement>;

function Line({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

// Brand mark — a wheat sheaf. Solid so it reads at small sizes in the header.
export function Wheat({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M12 21V9" />
      <path d="M12 9c0-2 1-3.4 2.6-4.4C13.7 6 12.9 7.2 12 9Z" fill="currentColor" />
      <path d="M12 9c0-2-1-3.4-2.6-4.4C10.3 6 11.1 7.2 12 9Z" fill="currentColor" />
      <path d="M12 13.5c1.6-.7 2.6-2 2.9-3.9-1.6.6-2.6 2-2.9 3.9Z" fill="currentColor" />
      <path d="M12 13.5c-1.6-.7-2.6-2-2.9-3.9 1.6.6 2.6 2 2.9 3.9Z" fill="currentColor" />
      <path d="M12 18c1.6-.7 2.6-2 2.9-3.9-1.6.6-2.6 2-2.9 3.9Z" fill="currentColor" />
      <path d="M12 18c-1.6-.7-2.6-2-2.9-3.9 1.6.6 2.6 2 2.9 3.9Z" fill="currentColor" />
    </svg>
  );
}

export function Cart(props: IconProps) {
  return (
    <Line {...props}>
      <circle cx="9" cy="20" r="1.3" />
      <circle cx="18" cy="20" r="1.3" />
      <path d="M2.5 3.5h2l2.2 11a1.4 1.4 0 0 0 1.4 1.1h8.2a1.4 1.4 0 0 0 1.4-1.1l1.4-7H6" />
    </Line>
  );
}

export function Plus(props: IconProps) {
  return (
    <Line {...props}>
      <path d="M12 5v14M5 12h14" />
    </Line>
  );
}

export function Minus(props: IconProps) {
  return (
    <Line {...props}>
      <path d="M5 12h14" />
    </Line>
  );
}

export function Check(props: IconProps) {
  return (
    <Line {...props}>
      <path d="M4.5 12.5 9 17l10.5-10.5" />
    </Line>
  );
}

export function ArrowLeft(props: IconProps) {
  return (
    <Line {...props}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </Line>
  );
}

export function ArrowRight(props: IconProps) {
  return (
    <Line {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Line>
  );
}

export function User(props: IconProps) {
  return (
    <Line {...props}>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5 20c.8-3.6 3.5-5.4 7-5.4s6.2 1.8 7 5.4" />
    </Line>
  );
}

export function LogOut(props: IconProps) {
  return (
    <Line {...props}>
      <path d="M15 4h2.5A1.5 1.5 0 0 1 19 5.5v13a1.5 1.5 0 0 1-1.5 1.5H15" />
      <path d="M10 12h9M16 8.5 19.5 12 16 15.5" />
    </Line>
  );
}

export function Trash(props: IconProps) {
  return (
    <Line {...props}>
      <path d="M4 7h16M9.5 7V5.5A1.5 1.5 0 0 1 11 4h2a1.5 1.5 0 0 1 1.5 1.5V7" />
      <path d="M6.5 7l.8 12a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4l.8-12" />
    </Line>
  );
}

export function MapPin(props: IconProps) {
  return (
    <Line {...props}>
      <path d="M12 21c4-3.8 7-7 7-10.5A7 7 0 0 0 5 10.5C5 14 8 17.2 12 21Z" />
      <circle cx="12" cy="10.5" r="2.4" />
    </Line>
  );
}

export function Package(props: IconProps) {
  return (
    <Line {...props}>
      <path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z" />
      <path d="M4 7l8 4 8-4M12 11v10" />
    </Line>
  );
}

export function Inbox(props: IconProps) {
  return (
    <Line {...props}>
      <path d="M4 13l2.5-7.5A1.5 1.5 0 0 1 8 4.5h8a1.5 1.5 0 0 1 1.5 1L20 13v5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18v-5Z" />
      <path d="M4 13h4.5a1.5 1.5 0 0 1 1.5 1.5 1.5 1.5 0 0 0 1.5 1.5h1a1.5 1.5 0 0 0 1.5-1.5A1.5 1.5 0 0 1 15.5 13H20" />
    </Line>
  );
}

export function Receipt(props: IconProps) {
  return (
    <Line {...props}>
      <path d="M6 3.5h12v17l-2.2-1.4-2.2 1.4-2.2-1.4-2.2 1.4L6 20.5Z" />
      <path d="M9 8h6M9 12h6" />
    </Line>
  );
}

export function CheckCircle(props: IconProps) {
  return (
    <Line {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.2 11 15l5-6" />
    </Line>
  );
}

export function XCircle(props: IconProps) {
  return (
    <Line {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9l6 6M15 9l-6 6" />
    </Line>
  );
}

export function Clock(props: IconProps) {
  return (
    <Line {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 2" />
    </Line>
  );
}

export function Spark(props: IconProps) {
  return (
    <Line {...props}>
      <path d="M12 3c.4 3.7 1.8 5.1 5.5 5.5C13.8 8.9 12.4 10.3 12 14c-.4-3.7-1.8-5.1-5.5-5.5C10.2 8.1 11.6 6.7 12 3Z" />
      <path d="M18 14c.2 1.7.8 2.3 2.5 2.5-1.7.2-2.3.8-2.5 2.5-.2-1.7-.8-2.3-2.5-2.5 1.7-.2 2.3-.8 2.5-2.5Z" />
    </Line>
  );
}

export function ExternalLink(props: IconProps) {
  return (
    <Line {...props}>
      <path d="M14 5h5v5M19 5l-8 8" />
      <path d="M18 14v4.5A1.5 1.5 0 0 1 16.5 20h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10" />
    </Line>
  );
}

export function Copy(props: IconProps) {
  return (
    <Line {...props}>
      <rect x="8.5" y="8.5" width="11" height="11" rx="2" />
      <path d="M15.5 8.5V6A1.5 1.5 0 0 0 14 4.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5" />
    </Line>
  );
}

export function RotateLeft(props: IconProps) {
  return (
    <Line {...props}>
      <path d="M4.5 9.5h5v-5" />
      <path d="M5 14a7 7 0 1 0 1.6-7.2L4.5 9.5" />
    </Line>
  );
}

export function Globe(props: IconProps) {
  return (
    <Line {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.4 3.8 5.6 3.8 9S14.5 18.6 12 21c-2.5-2.4-3.8-5.6-3.8-9S9.5 5.4 12 3Z" />
    </Line>
  );
}

// In-button loading: GPU-friendly spin on a single arc.
export function Spinner({ className = "", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      className={`animate-spin ${className}`}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.4" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
