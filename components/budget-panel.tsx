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
    <div className="surface p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Monthly budget</p>
          <p className="mt-2 font-display text-3xl font-semibold tracking-tight">
            {formatEUR(total)}
            <span className="ml-1 text-sm font-normal text-muted-foreground">/ month</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {HOUSEHOLD_LABELS[prefs.household]} · estimates in EUR
          </p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary">
          <Wallet className="h-4 w-4" />
        </span>
      </div>

      <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-muted">
        <span
          className="h-full bg-primary"
          style={{ width: `${rentShare}%` }}
          title={`Rent ${rentShare}%`}
        />
        <span
          className="h-full bg-[var(--accent)]"
          style={{ width: `${livingShare}%` }}
          title={`Living costs ${livingShare}%`}
        />
      </div>

      <dl className="mt-4 space-y-3">
        <div className="flex items-center justify-between gap-3 text-sm">
          <dt className="flex items-center gap-2 text-muted-foreground">
            <Home className="h-3.5 w-3.5" /> Rent (1-bed)
          </dt>
          <dd className="font-semibold tabular-nums">{formatEUR(rent)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3 text-sm">
          <dt className="flex items-center gap-2 text-muted-foreground">
            <Receipt className="h-3.5 w-3.5" /> Living costs
          </dt>
          <dd className="font-semibold tabular-nums">{formatEUR(living)}</dd>
        </div>
        <div className="hairline" />
        <div className="flex items-center justify-between gap-3 text-sm">
          <dt className="text-muted-foreground">
            {prefs.income ? "Your net income" : "Local net salary"}
          </dt>
          <dd className="font-semibold tabular-nums">{formatEUR(income)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3 text-sm">
          <dt className="text-muted-foreground">
            {leftover >= 0 ? "Left after costs" : "Shortfall"}
          </dt>
          <dd
            className={`inline-flex items-center gap-1 font-bold tabular-nums ${leftover >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"}`}
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

      <p className="mt-4 text-[0.7rem] leading-relaxed text-muted-foreground">
        Cost model, not a quote. Rent and living costs are modelled from public
        listings and national statistics. {prefs.income ? "" : "Salary is the city average, not your offer."}
      </p>
    </div>
  );
}
