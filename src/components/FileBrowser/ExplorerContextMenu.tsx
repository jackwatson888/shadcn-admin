import {
  ChevronDown,
  ChevronRight,
  ClipboardPaste,
  Copy,
  FilePlus2,
  FolderOpen,
  FolderPlus,
  Info,
  Pencil,
  RefreshCw,
  Scissors,
  Trash2,
} from 'lucide-react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import type { FileSystemItem, SortColumn, SortState } from './types'

const SORT_OPTIONS: { column: SortColumn; label: string }[] = [
  { column: 'name', label: 'Name' },
  { column: 'dateModified', label: 'Date modified' },
  { column: 'size', label: 'Size' },
]

type ItemContextMenuProps = {
  item: FileSystemItem
  canPaste: boolean
  children: React.ReactNode
  onOpen: (item: FileSystemItem) => void
  onCut: (items?: FileSystemItem[]) => void
  onCopy: (items?: FileSystemItem[]) => void
  onPaste: () => void
  onDelete: (items?: FileSystemItem[]) => void
  onSelectAll: () => void
  onProperties: (item?: FileSystemItem) => void
}

export function ItemContextMenu({
  item,
  canPaste,
  children,
  onOpen,
  onCut,
  onCopy,
  onPaste,
  onDelete,
  onSelectAll,
  onProperties,
}: ItemContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className='min-w-52'>
        <ContextMenuItem onSelect={() => onOpen(item)}>
          <FolderOpen />
          Open
        </ContextMenuItem>
        {item.type === 'folder' && (
          <ContextMenuItem disabled>
            <FilePlus2 />
            Open in new window
          </ContextMenuItem>
        )}
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={() => onCut([item])}>
          <Scissors />
          Cut
          <ContextMenuShortcut>Ctrl+X</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => onCopy([item])}>
          <Copy />
          Copy
          <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem disabled={!canPaste} onSelect={onPaste}>
          <ClipboardPaste />
          Paste
          <ContextMenuShortcut>Ctrl+V</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant='destructive' onSelect={() => onDelete([item])}>
          <Trash2 />
          Delete
          <ContextMenuShortcut>Del</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={onSelectAll}>Select all</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={() => onProperties(item)}>
          <Info />
          Properties
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

type FolderNavContextMenuProps = {
  folder: FileSystemItem
  folderPath: string[]
  parentPath: string[]
  isExpanded: boolean
  hasChildFolders: boolean
  canPaste: boolean
  children: React.ReactNode
  onOpen: (path: string[]) => void
  onToggleExpand: (id: string) => void
  onCut: (item: FileSystemItem, parentPath: string[]) => void
  onCopy: (item: FileSystemItem, parentPath: string[]) => void
  onPaste: (path: string[]) => void
  onDelete: (item: FileSystemItem, parentPath: string[]) => void
  onRename: (item: FileSystemItem, parentPath: string[]) => void
  onProperties: (item: FileSystemItem) => void
}

export function FolderNavContextMenu({
  folder,
  folderPath,
  parentPath,
  isExpanded,
  hasChildFolders,
  canPaste,
  children,
  onOpen,
  onToggleExpand,
  onCut,
  onCopy,
  onPaste,
  onDelete,
  onRename,
  onProperties,
}: FolderNavContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className='min-w-52'>
        <ContextMenuItem onSelect={() => onOpen(folderPath)}>
          <FolderOpen />
          Open
        </ContextMenuItem>
        {hasChildFolders && (
          <ContextMenuItem onSelect={() => onToggleExpand(folder.id)}>
            {isExpanded ? <ChevronDown /> : <ChevronRight />}
            {isExpanded ? 'Collapse' : 'Expand'}
          </ContextMenuItem>
        )}
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={() => onCut(folder, parentPath)}>
          <Scissors />
          Cut
          <ContextMenuShortcut>Ctrl+X</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => onCopy(folder, parentPath)}>
          <Copy />
          Copy
          <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem disabled={!canPaste} onSelect={() => onPaste(folderPath)}>
          <ClipboardPaste />
          Paste
          <ContextMenuShortcut>Ctrl+V</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          variant='destructive'
          onSelect={() => onDelete(folder, parentPath)}
        >
          <Trash2 />
          Delete
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={() => onRename(folder, parentPath)}>
          <Pencil />
          Rename
          <ContextMenuShortcut>F2</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={() => onProperties(folder)}>
          <Info />
          Properties
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

type NavAreaContextMenuProps = {
  folderPath: string[]
  canPaste: boolean
  children: React.ReactNode
  onOpen: (path: string[]) => void
  onPaste: (path: string[]) => void
  onRefresh: () => void
  onProperties: (item?: FileSystemItem) => void
}

export function NavAreaContextMenu({
  folderPath,
  canPaste,
  children,
  onOpen,
  onPaste,
  onRefresh,
  onProperties,
}: NavAreaContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className='min-w-52'>
        <ContextMenuItem onSelect={() => onOpen(folderPath)}>
          <FolderOpen />
          Open
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem disabled={!canPaste} onSelect={() => onPaste(folderPath)}>
          <ClipboardPaste />
          Paste
          <ContextMenuShortcut>Ctrl+V</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={onRefresh}>
          <RefreshCw />
          Refresh
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => onProperties()}>
          <Info />
          Properties
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

type AreaContextMenuProps = {
  canPaste: boolean
  sortState: SortState
  onSortChange: (column: SortColumn) => void
  children: React.ReactNode
  onPaste: () => void
  onNewFolder: () => void
  onRefresh: () => void
  onSelectAll: () => void
  onProperties: (item?: FileSystemItem) => void
}

export function AreaContextMenu({
  canPaste,
  sortState,
  onSortChange,
  children,
  onPaste,
  onNewFolder,
  onRefresh,
  onSelectAll,
  onProperties,
}: AreaContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className='min-w-52'>
        <ContextMenuItem disabled={!canPaste} onSelect={onPaste}>
          <ClipboardPaste />
          Paste
          <ContextMenuShortcut>Ctrl+V</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <FolderPlus />
            New
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onSelect={onNewFolder}>
              <FolderPlus />
              Folder
            </ContextMenuItem>
            <ContextMenuItem disabled>
              <FilePlus2 />
              Shortcut
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger>Sort by</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            {SORT_OPTIONS.map((option) => (
              <ContextMenuItem
                key={option.column}
                onSelect={() => onSortChange(option.column)}
              >
                {option.label}
                {sortState.column === option.column
                  ? sortState.direction === 'asc'
                    ? ' ↑'
                    : ' ↓'
                  : ''}
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuItem onSelect={onSelectAll}>
          Select all
          <ContextMenuShortcut>Ctrl+A</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={onRefresh}>
          <RefreshCw />
          Refresh
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => onProperties()}>
          <Info />
          Properties
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
