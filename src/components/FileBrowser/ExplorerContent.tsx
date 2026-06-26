import { ChevronUp } from 'lucide-react'
import { AreaContextMenu } from './ExplorerContextMenu'
import { FileItem } from './FileItem'
import { SelectionSurface } from './SelectionSurface'
import type { FileSystemItem, SelectionRect } from './types'

type ExplorerContentProps = {
  items: FileSystemItem[]
  selectedIds: Set<string>
  dropTargetId: string | null
  renameTargetId: string | null
  folderName: string
  canPaste: boolean
  onItemClick: (id: string, event: React.MouseEvent) => void
  onClearSelection: () => void
  onMarqueeComplete: (rect: SelectionRect, container: HTMLElement) => void
  onOpen: (item: FileSystemItem) => void
  onCut: (items?: FileSystemItem[]) => void
  onCopy: (items?: FileSystemItem[]) => void
  onPaste: () => void
  onDelete: (items?: FileSystemItem[]) => void
  onRename: (item?: FileSystemItem) => void
  onRenameConfirm: (name: string) => void
  onRenameCancel: () => void
  onSelectAll: () => void
  onNewFolder: () => void
  onRefresh: () => void
  onProperties: (item?: FileSystemItem) => void
  onDragStart: (item: FileSystemItem, event: React.DragEvent) => void
  onDropOnFolder: (folderId: string, event: React.DragEvent) => void
  onFolderDragOver: (folderId: string) => void
  onFolderDragLeave: () => void
}

export function ExplorerContent({
  items,
  selectedIds,
  dropTargetId,
  renameTargetId,
  folderName,
  canPaste,
  onItemClick,
  onClearSelection,
  onMarqueeComplete,
  onOpen,
  onCut,
  onCopy,
  onPaste,
  onDelete,
  onRename,
  onRenameConfirm,
  onRenameCancel,
  onSelectAll,
  onNewFolder,
  onRefresh,
  onProperties,
  onDragStart,
  onDropOnFolder,
  onFolderDragOver,
  onFolderDragLeave,
}: ExplorerContentProps) {
  const areaMenuProps = {
    canPaste,
    onPaste,
    onNewFolder,
    onRefresh,
    onSelectAll,
    onProperties,
  }

  const handleFolderDrop = (folderId: string, event: React.DragEvent) => {
    onDropOnFolder(folderId, event)
  }

  const itemHandlers = {
    canPaste,
    onItemClick,
    onOpen,
    onCut,
    onCopy,
    onPaste,
    onDelete,
    onRename,
    onRenameConfirm,
    onRenameCancel,
    onSelectAll,
    onProperties,
    onDragStart,
    onFolderDragOver: (folderId: string, event: React.DragEvent) => {
      event.preventDefault()
      onFolderDragOver(folderId)
    },
    onFolderDragLeave: () => onFolderDragLeave(),
    onFolderDrop: handleFolderDrop,
  }

  if (items.length === 0) {
    return (
      <AreaContextMenu {...areaMenuProps}>
        <SelectionSurface
          onMarqueeComplete={onMarqueeComplete}
          onClearSelection={onClearSelection}
          className='flex flex-col items-center justify-center p-8 text-center'
        >
          <p className='font-medium'>This folder is empty.</p>
          <p className='text-sm text-muted-foreground'>
            Right-click for options • Drag items here
          </p>
          <p className='text-sm text-muted-foreground'>&quot;{folderName}&quot;</p>
        </SelectionSurface>
      </AreaContextMenu>
    )
  }

  return (
    <AreaContextMenu {...areaMenuProps}>
      <div className='flex min-h-0 flex-1 flex-col bg-[#ffffff] dark:bg-[#1e1e1e]'>
        <div className='grid grid-cols-[minmax(0,2.5fr)_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,0.75fr)] gap-3 border-b border-[#e5e5e5] bg-[#fafafa] px-3 py-1.5 text-[11px] text-[#666] dark:border-[#3a3a3a] dark:bg-[#2d2d2d] dark:text-[#aaa]'>
          <span className='flex items-center gap-1'>
            Name
            <ChevronUp className='size-3' aria-hidden='true' />
          </span>
          <span>Date modified</span>
          <span>Type</span>
          <span>Size</span>
        </div>
        <SelectionSurface
          onMarqueeComplete={onMarqueeComplete}
          onClearSelection={onClearSelection}
        >
          <div className='min-h-full'>
            {items.map((item) => (
              <FileItem
                key={item.id}
                item={item}
                isSelected={selectedIds.has(item.id)}
                isRenaming={renameTargetId === item.id}
                isDropTarget={dropTargetId === item.id}
                {...itemHandlers}
              />
            ))}
          </div>
        </SelectionSurface>
      </div>
    </AreaContextMenu>
  )
}
