import { cn } from '@/lib/utils'
import { MarqueeOverlay } from './MarqueeOverlay'
import { useMarquee } from './useMarquee'
import { WIN_EXPLORER, type SelectionRect } from './types'

type SelectionSurfaceProps = {
  children: React.ReactNode
  className?: string
  onMarqueeComplete: (rect: SelectionRect, container: HTMLElement) => void
  onClearSelection: () => void
}

export function SelectionSurface({
  children,
  className,
  onMarqueeComplete,
  onClearSelection,
}: SelectionSurfaceProps) {
  const { containerRef, marquee, handleMouseDown } = useMarquee({
    onComplete: onMarqueeComplete,
    onStart: onClearSelection,
  })

  return (
    <div
      ref={containerRef}
      data-testid='file-list-surface'
      className={cn(
        'relative min-h-full flex-1 overflow-auto select-none',
        'bg-[#ffffff] dark:bg-[#1e1e1e]',
        className
      )}
      style={{ fontFamily: WIN_EXPLORER.font }}
      onMouseDown={handleMouseDown}
    >
      {children}
      {marquee && <MarqueeOverlay rect={marquee} />}
    </div>
  )
}
