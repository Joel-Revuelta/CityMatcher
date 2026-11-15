import {
  Briefcase,
  Circle,
  Footprints,
  HeartPulse,
  Landmark,
  Languages,
  Leaf,
  ShieldCheck,
  Smile,
  Sun,
  Wallet,
  Wifi,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  Wallet,
  ShieldCheck,
  HeartPulse,
  Sun,
  Briefcase,
  Footprints,
  Wifi,
  Leaf,
  Smile,
  Landmark,
  Languages,
};

export function CriterionIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = icons[name] ?? Circle;
  return <Icon className={className} aria-hidden="true" />;
}

export { icons as criterionIcons };
