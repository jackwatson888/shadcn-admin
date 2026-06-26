import type { DragItemPayload } from './types'

export function parseDragPayload(event: React.DragEvent): DragItemPayload | null {
  try {
    const raw = event.dataTransfer.getData('application/x-explorer-items')
    if (!raw) return null
    return JSON.parse(raw) as DragItemPayload
  } catch {
    return null
  }
}
