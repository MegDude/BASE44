import assert from "node:assert/strict";
import { calculateDiscount } from "../src/lib/redemptions/discountCalculator.js";

assert.deepEqual(calculateDiscount({ discountType: "percentage", discountValue: 20, originalAmount: 43.27 }), {
  originalAmount: 43.27, discountAmount: 8.65, finalAmount: 34.62,
});
assert.deepEqual(calculateDiscount({ discountType: "fixed_amount", discountValue: 25, originalAmount: 12 }), {
  originalAmount: 12, discountAmount: 12, finalAmount: 0,
});
assert.deepEqual(calculateDiscount({ discountType: "complimentary_item", originalAmount: null }), { originalAmount: null });
assert.throws(() => calculateDiscount({ discountType: "percentage", discountValue: 10, originalAmount: -1 }), /valid original amount/);

console.log("Redemption discount calculations: PASS");
