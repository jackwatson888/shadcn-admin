import { cn } from '@/lib/utils'
import { ItemContextMenu } from './ExplorerContextMenu'
import { FileIcon } from './FileIcon'
import { InlineRenameField } from './InlineRenameField'
import {
  formatFileSize,
  formatModifiedDate,
  getFileTypeLabel,
} from './utils'
import type { FileSystemItem } from './types'

type FileItemProps = {
  item: FileSystemItem
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

  const handleNameMouseDown = (event: React.MouseEvent) => {
    if (isRenaming) return
    if (event.button !== 0) return
    event.stopPropagation()

    if (isSelected && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
      event.preventDefault()
      onRename(item)
    }
  }

  const handleNameClick = (event: React.MouseEvent) => {
    if (isRenaming) return
    event.stopPropagation()

    if (event.detail >= 2) return

    if (isSelected && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
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
          'relative grid h-8 w-full cursor-default grid-cols-[minmax(0,2.5fr)_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,0.75fr)] items-center gap-3 px-3 text-[12px] outline-none',
          !isRenaming && !isSelected && 'hover:bg-[#f5f5f5] dark:hover:bg-[#2d2d2d]',
          isSelected &&
            !isRenaming &&
            'z-10 bg-[#e8f4fc] ring-1 ring-inset ring-[#0067c0] dark:bg-[#4cc2ff]/15 dark:ring-[#4cc2ff]',
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
              onConfirm={onRenameConfirm}
              onCancel={onRenameCancel}
            />
          ) : (
            <span
              className='truncate'
              onMouseDown={handleNameMouseDown}
              onClick={handleNameClick}
            >
              {item.name}
            </span>
          )}
        </span>
        <span className='truncate text-[#666] dark:text-[#aaa]'>
          {formatModifiedDate(item.modified)}
        </span>
        <span className='truncate text-[#666] dark:text-[#aaa]'>
          {getFileTypeLabel(item)}
        </span>
        <span className='text-[#666] dark:text-[#aaa]'>
          {formatFileSize(item.size)}
        </span>
      </div>
    </ItemContextMenu>
  )
}
