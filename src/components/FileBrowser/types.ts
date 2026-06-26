export type ViewMode = 'grid' | 'list'

export type FileIconType =
  | 'folder'
  | 'image'
  | 'video'
  | 'pdf'
  | 'zip'
  | 'word'
  | 'excel'
  | 'powerpoint'
  | 'json'
  | 'txt'
  | 'js'
  | 'ts'
  | 'tsx'
  | 'html'
  | 'css'
  | 'file'

export type FileSystemItemType = 'folder' | 'file'

export interface FileSystemItem {
  id: string
  name: string
  extension?: string
  size?: number
  modified: Date
  icon: FileIconType
  type: FileSystemItemType
  children?: FileSystemItem[]
}

export interface BreadcrumbSegment {
  id: string
  label: string
}

export interface FileBrowserProps {
  root: FileSystemItem
  initialPath?: string[]
  className?: string
}

export type ClipboardMode = 'copy' | 'cut'

export interface ClipboardEntry {
  mode: ClipboardMode
  items: FileSystemItem[]
  sourceFolderPath: string[]
}

export interface SelectionRect {
  left: number
  top: number
  width: number
  height: number
}

export interface DragItemPayload {
  itemIds: string[]
  sourceFolderPath: string[]
}

export const WIN_EXPLORER = {
  font: '"Segoe UI", "Segoe UI Variable", system-ui, sans-serif',
  selectionBg: '#0078d4',
  selectionText: '#ffffff',
  hoverBg: '#e5f3ff',
  contentBg: '#ffffff',
  contentBgDark: '#1e1e1e',
  marqueeBorder: '#0078d4',
  marqueeFill: 'rgba(0, 120, 212, 0.35)',
  dropHighlight: '#cce8ff',
  dropHighlightDark: 'rgba(76, 194, 255, 0.2)',
  listRowHeight: 22,
  gridCellWidth: 96,
} as const

export const DRAG_MIME = 'application/x-explorer-items'
