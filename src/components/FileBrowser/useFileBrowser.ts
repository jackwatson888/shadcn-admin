import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  addItemsToFolder,
  cloneFileSystemItem,
  cloneFileTree,
  createMovedItem,
  createNewFolder,
  createPastedItem,
  moveItemsBetweenFolders,
  removeItemsFromFolder,
  renameItemInFolder,
} from './fileOperations'
import { useSelection } from './useSelection'
import {
  getBreadcrumbSegments,
  getFolderContents,
  getNodeByPath,
  getParentPath,
  pathsEqual,
  resolveActionTargets,
} from './utils'
import type { ClipboardEntry, FileSystemItem, ViewMode } from './types'

type UseFileBrowserOptions = {
  root: FileSystemItem
  initialPath?: string[]
}

type NavigationHistory = {
  paths: string[][]
  index: number
}

export function useFileBrowser({ root, initialPath = [] }: UseFileBrowserOptions) {
  const [fileTree, setFileTree] = useState<FileSystemItem>(() => cloneFileTree(root))
  const [currentPath, setCurrentPath] = useState<string[]>(initialPath)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(['desktop', ...initialPath])
  )
  const [navHistory, setNavHistory] = useState<NavigationHistory>({
    paths: [initialPath],
    index: 0,
  })
  const [clipboard, setClipboard] = useState<ClipboardEntry | null>(null)
  const [renameTargetId, setRenameTargetId] = useState<string | null>(null)
  const [dropTargetId, setDropTargetId] = useState<string | null>(null)

  const currentFolder = useMemo(
    () => getNodeByPath(fileTree, currentPath) ?? fileTree,
    [fileTree, currentPath]
  )

  const contents = useMemo(
    () => getFolderContents(currentFolder),
    [currentFolder]
  )

  const selection = useSelection(contents)

  const selectionRef = useRef(selection)
  useEffect(() => {
    selectionRef.current = selection
  })

  const getActionTargets = useCallback((items?: FileSystemItem[]) => {
    const current = selectionRef.current
    return resolveActionTargets(items, current.selectedItems, current.selectedIds)
  }, [])

  const breadcrumbs = useMemo(
    () => getBreadcrumbSegments(fileTree, currentPath),
    [fileTree, currentPath]
  )

  const canGoBack = navHistory.index > 0
  const canGoForward = navHistory.index < navHistory.paths.length - 1
  const canGoUp = currentPath.length > 0
  const canPaste = clipboard !== null

  const navigateTo = useCallback(
    (path: string[]) => {
      const folder = getNodeByPath(fileTree, path)
      if (!folder) return

      setCurrentPath(path)
      selection.clearSelection()

      setExpandedIds((prev) => {
        const next = new Set(prev)
        next.add('desktop')
        path.forEach((id) => next.add(id))
        return next
      })

      setNavHistory((prev) => {
        const trimmed = prev.paths.slice(0, prev.index + 1)
        const last = trimmed[trimmed.length - 1]
        if (last && pathsEqual(last, path)) {
          return prev
        }
        return {
          paths: [...trimmed, path],
          index: trimmed.length,
        }
      })
    },
    [fileTree, selection]
  )

  const goBack = useCallback(() => {
    setNavHistory((prev) => {
      if (prev.index <= 0) return prev
      const newIndex = prev.index - 1
      setCurrentPath(prev.paths[newIndex])
      selection.clearSelection()
      return { ...prev, index: newIndex }
    })
  }, [selection])

  const goForward = useCallback(() => {
    setNavHistory((prev) => {
      if (prev.index >= prev.paths.length - 1) return prev
      const newIndex = prev.index + 1
      setCurrentPath(prev.paths[newIndex])
      selection.clearSelection()
      return { ...prev, index: newIndex }
    })
  }, [selection])

  const goUp = useCallback(() => {
    if (currentPath.length === 0) return
    navigateTo(getParentPath(currentPath))
  }, [currentPath, navigateTo])

  const refresh = useCallback(() => {
    selection.clearSelection()
    toast.message('Folder refreshed')
  }, [selection])

  const openItem = useCallback(
    (item: FileSystemItem) => {
      if (item.type === 'folder') {
        navigateTo([...currentPath, item.id])
      } else {
        toast.message(`Opening ${item.name}`)
      }
    },
    [currentPath, navigateTo]
  )

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const cutItems = useCallback(
    (items?: FileSystemItem[]) => {
      const targets = getActionTargets(items)
      if (targets.length === 0) return

      setClipboard({
        mode: 'cut',
        items: targets.map(cloneFileSystemItem),
        sourceFolderPath: currentPath,
      })
      toast.message(
        targets.length === 1
          ? `Cut "${targets[0].name}"`
          : `Cut ${targets.length} items`
      )
    },
    [currentPath, getActionTargets]
  )

  const copyItems = useCallback(
    (items?: FileSystemItem[]) => {
      const targets = getActionTargets(items)
      if (targets.length === 0) return

      setClipboard({
        mode: 'copy',
        items: targets.map(cloneFileSystemItem),
        sourceFolderPath: currentPath,
      })
      toast.message(
        targets.length === 1
          ? `Copied "${targets[0].name}"`
          : `Copied ${targets.length} items`
      )
    },
    [currentPath, getActionTargets]
  )

  const pasteItems = useCallback(() => {
    if (!clipboard) return

    if (
      clipboard.mode === 'cut' &&
      pathsEqual(clipboard.sourceFolderPath, currentPath)
    ) {
      toast.error('Cannot move items into the same folder')
      return
    }

    let existingNames = contents.map((item) => item.name)
    const pastedItems = clipboard.items.map((item) => {
      const pasted =
        clipboard.mode === 'copy'
          ? createPastedItem(item, existingNames)
          : createMovedItem(item, existingNames)
      existingNames = [...existingNames, pasted.name]
      return pasted
    })

    setFileTree((prev) => {
      let next = prev
      if (clipboard.mode === 'cut') {
        next = removeItemsFromFolder(
          next,
          clipboard.sourceFolderPath,
          clipboard.items.map((item) => item.id)
        )
      }
      return addItemsToFolder(next, currentPath, pastedItems)
    })

    if (clipboard.mode === 'cut') {
      setClipboard(null)
    }

    selection.setSelection(pastedItems.map((item) => item.id))
    toast.success(
      clipboard.mode === 'cut'
        ? `Moved ${pastedItems.length} item(s)`
        : `Pasted ${pastedItems.length} item(s)`
    )
  }, [clipboard, contents, currentPath, selection])

  const deleteItems = useCallback(
    (items?: FileSystemItem[]) => {
      const targets = getActionTargets(items)
      if (targets.length === 0) return

      const ids = targets.map((item) => item.id)

      setFileTree((prev) => removeItemsFromFolder(prev, currentPath, ids))

      if (clipboard?.items.some((item) => ids.includes(item.id))) {
        setClipboard(null)
      }

      selection.clearSelection()
      toast.success(
        targets.length === 1
          ? `Deleted "${targets[0].name}"`
          : `Deleted ${targets.length} items`
      )
    },
    [clipboard, currentPath, getActionTargets, selection]
  )

  const startRename = useCallback(
    (item?: FileSystemItem) => {
      const target = item ?? selectionRef.current.selectedItems[0]
      if (!target) return

      if (!item && selectionRef.current.selectedItems.length > 1) {
        toast.error('Select only one item to rename')
        return
      }

      selection.setSelection([target.id])
      setRenameTargetId(target.id)
    },
    [selection]
  )

  const confirmRename = useCallback(
    (newName: string) => {
      if (!renameTargetId) return

      const trimmed = newName.trim()
      if (!trimmed) {
        setRenameTargetId(null)
        return
      }

      const duplicate = contents.some(
        (item) => item.id !== renameTargetId && item.name === trimmed
      )
      if (duplicate) {
        toast.error('An item with this name already exists')
        return
      }

      setFileTree((prev) =>
        renameItemInFolder(prev, currentPath, renameTargetId, trimmed)
      )
      setRenameTargetId(null)
      toast.success(`Renamed to "${trimmed}"`)
    },
    [contents, currentPath, renameTargetId]
  )

  const cancelRename = useCallback(() => {
    setRenameTargetId(null)
  }, [])

  const createFolder = useCallback(() => {
    const folder = createNewFolder(contents.map((item) => item.name))
    setFileTree((prev) => addItemsToFolder(prev, currentPath, [folder]))
    selection.setSelection([folder.id])
    setRenameTargetId(folder.id)
    toast.message('Created new folder')
  }, [contents, currentPath, selection])

  const showProperties = useCallback(
    (item?: FileSystemItem) => {
      const targets = item
        ? [item]
        : selection.selectedItems.length > 0
          ? selection.selectedItems
          : [currentFolder]

      if (targets.length > 1) {
        toast.message(`${targets.length} items selected`, {
          description: targets.map((t) => t.name).join(', '),
        })
        return
      }

      const target = targets[0]
      toast.message(target.name, {
        description:
          target.type === 'folder'
            ? `Folder • ${target.children?.length ?? 0} items`
            : `${target.extension?.toUpperCase() ?? 'File'} • ${target.size ?? 0} bytes`,
      })
    },
    [currentFolder, selection.selectedItems]
  )

  const dropItemsOnFolder = useCallback(
    (
      destFolderPath: string[],
      itemIds: string[],
      copyMode: boolean,
      sourceFolderPath?: string[]
    ) => {
      if (itemIds.length === 0) return

      const source = sourceFolderPath ?? currentPath
      const mode = copyMode ? 'copy' : 'move'

      setFileTree((prev) => {
        const next = moveItemsBetweenFolders(
          prev,
          source,
          destFolderPath,
          itemIds,
          mode
        )
        if (!next) {
          toast.error('Cannot move folder into itself')
          return prev
        }
        return next
      })

      if (!copyMode) {
        selection.clearSelection()
        toast.success(`Moved ${itemIds.length} item(s)`)
      } else {
        toast.success(`Copied ${itemIds.length} item(s)`)
      }
      setDropTargetId(null)
    },
    [currentPath, selection]
  )

  const handleDragStart = useCallback(
    (item: FileSystemItem, event: React.DragEvent) => {
      let ids = [...selection.selectedIds]
      if (!ids.includes(item.id)) {
        ids = [item.id]
        selection.setSelection([item.id])
      }

      event.dataTransfer.setData(
        'application/x-explorer-items',
        JSON.stringify({ itemIds: ids, sourceFolderPath: currentPath })
      )
      event.dataTransfer.effectAllowed = 'copyMove'
    },
    [currentPath, selection]
  )

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      const key = event.key.toLowerCase()
      const withCtrl = event.ctrlKey || event.metaKey

      if (withCtrl && key === 'c' && selectionRef.current.hasSelection) {
        event.preventDefault()
        copyItems()
      } else if (withCtrl && key === 'x' && selectionRef.current.hasSelection) {
        event.preventDefault()
        cutItems()
      } else if (withCtrl && key === 'v' && canPaste) {
        event.preventDefault()
        pasteItems()
      } else if (withCtrl && key === 'a') {
        event.preventDefault()
        selection.selectAll()
      } else if (key === 'delete' && selectionRef.current.hasSelection) {
        event.preventDefault()
        deleteItems()
      } else if (key === 'f2' && selectionRef.current.selectedItems.length === 1) {
        event.preventDefault()
        startRename()
      } else if (key === 'escape') {
        if (renameTargetId) {
          cancelRename()
        } else {
          selection.clearSelection()
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [
    canPaste,
    copyItems,
    cutItems,
    deleteItems,
    pasteItems,
    selection,
    startRename,
    renameTargetId,
    cancelRename,
  ])

  return {
    fileTree,
    currentPath,
    currentFolder,
    contents,
    breadcrumbs,
    selectedIds: selection.selectedIds,
    selectedItems: selection.selectedItems,
    hasSelection: selection.hasSelection,
    isAllSelected: selection.isAllSelected,
    viewMode,
    expandedIds,
    clipboard,
    renameTargetId,
    dropTargetId,
    setDropTargetId,
    canGoBack,
    canGoForward,
    canGoUp,
    canPaste,
    navigateTo,
    goBack,
    goForward,
    goUp,
    refresh,
    handleItemClick: selection.handleItemClick,
    clearSelection: selection.clearSelection,
    selectAll: selection.selectAll,
    selectFromMarquee: selection.selectFromMarquee,
    openItem,
    toggleExpand,
    navigateToTreeFolder: navigateTo,
    setViewMode,
    cutItems,
    copyItems,
    pasteItems,
    deleteItems,
    startRename,
    confirmRename,
    cancelRename,
    createFolder,
    showProperties,
    dropItemsOnFolder,
    handleDragStart,
  }
}

export type FileBrowserState = ReturnType<typeof useFileBrowser>
