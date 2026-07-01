import {
  Braces,
  File,
  FileArchive,
  FileCode,
  FileSpreadsheet,
  FileText,
  Folder,
  FolderOpen,
  Image,
  Presentation,
  Video,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FileIconType } from './types'

const iconConfig: Record<
  FileIconType,
  { icon: LucideIcon; className: string }
> = {
  folder: {
    icon: Folder,
    className: 'text-amber-500 fill-amber-500/20',
  },
  image: {
    icon: Image,
    className: 'text-sky-500',
  },
  video: {
    icon: Video,
    className: 'text-violet-500',
  },
  pdf: {
    icon: FileText,
    className: 'text-red-500',
  },
  zip: {
    icon: FileArchive,
    className: 'text-amber-600',
  },
  word: {
    icon: FileText,
    className: 'text-blue-600',
  },
  excel: {
    icon: FileSpreadsheet,
    className: 'text-emerald-600',
  },
  powerpoint: {
    icon: Presentation,
    className: 'text-orange-600',
  },
  json: {
    icon: Braces,
    className: 'text-yellow-600',
  },
  txt: {
    icon: FileText,
    className: 'text-muted-foreground',
  },
  js: {
    icon: FileCode,
    className: 'text-yellow-500',
  },
  ts: {
    icon: FileCode,
    className: 'text-blue-500',
  },
  tsx: {
    icon: FileCode,
    className: 'text-cyan-500',
  },
  html: {
    icon: FileCode,
    className: 'text-orange-500',
  },
  css: {
    icon: FileCode,
    className: 'text-indigo-500',
  },
  file: {
    icon: File,
    className: 'text-muted-foreground',
  },
}

type FileIconProps = {
  type: FileIconType
  size?: 'sm' | 'md' | 'lg'
  open?: boolean
  className?: string
}

const sizeMap = {
  sm: 'size-4',
  md: 'size-8',
  lg: 'size-12',
}

export function FileIcon({ type, size = 'md', open = false, className }: FileIconProps) {
  const config = iconConfig[type]
  const Icon = type === 'folder' && open ? FolderOpen : config.icon

  return (
    <Icon
      className={cn(
        sizeMap[size],
        type === 'folder' && open
          ? 'text-amber-500 fill-amber-400/80'
          : config.className,
        className
      )}
      aria-hidden='true'
    />
  )
}
