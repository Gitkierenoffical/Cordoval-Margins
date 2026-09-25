export type InputMode = "sellAndCost" | "costAndMargin";

export type FormState = {
  mode: InputMode;
  sellPrice: string;
  cost: string;
  targetMarginPercent: string;
};

export const defaultForm: FormState = {
  mode: "sellAndCost",
  sellPrice: "",
  cost: "",
  targetMarginPercent: "",
};

function parseMoney(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const normalised = trimmed.replace(/,/g, "");
  if (!/^-?\d*(\.\d+)?$/.test(normalised)) return null;
  const n = Number(normalised);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

function parsePercent(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const normalised = trimmed.replace(/,/g, "");
  if (!/^-?\d*(\.\d+)?$/.test(normalised)) return null;
  const n = Number(normalised);
  if (!Number.isFinite(n)) return null;
  return n;
}

export type MarginResult =
  | { ok: false; error: string }
  | {
      ok: true;
      sellPrice: number;
      cost: number;
      profit: number;
      marginPercent: number;
      markupPercent: number;
      mode: InputMode;
    };

function computeFromSellAndCost(sell: number, cost: number): MarginResult {
  const profit = sell - cost;
  const marginPercent = sell > 0 ? (profit / sell) * 100 : 0;
  const markupPercent = cost > 0 ? (profit / cost) * 100 : 0;

  return {
    ok: true,
    sellPrice: sell,
    cost,
    profit,
    marginPercent,
    markupPercent,
    mode: "sellAndCost",
  };
}

export function calculate(form: FormState): MarginResult {
  const cost = parseMoney(form.cost);
  if (cost === null) {
    return { ok: false, error: "Enter a valid cost." };
  }

  if (form.mode === "sellAndCost") {
    const sell = parseMoney(form.sellPrice);
    if (sell === null) {
      return { ok: false, error: "Enter a valid sell price." };
    }
    if (form.sellPrice.trim() === "" && form.cost.trim() === "") {
      return { ok: false, error: "Enter a sell price and cost to see results." };
    }
    if (form.sellPrice.trim() === "" || form.cost.trim() === "") {
      return { ok: false, error: "Enter both sell price and cost." };
    }
    return computeFromSellAndCost(sell, cost);
  }

  const targetMargin = parsePercent(form.targetMarginPercent);
  if (targetMargin === null) {
    return { ok: false, error: "Enter a valid target margin percent." };
  }
  if (form.cost.trim() === "" || form.targetMarginPercent.trim() === "") {
    return { ok: false, error: "Enter cost and target margin to see results." };
  }
  if (targetMargin <= 0) {
    return { ok: false, error: "Target margin must be greater than zero." };
  }
  if (targetMargin >= 100) {
    return {
      ok: false,
      error: "Target margin must be below 100% — at 100% there is no finite sell price.",
    };
  }

  const sell = cost / (1 - targetMargin / 100);
  return computeFromSellAndCost(sell, cost);
}

const gbpFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat("en-GB", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
});

export function formatGbp(amount: number): string {
  return gbpFormatter.format(amount);
}

export function formatPercent(value: number): string {
  return `${percentFormatter.format(value)}%`;
}

export function buildCopySummary(
  result: Extract<MarginResult, { ok: true }>,
): string {
  const lines = [
    `Sell price: ${formatGbp(result.sellPrice)}`,
    `Cost: ${formatGbp(result.cost)}`,
    `Profit: ${formatGbp(result.profit)}`,
    `Margin: ${formatPercent(result.marginPercent)}`,
    `Markup: ${formatPercent(result.markupPercent)}`,
  ];
  return lines.join("\n");
}
