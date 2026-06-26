import { cn } from '@/lib/utils'
import { ExplorerContent } from './ExplorerContent'
import { parseDragPayload } from './dragUtils'
import { ExplorerSidebar } from './ExplorerSidebar'
import { ExplorerStatusBar } from './ExplorerStatusBar'
import { ExplorerToolbar } from './ExplorerToolbar'
import { useFileBrowser } from './useFileBrowser'
import { WIN_EXPLORER, type FileBrowserProps } from './types'

export function FileBrowser({ root, initialPath, className }: FileBrowserProps) {
  const browser = useFileBrowser({ root, initialPath })

  const handleDropOnFolder = (folderId: string, event: React.DragEvent) => {
    const payload = parseDragPayload(event)
    if (!payload) return

    const copyMode = event.ctrlKey || event.metaKey
    browser.dropItemsOnFolder(
      [...browser.currentPath, folderId],
      payload.itemIds,
      copyMode,
      payload.sourceFolderPath
    )
  }

  return (
    <div
      className={cn(
        'flex h-full min-h-[28rem] flex-col overflow-hidden rounded-md border border-[#d1d1d1] bg-[#f3f3f3] shadow-sm outline-none dark:border-[#3a3a3a] dark:bg-[#202020]',
        className
      )}
      style={{ fontFamily: WIN_EXPLORER.font }}
      tabIndex={-1}
    >
      <ExplorerToolbar
        breadcrumbs={browser.breadcrumbs}
        hasSelection={browser.hasSelection}
        canRename={browser.selectedItems.length === 1}
        canGoBack={browser.canGoBack}
        canGoForward={browser.canGoForward}
        canGoUp={browser.canGoUp}
        canPaste={browser.canPaste}
        onBack={browser.goBack}
        onForward={browser.goForward}
        onUp={browser.goUp}
        onRefresh={browser.refresh}
        onNavigate={browser.navigateTo}
        onCut={browser.cutItems}
        onCopy={browser.copyItems}
        onPaste={browser.pasteItems}
        onDelete={browser.deleteItems}
        onRename={() => {
          const target = browser.selectedItems[0]
          if (target) browser.startRename(target)
        }}
        onNewFolder={browser.createFolder}
      />

      <div className='flex min-h-0 flex-1 border-t border-[#d1d1d1] dark:border-[#3a3a3a]'>
        <ExplorerSidebar
          root={browser.fileTree}
          currentPath={browser.currentPath}
          expandedIds={browser.expandedIds}
          dropTargetId={browser.dropTargetId}
          onToggleExpand={browser.toggleExpand}
          onNavigate={browser.navigateToTreeFolder}
          onFolderDragOver={browser.setDropTargetId}
          onFolderDragLeave={() => browser.setDropTargetId(null)}
          onFolderDrop={(path, event) => {
            const payload = parseDragPayload(event)
            if (!payload) return
            const copyMode = event.ctrlKey || event.metaKey
            browser.dropItemsOnFolder(
              path,
              payload.itemIds,
              copyMode,
              payload.sourceFolderPath
            )
          }}
        />

        <main className='flex min-w-0 flex-1 flex-col'>
          <ExplorerContent
            items={browser.contents}
            selectedIds={browser.selectedIds}
            dropTargetId={browser.dropTargetId}
            renameTargetId={browser.renameTargetId}
            folderName={browser.currentFolder.name}
            canPaste={browser.canPaste}
            onItemClick={browser.handleItemClick}
            onClearSelection={() => {
              if (!browser.renameTargetId) {
                browser.clearSelection()
              }
            }}
            onMarqueeComplete={browser.selectFromMarquee}
            onOpen={browser.openItem}
            onCut={browser.cutItems}
            onCopy={browser.copyItems}
            onPaste={browser.pasteItems}
            onDelete={browser.deleteItems}
            onRename={browser.startRename}
            onRenameConfirm={browser.confirmRename}
            onRenameCancel={browser.cancelRename}
            onSelectAll={browser.selectAll}
            onNewFolder={browser.createFolder}
            onRefresh={browser.refresh}
            onProperties={(item) => browser.showProperties(item)}
            onDragStart={browser.handleDragStart}
            onDropOnFolder={handleDropOnFolder}
            onFolderDragOver={browser.setDropTargetId}
            onFolderDragLeave={() => browser.setDropTargetId(null)}
          />
        </main>
      </div>

      <ExplorerStatusBar
        items={browser.contents}
        selectedItems={browser.selectedItems}
        currentFolderName={browser.currentFolder.name}
      />
    </div>
  )
}
