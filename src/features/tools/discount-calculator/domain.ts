import { numeric } from "../shared";
export function discount(price: number, percentOff: number) {
  numeric.min(0).max(1e9).parse(price);
  numeric.min(0).max(100).parse(percentOff);
  const saved = (price * percentOff) / 100;
  return {
    "Sale price": price - saved,
    "You save": saved,
  };
}
