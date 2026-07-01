import { useEffect, useRef, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { formatAddressPath } from './utils'
import type { BreadcrumbSegment } from './types'

type BreadcrumbProps = {
  segments: BreadcrumbSegment[]
  onNavigate: (path: string[]) => void
}

export function Breadcrumb({ segments, onNavigate }: BreadcrumbProps) {
  const [showPathText, setShowPathText] = useState(false)
  const pathInputRef = useRef<HTMLInputElement>(null)
  const pathString = formatAddressPath(segments)

  useEffect(() => {
    setShowPathText(false)
  }, [pathString])

  useEffect(() => {
    if (!showPathText) return
    const input = pathInputRef.current
    if (!input) return
    input.focus()
    input.select()
  }, [showPathText])

  const barClass =
    'flex min-w-0 flex-1 items-center overflow-hidden rounded-md border bg-background shadow-xs'

  if (showPathText) {
    return (
      <nav aria-label='Address bar' className={barClass}>
        <input
          ref={pathInputRef}
          readOnly
          value={pathString}
          aria-label='Folder path'
          onBlur={() => setShowPathText(false)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setShowPathText(false)
            }
          }}
          className='h-7 w-full min-w-0 truncate bg-transparent px-2 text-xs outline-none select-all'
        />
      </nav>
    )
  }

  return (
    <nav
      aria-label='Address bar'
      className={cn(barClass, 'cursor-text')}
      onClick={() => setShowPathText(true)}
    >
      <ol className='flex min-w-0 items-center gap-0 overflow-x-auto px-1 py-0.5 text-sm'>
        {segments.map((segment, index) => {
          const path = segments
            .slice(1, index + 1)
            .map((item) => item.id)
            .filter(Boolean)
          const isLast = index === segments.length - 1

          return (
            <li key={`${segment.id}-${index}`} className='flex shrink-0 items-center'>
              {index > 0 && (
                <ChevronRight
                  className='mx-0.5 size-3 shrink-0 text-muted-foreground'
                  aria-hidden='true'
                />
              )}
              <Button
                type='button'
                variant='ghost'
                size='sm'
                disabled={isLast}
                onClick={(event) => {
                  event.stopPropagation()
                  if (!isLast) onNavigate(path)
                }}
                className={cn(
                  'h-6 max-w-36 truncate rounded-sm px-2 text-xs font-normal',
                  isLast && 'text-foreground'
                )}
              >
                {segment.label}
              </Button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
