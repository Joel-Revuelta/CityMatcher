import { ArrowDownRight, ArrowUpRight, Home, Receipt, Wallet } from "lucide-react";
import type { City, Preferences } from "@/lib/types";
import { householdTotal } from "@/lib/scoring";
import { formatEUR } from "@/lib/format";
import { HOUSEHOLD_LABELS } from "@/lib/criteria";

export function BudgetPanel({
  city,
  prefs,
}: {
  city: City;
  prefs: Preferences;
}) {
  const multiplierRent =
    prefs.household === "couple" ? 1.3 : prefs.household === "family" ? 1.9 : 1;
  const multiplierLiving =
    prefs.household === "couple" ? 1.7 : prefs.household === "family" ? 2.5 : 1;
  const rent = Math.round(city.cost.rentOneBed * multiplierRent);
  const living = Math.round(city.cost.livingSingle * multiplierLiving);
  const total = householdTotal(city, prefs.household);
  const income =
    prefs.income ??
    Math.round(
      city.work.avgNetSalary *
        (prefs.household === "couple" ? 1.6 : prefs.household === "family" ? 1.9 : 1),
    );
  const leftover = income - total;
  const rentShare = Math.round((rent / total) * 100);
  const livingShare = Math.max(0, 100 - rentShare);

  return (
    <div className="border border-border">
      <div className="border-b border-border p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="label">Estimated monthly budget</p>
            <p className="mt-2 font-mono text-3xl font-medium tracking-tight">
              {formatEUR(total)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {HOUSEHOLD_LABELS[prefs.household]}, EUR per month
            </p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center border border-border text-primary">
            <Wallet className="h-4 w-4" />
          </span>
        </div>

        <div className="mt-5 flex h-1.5 overflow-hidden bg-muted">
          <span className="h-full bg-primary" style={{ width: `${rentShare}%` }} />
          <span className="h-full bg-muted-foreground" style={{ width: `${livingShare}%` }} />
        </div>
        <div className="mt-2 flex justify-between font-mono text-xs text-muted-foreground">
          <span>Rent {rentShare}%</span>
          <span>Living {livingShare}%</span>
        </div>
      </div>

      <dl className="px-5">
        <div className="flex items-center justify-between gap-3 border-b border-border/70 py-3 text-sm">
          <dt className="flex items-center gap-2 text-muted-foreground">
            <Home className="h-3.5 w-3.5" /> Rent, 1-bed
          </dt>
          <dd className="font-mono text-sm tabular-nums">{formatEUR(rent)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3 border-b border-border/70 py-3 text-sm">
          <dt className="flex items-center gap-2 text-muted-foreground">
            <Receipt className="h-3.5 w-3.5" /> Living costs
          </dt>
          <dd className="font-mono text-sm tabular-nums">{formatEUR(living)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3 border-b border-border/70 py-3 text-sm">
          <dt className="text-muted-foreground">
            {prefs.income ? "Your net income" : "Local net salary"}
          </dt>
          <dd className="font-mono text-sm tabular-nums">{formatEUR(income)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3 py-3 text-sm">
          <dt className="text-muted-foreground">
            {leftover >= 0 ? "Left after costs" : "Monthly shortfall"}
          </dt>
          <dd
            className={`inline-flex items-center gap-1 font-mono text-sm font-medium tabular-nums ${
              leftover >= 0 ? "text-success" : "text-danger"
            }`}
          >
            {leftover >= 0 ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {formatEUR(Math.abs(leftover))}
          </dd>
        </div>
      </dl>

      <p className="border-t border-border px-5 py-4 text-xs leading-relaxed text-muted-foreground">
        A planning model, not a quote. Rent and living costs use curated public
        estimates.{" "}
        {prefs.income ? "" : "The salary line is the city average, not your offer."}
      </p>
    </div>
  );
}
