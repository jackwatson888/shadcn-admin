import {
  ClipboardPaste,
  Copy,
  FilePlus2,
  FolderOpen,
  FolderPlus,
  Info,
  LayoutGrid,
  List,
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
import type { FileSystemItem, ViewMode } from './types'

type ItemContextMenuProps = {
  item: FileSystemItem
  canPaste: boolean
  children: React.ReactNode
  onOpen: (item: FileSystemItem) => void
  onCut: (items?: FileSystemItem[]) => void
  onCopy: (items?: FileSystemItem[]) => void
  onPaste: () => void
  onDelete: (items?: FileSystemItem[]) => void
  onRename: (item?: FileSystemItem) => void
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
  onRename,
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
        <ContextMenuItem onSelect={() => onRename(item)}>
          <Pencil />
          Rename
          <ContextMenuShortcut>F2</ContextMenuShortcut>
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

type AreaContextMenuProps = {
  canPaste: boolean
  viewMode: ViewMode
  children: React.ReactNode
  onPaste: () => void
  onNewFolder: () => void
  onRefresh: () => void
  onSelectAll: () => void
  onViewModeChange: (mode: ViewMode) => void
  onProperties: (item?: FileSystemItem) => void
}

export function AreaContextMenu({
  canPaste,
  viewMode,
  children,
  onPaste,
  onNewFolder,
  onRefresh,
  onSelectAll,
  onViewModeChange,
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
          <ContextMenuSubTrigger>View</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onSelect={() => onViewModeChange('grid')}>
              <LayoutGrid />
              Extra large icons
              {viewMode === 'grid' ? ' ✓' : ''}
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => onViewModeChange('list')}>
              <List />
              Details
              {viewMode === 'list' ? ' ✓' : ''}
            </ContextMenuItem>
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
