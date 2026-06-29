import { AreaContextMenu } from './ExplorerContextMenu'
import { ExplorerColumnHeaders } from './ExplorerColumnHeaders'
import { FileItem } from './FileItem'
import { SelectionSurface } from './SelectionSurface'
import type { FileSystemItem, SelectionRect, SortColumn, SortState } from './types'

type ExplorerContentProps = {
  items: FileSystemItem[]
  selectedIds: Set<string>
  dropTargetId: string | null
  folderName: string
  canPaste: boolean
  sortState: SortState
  onSortChange: (column: SortColumn) => void
  onItemClick: (id: string, event: React.MouseEvent) => void
  onClearSelection: () => void
  onMarqueeComplete: (rect: SelectionRect, container: HTMLElement) => void
  onOpen: (item: FileSystemItem) => void
  onCut: (items?: FileSystemItem[]) => void
  onCopy: (items?: FileSystemItem[]) => void
  onPaste: () => void
  onDelete: (items?: FileSystemItem[]) => void
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
  folderName,
  canPaste,
  sortState,
  onSortChange,
  onItemClick,
  onClearSelection,
  onMarqueeComplete,
  onOpen,
  onCut,
  onCopy,
  onPaste,
  onDelete,
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
    sortState,
    onSortChange,
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

  return (
    <div className='flex min-h-0 flex-1 flex-col bg-[#ffffff] dark:bg-[#1e1e1e]'>
      <ExplorerColumnHeaders sortState={sortState} onSortChange={onSortChange} />
      <AreaContextMenu {...areaMenuProps}>
        {items.length === 0 ? (
          <SelectionSurface
            onMarqueeComplete={onMarqueeComplete}
            onClearSelection={onClearSelection}
            className='flex flex-1 flex-col items-center justify-center p-8 text-center'
          >
            <p className='font-medium'>This folder is empty.</p>
            <p className='text-sm text-muted-foreground'>
              Right-click for options • Drag items here
            </p>
            <p className='text-sm text-muted-foreground'>&quot;{folderName}&quot;</p>
          </SelectionSurface>
        ) : (
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
                  isDropTarget={dropTargetId === item.id}
                  {...itemHandlers}
                />
              ))}
            </div>
          </SelectionSurface>
        )}
      </AreaContextMenu>
    </div>
  )
}
