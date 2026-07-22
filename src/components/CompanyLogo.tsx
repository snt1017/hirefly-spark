export function CompanyLogo({
  name,
  logoUrl,
  color,
  size = 40,
}: {
  name: string;
  logoUrl?: string;
  color?: string;
  size?: number;
}) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className="rounded-lg object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
  return (
    <div
      className="flex items-center justify-center rounded-lg font-semibold text-white"
      style={{ width: size, height: size, backgroundColor: color ?? "#04474b", fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  );
}