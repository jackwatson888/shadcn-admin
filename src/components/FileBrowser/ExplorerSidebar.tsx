import { ScrollArea } from '@/components/ui/scroll-area'
import { FolderTree } from './FolderTree'
import type { FileSystemItem } from './types'

type ExplorerSidebarProps = {
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

export function ExplorerSidebar({
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
}: ExplorerSidebarProps) {
  return (
    <aside className='hidden w-52 shrink-0 border-e border-[#d1d1d1] bg-[#fafafa] md:block lg:w-60 dark:border-[#3a3a3a] dark:bg-[#252525]'>
      <div className='border-b border-[#d1d1d1] px-3 py-1.5 dark:border-[#3a3a3a]'>
        <p className='text-[11px] font-semibold tracking-wide text-[#666] uppercase dark:text-[#aaa]'>
          Navigation
        </p>
      </div>
      <ScrollArea className='h-[calc(100%-1.75rem)]'>
        <div className='min-h-full p-1'>
          <FolderTree
            root={root}
            currentPath={currentPath}
            expandedIds={expandedIds}
            dropTargetId={dropTargetId}
            renameTargetId={renameTargetId}
            canPaste={canPaste}
            onToggleExpand={onToggleExpand}
            onNavigate={onNavigate}
            onFolderDragOver={onFolderDragOver}
            onFolderDragLeave={onFolderDragLeave}
            onFolderDrop={onFolderDrop}
            onCutTreeItem={onCutTreeItem}
            onCopyTreeItem={onCopyTreeItem}
            onPasteToPath={onPasteToPath}
            onDeleteTreeItem={onDeleteTreeItem}
            onRenameFromTree={onRenameFromTree}
            onRenameConfirm={onRenameConfirm}
            onRenameCancel={onRenameCancel}
            onRefresh={onRefresh}
            onProperties={onProperties}
          />
        </div>
      </ScrollArea>
    </aside>
  )
}
