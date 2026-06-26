import type { FileSystemItem } from './types'

type ExplorerStatusBarProps = {
  items: FileSystemItem[]
  selectedItems: FileSystemItem[]
  currentFolderName: string
}

export function ExplorerStatusBar({
  items,
  selectedItems,
  currentFolderName,
}: ExplorerStatusBarProps) {
  const folderCount = items.filter((item) => item.type === 'folder').length
  const fileCount = items.filter((item) => item.type === 'file').length
  const itemLabel = items.length === 1 ? '1 item' : `${items.length} items`

  const leftText =
    selectedItems.length === 1
      ? selectedItems[0].name
      : selectedItems.length > 1
        ? `${selectedItems.length} items selected`
        : `${currentFolderName}`

  const rightParts: string[] = []
  if (selectedItems.length === 0) {
    if (folderCount > 0) {
      rightParts.push(folderCount === 1 ? '1 folder' : `${folderCount} folders`)
    }
    if (fileCount > 0) {
      rightParts.push(fileCount === 1 ? '1 file' : `${fileCount} files`)
    }
  } else if (selectedItems.length > 1) {
    const selFolders = selectedItems.filter((i) => i.type === 'folder').length
    const selFiles = selectedItems.filter((i) => i.type === 'file').length
    if (selFolders) rightParts.push(`${selFolders} folder(s)`)
    if (selFiles) rightParts.push(`${selFiles} file(s)`)
  } else {
    rightParts.push(itemLabel)
  }

  return (
    <footer className='flex h-[22px] shrink-0 items-center justify-between border-t border-[#d1d1d1] bg-[#f0f0f0] px-3 text-[11px] text-[#444] dark:border-[#3a3a3a] dark:bg-[#2b2b2b] dark:text-[#ccc]'>
      <span className='truncate'>{leftText}</span>
      <span className='hidden shrink-0 sm:inline'>
        {rightParts.length > 0 ? rightParts.join(' | ') : itemLabel}
      </span>
    </footer>
  )
}
