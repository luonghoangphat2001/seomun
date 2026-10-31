import type { UnitPriceSectionKey } from '../../api';
import { UnitPriceSectionSelect } from '../UnitPriceSectionSelect';

type PostProcessingPriceSearchFiltersProps = {
  section: UnitPriceSectionKey;
  onSectionChange: (section: UnitPriceSectionKey) => void;
};

export function PostProcessingPriceSearchFilters({ section, onSectionChange }: PostProcessingPriceSearchFiltersProps) {
  return <UnitPriceSectionSelect value={section} onChange={onSectionChange} />;
}
