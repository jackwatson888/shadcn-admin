import { format } from 'date-fns'
import type { FileIconType, FileSystemItem, BreadcrumbSegment, SortState } from './types'

export function formatFileSize(bytes?: number): string {
  if (bytes === undefined) return '—'
  if (bytes === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  )
  const value = bytes / Math.pow(1024, index)

  return `${value < 10 && index > 0 ? value.toFixed(1) : Math.round(value)} ${units[index]}`
}

export function formatModifiedDate(date: Date): string {
  return format(date, 'M/d/yyyy h:mm a')
}

export function getFileIconFromExtension(extension: string): FileIconType {
  const ext = extension.toLowerCase()

  const iconMap: Record<string, FileIconType> = {
    jpg: 'image',
    jpeg: 'image',
    png: 'image',
    gif: 'image',
    webp: 'image',
    svg: 'image',
    mp4: 'video',
    mov: 'video',
    avi: 'video',
    mkv: 'video',
    webm: 'video',
    pdf: 'pdf',
    zip: 'zip',
    rar: 'zip',
    '7z': 'zip',
    doc: 'word',
    docx: 'word',
    xls: 'excel',
    xlsx: 'excel',
    csv: 'excel',
    ppt: 'powerpoint',
    pptx: 'powerpoint',
    json: 'json',
    txt: 'txt',
    md: 'txt',
    js: 'js',
    mjs: 'js',
    ts: 'ts',
    tsx: 'tsx',
    jsx: 'tsx',
    html: 'html',
    htm: 'html',
    css: 'css',
    scss: 'css',
  }

  return iconMap[ext] ?? 'file'
}

export function getFileTypeLabel(item: FileSystemItem): string {
  if (item.type === 'folder') return 'File folder'

  const ext = item.extension?.toUpperCase()
  if (!ext) return 'File'

  const typeMap: Record<string, string> = {
    JPG: 'JPEG image',
    JPEG: 'JPEG image',
    PNG: 'PNG image',
    GIF: 'GIF image',
    WEBP: 'WebP image',
    SVG: 'SVG image',
    MP4: 'MP4 video',
    MOV: 'MOV video',
    AVI: 'AVI video',
    MKV: 'MKV video',
    WEBM: 'WebM video',
    PDF: 'PDF document',
    ZIP: 'Compressed (zipped) folder',
    RAR: 'RAR archive',
    '7Z': '7-Zip archive',
    DOC: 'Microsoft Word document',
    DOCX: 'Microsoft Word document',
    XLS: 'Microsoft Excel worksheet',
    XLSX: 'Microsoft Excel worksheet',
    CSV: 'CSV file',
    PPT: 'Microsoft PowerPoint presentation',
    PPTX: 'Microsoft PowerPoint presentation',
    JSON: 'JSON file',
    TXT: 'Text document',
    MD: 'Markdown document',
    JS: 'JavaScript file',
    MJS: 'JavaScript module',
    TS: 'TypeScript file',
    TSX: 'TypeScript React file',
    JSX: 'JavaScript React file',
    HTML: 'HTML document',
    HTM: 'HTML document',
    CSS: 'CSS stylesheet',
    SCSS: 'SCSS stylesheet',
  }

  return typeMap[ext] ?? `${ext} file`
}

export function getNodeByPath(
  root: FileSystemItem,
  path: string[]
): FileSystemItem | null {
  let current: FileSystemItem = root

  for (const id of path) {
    const child = current.children?.find((item) => item.id === id)
    if (!child || child.type !== 'folder') return null
    current = child
  }

  return current
}

export function compareByNameAsc(a: FileSystemItem, b: FileSystemItem): number {
  return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
}

function getModifiedTime(item: FileSystemItem): number {
  const value = item.modified
  if (value instanceof Date) {
    return value.getTime()
  }
  return new Date(value).getTime()
}

function compareByColumn(
  a: FileSystemItem,
  b: FileSystemItem,
  column: SortState['column']
): number {
  switch (column) {
    case 'name':
      return compareByNameAsc(a, b)
    case 'dateModified':
      return getModifiedTime(a) - getModifiedTime(b)
    case 'size':
      return (a.size ?? 0) - (b.size ?? 0)
  }
}

export function getSortedFolderChildren(node: FileSystemItem): FileSystemItem[] {
  if (node.type !== 'folder' || !node.children) return []
  return node.children
    .filter((child) => child.type === 'folder')
    .sort(compareByNameAsc)
}

export function getFolderChildren(node: FileSystemItem): FileSystemItem[] {
  if (node.type !== 'folder' || !node.children) return []
  return [...node.children]
}

export function sortFolderContents(
  items: FileSystemItem[],
  sort: SortState
): FileSystemItem[] {
  return [...items].sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'folder' ? -1 : 1
    }

    let result = compareByColumn(a, b, sort.column)
    if (result === 0) {
      result = compareByNameAsc(a, b)
    }

    return sort.direction === 'asc' ? result : -result
  })
}

export function getFolderContents(
  node: FileSystemItem,
  sort: SortState = { column: 'name', direction: 'asc' }
): FileSystemItem[] {
  return sortFolderContents(getFolderChildren(node), sort)
}

export function getBreadcrumbSegments(
  root: FileSystemItem,
  path: string[]
): BreadcrumbSegment[] {
  const segments: BreadcrumbSegment[] = [{ id: '', label: root.name }]
  let current = root

  for (const id of path) {
    const child = current.children?.find((item) => item.id === id)
    if (!child) break
    segments.push({ id, label: child.name })
    current = child
  }

  return segments
}

export function pathsEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  return a.every((segment, index) => segment === b[index])
}

export function getParentPath(path: string[]): string[] {
  return path.slice(0, -1)
}

export function resolveActionTargets(
  explicitItems: FileSystemItem[] | undefined,
  selectedItems: FileSystemItem[],
  selectedIds: Set<string>
): FileSystemItem[] {
  if (explicitItems?.length) {
    const primary = explicitItems[0]
    if (selectedIds.has(primary.id) && selectedItems.length > 1) {
      return selectedItems
    }
    return explicitItems
  }
  return selectedItems
}
