import { useCallback, useRef, useState } from 'react'
import type { FileSystemItem, SelectionRect } from './types'

function rectsIntersect(
  a: DOMRect,
  b: { left: number; top: number; right: number; bottom: number }
) {
  return !(
    a.right < b.left ||
    a.left > b.right ||
    a.bottom < b.top ||
    a.top > b.bottom
  )
}

export function useSelection(items: FileSystemItem[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const anchorIdRef = useRef<string | null>(null)

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
    anchorIdRef.current = null
  }, [])

  const setSelection = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids))
    anchorIdRef.current = ids[ids.length - 1] ?? null
  }, [])

  const selectAll = useCallback(() => {
    const ids = items.map((item) => item.id)
    setSelectedIds(new Set(ids))
    anchorIdRef.current = ids[ids.length - 1] ?? null
  }, [items])

  const handleItemClick = useCallback(
    (id: string, event: React.MouseEvent) => {
      const isMeta = event.ctrlKey || event.metaKey
      const isShift = event.shiftKey

      if (isShift && anchorIdRef.current) {
        const anchorIndex = items.findIndex((item) => item.id === anchorIdRef.current)
        const clickIndex = items.findIndex((item) => item.id === id)
        if (anchorIndex === -1 || clickIndex === -1) return

        const [start, end] =
          anchorIndex < clickIndex
            ? [anchorIndex, clickIndex]
            : [clickIndex, anchorIndex]

        const rangeIds = items.slice(start, end + 1).map((item) => item.id)
        setSelectedIds(new Set(rangeIds))
        return
      }

      if (isMeta) {
        setSelectedIds((prev) => {
          const next = new Set(prev)
          if (next.has(id)) {
            next.delete(id)
          } else {
            next.add(id)
          }
          return next
        })
        anchorIdRef.current = id
        return
      }

      setSelectedIds(new Set([id]))
      anchorIdRef.current = id
    },
    [items]
  )

  const selectFromMarquee = useCallback(
    (rect: SelectionRect, container: HTMLElement) => {
      const containerRect = container.getBoundingClientRect()
      const selectionBounds = {
        left: containerRect.left + rect.left,
        top: containerRect.top + rect.top,
        right: containerRect.left + rect.left + rect.width,
        bottom: containerRect.top + rect.top + rect.height,
      }

      const matchedIds: string[] = []
      container.querySelectorAll<HTMLElement>('[data-file-item]').forEach((el) => {
        const id = el.dataset.fileItem
        if (!id) return
        if (rectsIntersect(el.getBoundingClientRect(), selectionBounds)) {
          matchedIds.push(id)
        }
      })

      setSelectedIds(new Set(matchedIds))
      anchorIdRef.current = matchedIds[matchedIds.length - 1] ?? null
    },
    []
  )

  const selectedItems = items.filter((item) => selectedIds.has(item.id))
  const hasSelection = selectedIds.size > 0
  const isAllSelected = items.length > 0 && selectedIds.size === items.length

  return {
    selectedIds,
    selectedItems,
    hasSelection,
    isAllSelected,
    clearSelection,
    setSelection,
    selectAll,
    handleItemClick,
    selectFromMarquee,
  }
}
