import { CATEGORIES, type Category, type SortOrder } from '../types'

interface FiltersProps {
  activeCategory: Category | 'all'
  activeSort: SortOrder
  onCategoryChange: (category: Category | 'all') => void
  onSortChange: (sort: SortOrder) => void
}

export default function Filters({
  activeCategory,
  activeSort,
  onCategoryChange,
  onSortChange,
}: FiltersProps) {
  return (
    <div className="filters">
      <div className="filters-left">
        {CATEGORIES.map((category) => (
          <button
            key={category.value}
            type="button"
            className={`pill${activeCategory === category.value ? ' active' : ''}`}
            onClick={() => onCategoryChange(category.value)}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="filter-sort">
        <button
          type="button"
          className={activeSort === 'votes' ? 'active' : ''}
          onClick={() => onSortChange('votes')}
        >
          top
        </button>
        <span>·</span>
        <button
          type="button"
          className={activeSort === 'new' ? 'active' : ''}
          onClick={() => onSortChange('new')}
        >
          new
        </button>
      </div>
    </div>
  )
}
