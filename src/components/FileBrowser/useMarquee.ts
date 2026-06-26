import { useCallback, useEffect, useRef, useState } from 'react'
import type { SelectionRect } from './types'

type UseMarqueeOptions = {
  onComplete: (rect: SelectionRect, container: HTMLElement) => void
  onStart?: () => void
}

export function useMarquee({ onComplete, onStart }: UseMarqueeOptions) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [marquee, setMarquee] = useState<SelectionRect | null>(null)
  const marqueeRef = useRef<SelectionRect | null>(null)
  const dragState = useRef<{
    startX: number
    startY: number
    active: boolean
  } | null>(null)

  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (event.button !== 0) return
      if ((event.target as HTMLElement).closest('[data-file-item]')) return
      if ((event.target as HTMLElement).closest('[data-rename-field]')) return

      const container = containerRef.current
      if (!container) return

      const rect = container.getBoundingClientRect()
      const startX = event.clientX - rect.left + container.scrollLeft
      const startY = event.clientY - rect.top + container.scrollTop

      dragState.current = { startX, startY, active: true }
      const initial = { left: startX, top: startY, width: 0, height: 0 }
      marqueeRef.current = initial
      setMarquee(initial)
    },
    []
  )

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!dragState.current?.active || !containerRef.current) return

      const container = containerRef.current
      const rect = container.getBoundingClientRect()
      const currentX = event.clientX - rect.left + container.scrollLeft
      const currentY = event.clientY - rect.top + container.scrollTop

      const left = Math.min(dragState.current.startX, currentX)
      const top = Math.min(dragState.current.startY, currentY)
      const width = Math.abs(currentX - dragState.current.startX)
      const height = Math.abs(currentY - dragState.current.startY)

      const next = { left, top, width, height }
      marqueeRef.current = next
      setMarquee(next)
    }

    const handleMouseUp = (event: MouseEvent) => {
      if (!dragState.current?.active || !containerRef.current) return

      const container = containerRef.current
      const finalMarquee = marqueeRef.current
      const mouseupInside = container.contains(event.target as Node)

      if (finalMarquee && finalMarquee.width > 4 && finalMarquee.height > 4) {
        onComplete(finalMarquee, container)
      } else if (mouseupInside) {
        onStart?.()
      }

      dragState.current = null
      marqueeRef.current = null
      setMarquee(null)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [onComplete, onStart])

  return {
    containerRef,
    marquee,
    handleMouseDown,
  }
}
