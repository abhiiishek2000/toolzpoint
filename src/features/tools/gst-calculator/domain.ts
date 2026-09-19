import { z } from "zod";
import { numeric } from "../shared";
export const gstSchema = z.object({
  amount: numeric.min(0).max(1e10),
  rate: numeric.min(0).max(100),
  mode: z.enum(["exclusive", "inclusive"]),
});
export function gst(
  amount: number,
  rate: number,
  mode: "exclusive" | "inclusive",
) {
  gstSchema.parse({ amount, rate, mode });
  if (mode === "exclusive") {
    const gstAmount = (amount * rate) / 100;
    return {
      "Base price": amount,
      "GST amount": gstAmount,
      "CGST + SGST (each)": gstAmount / 2,
      "Total price": amount + gstAmount,
    };
  }
  const basePrice = amount / (1 + rate / 100);
  const gstAmount = amount - basePrice;
  return {
    "Base price": basePrice,
    "GST amount": gstAmount,
    "CGST + SGST (each)": gstAmount / 2,
    "Total price": amount,
  };
}
