import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SortColumn, SortState } from './types'

const COLUMN_HEADER_CLASS =
  'relative z-10 grid shrink-0 grid-cols-[minmax(0,2.5fr)_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,0.75fr)] gap-3 border-b border-[#e5e5e5] bg-[#fafafa] px-3 py-1.5 text-[11px] text-[#666] dark:border-[#3a3a3a] dark:bg-[#2d2d2d] dark:text-[#aaa]'

type SortableHeaderProps = {
  label: string
  column: SortColumn
  sortState: SortState
  onSortChange: (column: SortColumn) => void
}

function SortableHeader({
  label,
  column,
  sortState,
  onSortChange,
}: SortableHeaderProps) {
  const isActive = sortState.column === column

  return (
    <button
      type='button'
      data-sort-header
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation()
        onSortChange(column)
      }}
      className={cn(
        'flex cursor-pointer items-center gap-1 rounded-sm text-start transition-colors hover:text-[#1a1a1a] dark:hover:text-[#e0e0e0]',
        isActive && 'font-medium text-[#1a1a1a] dark:text-[#e0e0e0]'
      )}
      aria-label={`Sort by ${label}`}
      aria-sort={
        isActive
          ? sortState.direction === 'asc'
            ? 'ascending'
            : 'descending'
          : 'none'
      }
    >
      <span>{label}</span>
      {isActive &&
        (sortState.direction === 'asc' ? (
          <ChevronUp className='size-3' aria-hidden='true' />
        ) : (
          <ChevronDown className='size-3' aria-hidden='true' />
        ))}
    </button>
  )
}

type ExplorerColumnHeadersProps = {
  sortState: SortState
  onSortChange: (column: SortColumn) => void
}

export function ExplorerColumnHeaders({
  sortState,
  onSortChange,
}: ExplorerColumnHeadersProps) {
  return (
    <div className={COLUMN_HEADER_CLASS} data-sort-header>
      <SortableHeader
        label='Name'
        column='name'
        sortState={sortState}
        onSortChange={onSortChange}
      />
      <SortableHeader
        label='Date modified'
        column='dateModified'
        sortState={sortState}
        onSortChange={onSortChange}
      />
      <span>Type</span>
      <SortableHeader
        label='Size'
        column='size'
        sortState={sortState}
        onSortChange={onSortChange}
      />
    </div>
  )
}
