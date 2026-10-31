import type { UnitPriceSectionKey } from '../../api';
import { UnitPriceSectionSelect } from '../UnitPriceSectionSelect';

type PrintingPriceSearchFiltersProps = {
  section: UnitPriceSectionKey;
  onSectionChange: (section: UnitPriceSectionKey) => void;
};

export function PrintingPriceSearchFilters({ section, onSectionChange }: PrintingPriceSearchFiltersProps) {
  return <UnitPriceSectionSelect value={section} onChange={onSectionChange} />;
}
