export function GmailLogo({ size = 22, className, decorative = false }: { size?: number; className?: string; decorative?: boolean }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 48 48" role={decorative ? "presentation" : "img"} aria-hidden={decorative || undefined} aria-label={decorative ? undefined : "Gmail"}>
      <path fill="#4caf50" d="M45 16.2 40 19l-5 4.7V40h7a3 3 0 0 0 3-3V16.2z" />
      <path fill="#1e88e5" d="M3 16.2 6.6 17.9 13 23.7V40H6a3 3 0 0 1-3-3V16.2z" />
      <path fill="#e53935" d="m35 11.2-11 8.25L13 11.2 12 17l1 6.7 11 8.25L35 23.7 36 17z" />
      <path fill="#c62828" d="M3 12.3V16.2l10 7.5V11.2L9.9 8.9A4.1 4.1 0 0 0 7.3 8C4.9 8 3 9.9 3 12.3z" />
      <path fill="#fbc02d" d="M45 12.3V16.2l-10 7.5V11.2l3.1-2.3A4.1 4.1 0 0 1 40.7 8C43.1 8 45 9.9 45 12.3z" />
    </svg>
  );
}
