import logoUrl from "@/assets/symboltrans.png";

interface LogoProps {
  height?: number;
  className?: string;
}

export function Logo({ height = 36, className = "" }: LogoProps) {
  return (
    <img
      src={logoUrl}
      alt="Góc An Nhiên"
      style={{ height: `${height}px`, width: "auto" }}
      className={className}
    />
  );
}
