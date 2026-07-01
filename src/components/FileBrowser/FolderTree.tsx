import { useCallback, useRef } from 'react'
import { ChevronRight, Folder, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Collapsible,
  CollapsibleContent,
} from '@/components/ui/collapsible'
import { FolderNavContextMenu, NavAreaContextMenu } from './ExplorerContextMenu'
import { InlineRenameField } from './InlineRenameField'
import { getSortedFolderChildren, pathsEqual } from './utils'
import type { FileSystemItem } from './types'

const SINGLE_CLICK_DELAY_MS = 250

function TreeFolderIcon({ open }: { open: boolean }) {
  const Icon = open ? FolderOpen : Folder
  return (
    <Icon
      className='size-4 shrink-0 text-amber-500 fill-amber-400/80'
      aria-hidden='true'
    />
  )
}

type FolderTreeProps = {
  root: FileSystemItem
  currentPath: string[]
  expandedIds: Set<string>
  dropTargetId: string | null
  renameTargetId: string | null
  canPaste: boolean
  onToggleExpand: (id: string) => void
  onNavigate: (path: string[]) => void
  onFolderDragOver: (folderId: string) => void
  onFolderDragLeave: () => void
  onFolderDrop: (path: string[], event: React.DragEvent) => void
  onCutTreeItem: (item: FileSystemItem, parentPath: string[]) => void
  onCopyTreeItem: (item: FileSystemItem, parentPath: string[]) => void
  onPasteToPath: (path: string[]) => void
  onDeleteTreeItem: (item: FileSystemItem, parentPath: string[]) => void
  onRenameFromTree: (item: FileSystemItem, parentPath: string[]) => void
  onRenameConfirm: (name: string) => void
  onRenameCancel: () => void
  onRefresh: () => void
  onProperties: (item?: FileSystemItem) => void
}

type FolderTreeNodeProps = {
  item: FileSystemItem
  depth: number
  path: string[]
  currentPath: string[]
  expandedIds: Set<string>
  dropTargetId: string | null
  renameTargetId: string | null
  onToggleExpand: (id: string) => void
  onNavigate: (path: string[]) => void
  onFolderDragOver: (folderId: string) => void
  onFolderDragLeave: () => void
  onFolderDrop: (path: string[], event: React.DragEvent) => void
  scheduleNavigate: (action: () => void) => void
  cancelScheduledNavigate: () => void
  canPaste: boolean
  onCutTreeItem: (item: FileSystemItem, parentPath: string[]) => void
  onCopyTreeItem: (item: FileSystemItem, parentPath: string[]) => void
  onPasteToPath: (path: string[]) => void
  onDeleteTreeItem: (item: FileSystemItem, parentPath: string[]) => void
  onRenameFromTree: (item: FileSystemItem, parentPath: string[]) => void
  onRenameConfirm: (name: string) => void
  onRenameCancel: () => void
  onProperties: (item?: FileSystemItem) => void
}

function FolderTreeNode({
  item,
  depth,
  path,
  currentPath,
  expandedIds,
  dropTargetId,
  renameTargetId,
  onToggleExpand,
  onNavigate,
  onFolderDragOver,
  onFolderDragLeave,
  onFolderDrop,
  scheduleNavigate,
  cancelScheduledNavigate,
  canPaste,
  onCutTreeItem,
  onCopyTreeItem,
  onPasteToPath,
  onDeleteTreeItem,
  onRenameFromTree,
  onRenameConfirm,
  onRenameCancel,
  onProperties,
}: FolderTreeNodeProps) {
  if (item.type !== 'folder') return null

  const childFolders = getSortedFolderChildren(item)
  const isExpanded = expandedIds.has(item.id)
  const isSelected = pathsEqual(currentPath, path)
  const isDropTarget = dropTargetId === item.id
  const isRenaming = renameTargetId === item.id
  const hasChildFolders = childFolders.length > 0

  const rowClass = cn(
    'flex min-w-0 flex-1 cursor-default items-center gap-1.5 rounded-sm py-1 pe-2 text-start text-[12px] select-none',
    'transition-[background-color,box-shadow] duration-150 ease-out',
    'hover:bg-[#e5f3ff] dark:hover:bg-[#3a3a3a]',
    isSelected && 'bg-[#cce8ff] dark:bg-[#4cc2ff]/20',
    isDropTarget && 'bg-[#cce8ff] ring-1 ring-[#0078d4] dark:bg-[#4cc2ff]/25'
  )

  const handleRowClick = (event: React.MouseEvent) => {
    if (isRenaming) return
    if (event.detail > 1) return
    scheduleNavigate(() => onNavigate(path))
  }

  const handleRowDoubleClick = (event: React.MouseEvent) => {
    if (isRenaming) return
    event.preventDefault()
    event.stopPropagation()
    cancelScheduledNavigate()

    const wasExpanded = isExpanded
    onNavigate(path)
    if (hasChildFolders && wasExpanded) {
      onToggleExpand(item.id)
    }
  }

  const handleChevronClick = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    cancelScheduledNavigate()
    onToggleExpand(item.id)
  }

  const handleChevronDoubleClick = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    cancelScheduledNavigate()
    onToggleExpand(item.id)
  }

  return (
    <Collapsible open={isExpanded} className='group/folder'>
      <FolderNavContextMenu
        folder={item}
        folderPath={path}
        parentPath={path.slice(0, -1)}
        isExpanded={isExpanded}
        hasChildFolders={hasChildFolders}
        canPaste={canPaste}
        onOpen={onNavigate}
        onToggleExpand={onToggleExpand}
        onCut={onCutTreeItem}
        onCopy={onCopyTreeItem}
        onPaste={onPasteToPath}
        onDelete={onDeleteTreeItem}
        onRename={onRenameFromTree}
        onProperties={onProperties}
      >
        <div
          role='treeitem'
          aria-expanded={hasChildFolders ? isExpanded : undefined}
          aria-selected={isSelected}
        >
          <div
            role='button'
            tabIndex={0}
            data-tree-folder={item.id}
            data-testid={`tree-folder-${item.id}`}
            className={cn('flex items-center outline-none', rowClass)}
            style={{ paddingInlineStart: `${depth * 16 + 4}px` }}
            onClick={handleRowClick}
            onDoubleClick={handleRowDoubleClick}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onNavigate(path)
              }
            }}
            onDragOver={(event) => {
              event.preventDefault()
              onFolderDragOver(item.id)
            }}
            onDragLeave={() => onFolderDragLeave()}
            onDrop={(event) => {
              event.preventDefault()
              onFolderDrop(path, event)
            }}
          >
            {hasChildFolders ? (
              <span
                role='button'
                tabIndex={-1}
                onClick={handleChevronClick}
                onDoubleClick={handleChevronDoubleClick}
                className='flex size-5 shrink-0 items-center justify-center rounded-sm transition-colors duration-150 hover:bg-[#cce8ff] dark:hover:bg-[#3a3a3a]'
                aria-label={isExpanded ? `Collapse ${item.name}` : `Expand ${item.name}`}
              >
                <ChevronRight
                  className={cn(
                    'size-3.5 text-muted-foreground transition-transform duration-200 ease-in-out motion-reduce:transition-none',
                    isExpanded && 'rotate-90'
                  )}
                />
              </span>
            ) : (
              <span className='size-5 shrink-0' aria-hidden='true' />
            )}
            <TreeFolderIcon open={isExpanded || isSelected} />
            {isRenaming ? (
              <InlineRenameField
                item={item}
                onConfirm={onRenameConfirm}
                onCancel={onRenameCancel}
              />
            ) : (
              <span className='truncate'>{item.name}</span>
            )}
          </div>
          {hasChildFolders && (
            <CollapsibleContent className='FolderTreeContent'>
              <div role='group' className='overflow-hidden'>
                {childFolders.map((folder) => (
                  <FolderTreeNode
                    key={folder.id}
                    item={folder}
                    depth={depth + 1}
                    path={[...path, folder.id]}
                    currentPath={currentPath}
                    expandedIds={expandedIds}
                    dropTargetId={dropTargetId}
                    renameTargetId={renameTargetId}
                    onToggleExpand={onToggleExpand}
                    onNavigate={onNavigate}
                    onFolderDragOver={onFolderDragOver}
                    onFolderDragLeave={onFolderDragLeave}
                    onFolderDrop={onFolderDrop}
                    scheduleNavigate={scheduleNavigate}
                    cancelScheduledNavigate={cancelScheduledNavigate}
                    canPaste={canPaste}
                    onCutTreeItem={onCutTreeItem}
                    onCopyTreeItem={onCopyTreeItem}
                    onPasteToPath={onPasteToPath}
                    onDeleteTreeItem={onDeleteTreeItem}
                    onRenameFromTree={onRenameFromTree}
                    onRenameConfirm={onRenameConfirm}
                    onRenameCancel={onRenameCancel}
                    onProperties={onProperties}
                  />
                ))}
              </div>
            </CollapsibleContent>
          )}
        </div>
      </FolderNavContextMenu>
    </Collapsible>
  )
}

export function FolderTree({
  root,
  currentPath,
  expandedIds,
  dropTargetId,
  renameTargetId,
  canPaste,
  onToggleExpand,
  onNavigate,
  onFolderDragOver,
  onFolderDragLeave,
  onFolderDrop,
  onCutTreeItem,
  onCopyTreeItem,
  onPasteToPath,
  onDeleteTreeItem,
  onRenameFromTree,
  onRenameConfirm,
  onRenameCancel,
  onRefresh,
  onProperties,
}: FolderTreeProps) {
  const singleClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navigationGenerationRef = useRef(0)

  const scheduleNavigate = useCallback((action: () => void) => {
    if (singleClickTimerRef.current) {
      clearTimeout(singleClickTimerRef.current)
    }
    const generation = ++navigationGenerationRef.current
    singleClickTimerRef.current = setTimeout(() => {
      if (generation === navigationGenerationRef.current) {
        action()
      }
      singleClickTimerRef.current = null
    }, SINGLE_CLICK_DELAY_MS)
  }, [])

  const cancelScheduledNavigate = useCallback(() => {
    navigationGenerationRef.current += 1
    if (singleClickTimerRef.current) {
      clearTimeout(singleClickTimerRef.current)
      singleClickTimerRef.current = null
    }
  }, [])

  const handleNavigate = useCallback(
    (path: string[]) => {
      cancelScheduledNavigate()
      onNavigate(path)
    },
    [cancelScheduledNavigate, onNavigate]
  )

  const rootFolders = getSortedFolderChildren(root)

  return (
    <NavAreaContextMenu
      folderPath={[]}
      canPaste={canPaste}
      onOpen={handleNavigate}
      onPaste={onPasteToPath}
      onRefresh={onRefresh}
      onProperties={onProperties}
    >
      <div className='space-y-0.5' role='tree' aria-label='Folder navigation'>
        <button
          type='button'
          data-testid='tree-desktop'
          onClick={() => handleNavigate([])}
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
            'transition-[background-color,box-shadow] duration-150 ease-out',
            'hover:bg-[#e5f3ff] dark:hover:bg-[#3a3a3a]',
            currentPath.length === 0 && 'bg-[#cce8ff] dark:bg-[#4cc2ff]/20',
            dropTargetId === 'desktop' && 'ring-1 ring-[#0078d4]'
          )}
        >
          <TreeFolderIcon open={currentPath.length === 0} />
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
            renameTargetId={renameTargetId}
            onToggleExpand={onToggleExpand}
            onNavigate={handleNavigate}
            onFolderDragOver={onFolderDragOver}
            onFolderDragLeave={onFolderDragLeave}
            onFolderDrop={onFolderDrop}
            scheduleNavigate={scheduleNavigate}
            cancelScheduledNavigate={cancelScheduledNavigate}
            canPaste={canPaste}
            onCutTreeItem={onCutTreeItem}
            onCopyTreeItem={onCopyTreeItem}
            onPasteToPath={onPasteToPath}
            onDeleteTreeItem={onDeleteTreeItem}
            onRenameFromTree={onRenameFromTree}
            onRenameConfirm={onRenameConfirm}
            onRenameCancel={onRenameCancel}
            onProperties={onProperties}
          />
        ))}
      </div>
    </NavAreaContextMenu>
  )
}
