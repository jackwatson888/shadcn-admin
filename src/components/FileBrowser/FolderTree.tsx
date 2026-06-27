import { ChevronRight, Folder } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getSortedFolderChildren, pathsEqual } from './utils'
import type { FileSystemItem } from './types'

type FolderTreeProps = {
  root: FileSystemItem
  currentPath: string[]
  expandedIds: Set<string>
  dropTargetId: string | null
  onToggleExpand: (id: string) => void
  onNavigate: (path: string[]) => void
  onFolderDragOver: (folderId: string) => void
  onFolderDragLeave: () => void
  onFolderDrop: (path: string[], event: React.DragEvent) => void
}

type FolderTreeNodeProps = {
  item: FileSystemItem
  depth: number
  path: string[]
  currentPath: string[]
  expandedIds: Set<string>
  dropTargetId: string | null
  onToggleExpand: (id: string) => void
  onNavigate: (path: string[]) => void
  onFolderDragOver: (folderId: string) => void
  onFolderDragLeave: () => void
  onFolderDrop: (path: string[], event: React.DragEvent) => void
}

function FolderTreeNode({
  item,
  depth,
  path,
  currentPath,
  expandedIds,
  dropTargetId,
  onToggleExpand,
  onNavigate,
  onFolderDragOver,
  onFolderDragLeave,
  onFolderDrop,
}: FolderTreeNodeProps) {
  if (item.type !== 'folder') return null

  const childFolders = getSortedFolderChildren(item)
  const isExpanded = expandedIds.has(item.id)
  const isSelected = pathsEqual(currentPath, path)
  const isDropTarget = dropTargetId === item.id
  const hasChildFolders = childFolders.length > 0

  const dropHandlers = {
    onDragOver: (event: React.DragEvent) => {
      event.preventDefault()
      onFolderDragOver(item.id)
    },
    onDragLeave: () => onFolderDragLeave(),
    onDrop: (event: React.DragEvent) => {
      event.preventDefault()
      onFolderDrop(path, event)
    },
  }

  const rowClass = cn(
    'flex min-w-0 flex-1 items-center gap-1.5 rounded-sm py-1 pe-2 text-start text-[12px] transition-colors duration-75',
    'hover:bg-[#e5f3ff] dark:hover:bg-[#3a3a3a]',
    isSelected && 'bg-[#cce8ff] dark:bg-[#4cc2ff]/20',
    isDropTarget && 'bg-[#cce8ff] ring-1 ring-[#0078d4] dark:bg-[#4cc2ff]/25'
  )

  const handleNavigate = () => {
    onNavigate(path)
    if (hasChildFolders && !isExpanded) {
      onToggleExpand(item.id)
    }
  }

  const handleChevronClick = (event: React.MouseEvent) => {
    event.stopPropagation()
    onToggleExpand(item.id)
  }

  return (
    <div
      role='treeitem'
      aria-expanded={hasChildFolders ? isExpanded : undefined}
      aria-selected={isSelected}
    >
      <div
        className='flex items-center'
        style={{ paddingInlineStart: `${depth * 16 + 4}px` }}
        {...dropHandlers}
      >
        {hasChildFolders ? (
          <button
            type='button'
            onClick={handleChevronClick}
            className='flex size-5 shrink-0 items-center justify-center rounded-sm hover:bg-[#e5f3ff] dark:hover:bg-[#3a3a3a]'
            aria-label={isExpanded ? `Collapse ${item.name}` : `Expand ${item.name}`}
          >
            <ChevronRight
              className={cn(
                'size-3.5 text-muted-foreground transition-transform duration-150',
                isExpanded && 'rotate-90'
              )}
            />
          </button>
        ) : (
          <span className='size-5 shrink-0' aria-hidden='true' />
        )}
        <button type='button' onClick={handleNavigate} className={rowClass}>
          <Folder className='size-4 shrink-0 text-amber-500' aria-hidden='true' />
          <span className='truncate'>{item.name}</span>
        </button>
      </div>
      {hasChildFolders && isExpanded && (
        <div role='group'>
          {childFolders.map((folder) => (
            <FolderTreeNode
              key={folder.id}
              item={folder}
              depth={depth + 1}
              path={[...path, folder.id]}
              currentPath={currentPath}
              expandedIds={expandedIds}
              dropTargetId={dropTargetId}
              onToggleExpand={onToggleExpand}
              onNavigate={onNavigate}
              onFolderDragOver={onFolderDragOver}
              onFolderDragLeave={onFolderDragLeave}
              onFolderDrop={onFolderDrop}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function FolderTree({
  root,
  currentPath,
  expandedIds,
  dropTargetId,
  onToggleExpand,
  onNavigate,
  onFolderDragOver,
  onFolderDragLeave,
  onFolderDrop,
}: FolderTreeProps) {
  const rootFolders = getSortedFolderChildren(root)

  return (
    <div className='space-y-0.5' role='tree' aria-label='Folder navigation'>
      <button
        type='button'
        onClick={() => onNavigate([])}
        onDragOver={(event) => {
          event.preventDefault()
          onFolderDragOver('desktop')
        }}
        onDragLeave={onFolderDragLeave}
        onDrop={(event) => {
          event.preventDefault()
          onFolderDrop([], event)
        }}
        className={cn(
          'flex w-full items-center gap-1.5 rounded-sm px-2 py-1.5 text-start text-[12px]',
          'hover:bg-[#e5f3ff] dark:hover:bg-[#3a3a3a]',
          currentPath.length === 0 && 'bg-[#cce8ff] dark:bg-[#4cc2ff]/20',
          dropTargetId === 'desktop' && 'ring-1 ring-[#0078d4]'
        )}
      >
        <Folder className='size-4 shrink-0 text-amber-500' aria-hidden='true' />
        <span className='truncate'>{root.name}</span>
      </button>
      {rootFolders.map((folder) => (
        <FolderTreeNode
          key={folder.id}
          item={folder}
          depth={1}
          path={[folder.id]}
          currentPath={currentPath}
          expandedIds={expandedIds}
          dropTargetId={dropTargetId}
          onToggleExpand={onToggleExpand}
          onNavigate={onNavigate}
          onFolderDragOver={onFolderDragOver}
          onFolderDragLeave={onFolderDragLeave}
          onFolderDrop={onFolderDrop}
        />
      ))}
    </div>
  )
}
