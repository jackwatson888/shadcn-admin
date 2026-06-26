import { cn } from '@/lib/utils'
import { ItemContextMenu } from './ExplorerContextMenu'
import { FileIcon } from './FileIcon'
import { InlineRenameField } from './InlineRenameField'
import {
  formatFileSize,
  formatModifiedDate,
  getFileTypeLabel,
} from './utils'
import { WIN_EXPLORER, type FileSystemItem, type ViewMode } from './types'

type FileItemProps = {
  item: FileSystemItem
  viewMode: ViewMode
  isSelected: boolean
  isRenaming: boolean
  isDropTarget: boolean
  canPaste: boolean
  onItemClick: (id: string, event: React.MouseEvent) => void
  onOpen: (item: FileSystemItem) => void
  onCut: (items?: FileSystemItem[]) => void
  onCopy: (items?: FileSystemItem[]) => void
  onPaste: () => void
  onDelete: (items?: FileSystemItem[]) => void
  onRename: (item?: FileSystemItem) => void
  onRenameConfirm: (name: string) => void
  onRenameCancel: () => void
  onSelectAll: () => void
  onProperties: (item?: FileSystemItem) => void
  onDragStart: (item: FileSystemItem, event: React.DragEvent) => void
  onFolderDragOver: (folderId: string, event: React.DragEvent) => void
  onFolderDragLeave: (folderId: string) => void
  onFolderDrop: (folderId: string, event: React.DragEvent) => void
}

export function FileItem({
  item,
  viewMode,
  isSelected,
  isRenaming,
  isDropTarget,
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
  onFolderDragOver,
  onFolderDragLeave,
  onFolderDrop,
}: FileItemProps) {
  const handleClick = (event: React.MouseEvent) => {
    if (isRenaming) return
    event.stopPropagation()
    onItemClick(item.id, event)
  }

  const handleMouseDown = (event: React.MouseEvent) => {
    if (isRenaming) return
    event.stopPropagation()
  }

  const handleNameClick = (event: React.MouseEvent) => {
    if (isRenaming) return
    event.stopPropagation()

    if (event.detail >= 2) return

    if (isSelected && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
      onRename(item)
      return
    }

    onItemClick(item.id, event)
  }

  const handleContextMenu = (event: React.MouseEvent) => {
    if (isRenaming) return
    event.stopPropagation()
    if (!isSelected) {
      onItemClick(item.id, {
        ...event,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
      })
    }
  }

  const handleDoubleClick = (event: React.MouseEvent) => {
    if (isRenaming) return
    event.stopPropagation()
    onOpen(item)
  }

  const isFolder = item.type === 'folder'

  const dragProps = isRenaming
    ? { draggable: false }
    : {
        draggable: true,
        onDragStart: (event: React.DragEvent) => {
          event.stopPropagation()
          onDragStart(item, event)
        },
        ...(isFolder && {
          onDragOver: (event: React.DragEvent) => {
            event.preventDefault()
            event.stopPropagation()
            onFolderDragOver(item.id, event)
          },
          onDragEnter: (event: React.DragEvent) => {
            event.preventDefault()
            event.stopPropagation()
            onFolderDragOver(item.id, event)
          },
          onDragLeave: (event: React.DragEvent) => {
            event.stopPropagation()
            onFolderDragLeave(item.id)
          },
          onDrop: (event: React.DragEvent) => {
            event.preventDefault()
            event.stopPropagation()
            onFolderDrop(item.id, event)
          },
        }),
      }

  const menuProps = {
    item,
    canPaste,
    onOpen,
    onCut,
    onCopy,
    onPaste,
    onDelete,
    onRename,
    onSelectAll,
    onProperties,
  }

  const dropClass = isDropTarget
    ? 'ring-2 ring-[#0078d4] bg-[#cce8ff] dark:bg-[#4cc2ff]/20'
    : ''

  if (viewMode === 'grid') {
    return (
      <ItemContextMenu {...menuProps}>
        <div
          data-file-item={item.id}
          role='button'
          tabIndex={0}
          onClick={handleClick}
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
          onContextMenu={handleContextMenu}
          className={cn(
            'flex w-[var(--explorer-grid-size)] flex-col items-center gap-1 rounded-sm border border-transparent p-2 text-center outline-none',
            'cursor-default transition-colors duration-75',
            !isSelected && !isRenaming && 'hover:bg-[#e5f3ff] dark:hover:bg-[#3a3a3a]',
            isSelected && !isRenaming && 'border-[#0078d4]/50 bg-[#0078d4]/10',
            isRenaming && 'border-[#0078d4] bg-white dark:bg-[#2d2d2d]',
            dropClass
          )}
          style={{ '--explorer-grid-size': `${WIN_EXPLORER.gridCellWidth}px` } as React.CSSProperties}
          {...dragProps}
        >
          <FileIcon type={item.icon} size='lg' />
          {isRenaming ? (
            <InlineRenameField
              item={item}
              viewMode='grid'
              onConfirm={onRenameConfirm}
              onCancel={onRenameCancel}
            />
          ) : (
            <span
              onClick={handleNameClick}
              className={cn(
                'line-clamp-2 w-full rounded-[2px] px-1 py-0.5 text-[11px] leading-tight break-words',
                isSelected && 'bg-[#0078d4] text-white dark:bg-[#4cc2ff]/40'
              )}
            >
              {item.name}
            </span>
          )}
        </div>
      </ItemContextMenu>
    )
  }

  const selectedClass = isSelected
    ? 'bg-[#0078d4] text-white dark:bg-[#4cc2ff]/30 dark:text-white'
    : 'hover:bg-[#e5f3ff] dark:hover:bg-[#3a3a3a]'

  return (
    <ItemContextMenu {...menuProps}>
      <div
        data-file-item={item.id}
        role='button'
        tabIndex={0}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        className={cn(
          'grid h-[22px] w-full cursor-default grid-cols-[minmax(0,2.5fr)_minmax(0,1.5fr)_minmax(0,0.75fr)_minmax(0,1.25fr)] items-center gap-3 px-2 text-[12px] outline-none',
          !isRenaming && selectedClass,
          isRenaming && 'bg-white dark:bg-[#2d2d2d]',
          dropClass
        )}
        {...dragProps}
      >
        <span className='flex min-w-0 items-center gap-2'>
          <FileIcon type={item.icon} size='sm' className='shrink-0' />
          {isRenaming ? (
            <InlineRenameField
              item={item}
              viewMode='list'
              onConfirm={onRenameConfirm}
              onCancel={onRenameCancel}
            />
          ) : (
            <span className='truncate' onClick={handleNameClick}>
              {item.name}
            </span>
          )}
        </span>
        <span className={cn('truncate', !isSelected && 'text-[#666] dark:text-[#aaa]')}>
          {getFileTypeLabel(item)}
        </span>
        <span className={cn(!isSelected && 'text-[#666] dark:text-[#aaa]')}>
          {formatFileSize(item.size)}
        </span>
        <span className={cn('truncate', !isSelected && 'text-[#666] dark:text-[#aaa]')}>
          {formatModifiedDate(item.modified)}
        </span>
      </div>
    </ItemContextMenu>
  )
}
