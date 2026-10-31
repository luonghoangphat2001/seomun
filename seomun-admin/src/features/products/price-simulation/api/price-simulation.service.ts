import { simulateProductPriceAPI } from './price-simulation.api';
import type { PriceSimulationREQ } from './price-simulation.request';
import type { PriceSimulationCategory, PriceSimulationDataRESP, PriceSimulationResultRESP } from './price-simulation.response';

export function simulateProductPrice(request: PriceSimulationREQ): Promise<PriceSimulationResultRESP> {
  return simulateProductPriceAPI(request);
}

export interface PriceSimulationRow {
  key: string;
  groupCode: string;
  category: PriceSimulationCategory;
  raw_cost: number;
  selling_price: number;
}

export function buildPriceSimulationRows(data: PriceSimulationDataRESP): PriceSimulationRow[] {
  const rows: PriceSimulationRow[] = [];

  const rawKnownTotal =
    data.raw_cost.paper_price +
    data.raw_cost.printing_price +
    data.raw_cost.foundation_fee +
    data.raw_cost.post_processing_price +
    data.raw_cost.component_price;
  const sellingKnownTotal =
    data.selling_price.paper_price +
    data.selling_price.printing_price +
    data.selling_price.foundation_fee +
    data.selling_price.post_processing_price +
    data.selling_price.component_price;
  const rawBaseAmount = data.raw_cost.sub_total - rawKnownTotal;
  const sellingBaseAmount = data.selling_price.sub_total - sellingKnownTotal;

  if (rawBaseAmount || sellingBaseAmount) {
    rows.push({ key: 'base', groupCode: 'base', category: 'other', raw_cost: rawBaseAmount, selling_price: sellingBaseAmount });
  }

  rows.push(
    { key: 'paper', groupCode: 'paper', category: 'paper', raw_cost: data.raw_cost.paper_price, selling_price: data.selling_price.paper_price },
    {
      key: 'printing',
      groupCode: 'printing',
      category: 'printing',
      raw_cost: data.raw_cost.printing_price,
      selling_price: data.selling_price.printing_price,
    },
  );

  if (data.raw_cost.foundation_fee || data.selling_price.foundation_fee) {
    rows.push({
      key: 'foundation',
      groupCode: 'foundation',
      category: 'other',
      raw_cost: data.raw_cost.foundation_fee,
      selling_price: data.selling_price.foundation_fee,
    });
  }

  if (data.raw_cost.component_price || data.selling_price.component_price) {
    rows.push({
      key: 'component',
      groupCode: 'component',
      category: 'other',
      raw_cost: data.raw_cost.component_price,
      selling_price: data.selling_price.component_price,
    });
  }

  const rawBreakdownByCode = new Map(data.raw_cost.breakdown.map((item) => [item.group_code, item.price]));

  for (const item of data.selling_price.breakdown) {
    rows.push({
      key: `post-processing-${item.group_code}`,
      groupCode: item.group_code,
      category: 'post_processing',
      raw_cost: rawBreakdownByCode.get(item.group_code) ?? 0,
      selling_price: item.price,
    });
  }

  return rows;
}
