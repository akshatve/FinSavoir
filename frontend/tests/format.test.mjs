import { test } from "node:test";
import assert from "node:assert/strict";
import { formatNumber, formatCurrency, formatLargeCurrency, formatPercent } from "../lib/format.js";

test("formatLargeCurrency abbreviates company-sized amounts", () => {
  assert.equal(formatLargeCurrency(2_950_000_000_000), "$2.95T");
  assert.equal(formatLargeCurrency(412_300_000), "$412.30M");
  assert.equal(formatLargeCurrency(-1_500_000_000), "-$1.50B");
  assert.equal(formatLargeCurrency(950.5), "$950.50");
});

test("missing values render as N/A, never as a number", () => {
  for (const fn of [formatNumber, formatCurrency, formatLargeCurrency, formatPercent]) {
    assert.equal(fn(null), "N/A");
    assert.equal(fn(undefined), "N/A");
    assert.equal(fn(NaN), "N/A");
  }
});

test("formatNumber keeps the sign of negative amounts", () => {
  assert.equal(formatNumber(-2_000_000_000), "-2.00B");
  assert.equal(formatNumber(3_400_000), "3.40M");
});

test("formatCurrency and formatPercent", () => {
  assert.equal(formatCurrency(123.456), "$123.46");
  assert.equal(formatCurrency(-4), "-$4.00");
  assert.equal(formatPercent(0.0123), "1.23%");
});
