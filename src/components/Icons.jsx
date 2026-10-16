// Icon paths from Tabler Icons (MIT, https://tabler.io/icons), inlined so the
// app doesn't ship an icon library.

function Icon({ size = 24, stroke = 2, filled = false, children, ...rest }) {
  const paint = filled
    ? { fill: 'currentColor' }
    : { fill: 'none', stroke: 'currentColor', strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round' };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...paint} {...rest}>
      {children}
    </svg>
  );
}

export function SearchIcon(props) {
  return (
    <Icon {...props}>
      <path d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
      <path d="M21 21l-6 -6" />
    </Icon>
  );
}

export function CloseIcon(props) {
  return (
    <Icon {...props}>
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </Icon>
  );
}

export function HeartIcon({ filled = false, ...props }) {
  return filled ? (
    <Icon filled {...props}>
      <path d="M6.979 3.074a6 6 0 0 1 4.988 1.425l.037 .033l.034 -.03a6 6 0 0 1 4.733 -1.44l.246 .036a6 6 0 0 1 3.364 10.008l-.18 .185l-.048 .041l-7.45 7.379a1 1 0 0 1 -1.313 .082l-.094 -.082l-7.493 -7.422a6 6 0 0 1 3.176 -10.215z" />
    </Icon>
  ) : (
    <Icon {...props}>
      <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
    </Icon>
  );
}

export function SunIcon(props) {
  return (
    <Icon {...props}>
      <path d="M8 12a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
      <path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7" />
    </Icon>
  );
}

export function MoonIcon(props) {
  return (
    <Icon {...props}>
      <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454l0 .008" />
    </Icon>
  );
}

export function SparklesIcon(props) {
  return (
    <Icon {...props}>
      <path d="M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2m0 -12a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2m-7 12a6 6 0 0 1 6 -6a6 6 0 0 1 -6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 6 6" />
    </Icon>
  );
}

export function ChevronRightIcon(props) {
  return (
    <Icon {...props}>
      <path d="M9 6l6 6l-6 6" />
    </Icon>
  );
}

// The checkmark shown on a selected filter chip.
export function CheckIcon(props) {
  return (
    <svg width="12" height="9" viewBox="0 0 10 7" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 4.586L1.707 2.293A1 1 0 1 0 .293 3.707l3 3a.997.997 0 0 0 1.414 0l5-5A1 1 0 1 0 8.293.293L4 4.586z"
      />
    </svg>
  );
}
