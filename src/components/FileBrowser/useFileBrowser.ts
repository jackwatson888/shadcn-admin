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
import type { ClipboardEntry, FileSystemItem, SortColumn, SortState } from './types'

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
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(['desktop', ...initialPath])
  )
  const [navHistory, setNavHistory] = useState<NavigationHistory>({
    paths: [initialPath],
    index: 0,
  })
  const [clipboard, setClipboard] = useState<ClipboardEntry | null>(null)
  const [dropTargetId, setDropTargetId] = useState<string | null>(null)
  const [sortState, setSortState] = useState<SortState>({
    column: 'name',
    direction: 'asc',
  })

  const currentFolder = useMemo(
    () => getNodeByPath(fileTree, currentPath) ?? fileTree,
    [fileTree, currentPath]
  )

  const contents = useMemo(
    () => getFolderContents(currentFolder, sortState),
    [currentFolder, sortState]
  )

  const toggleSort = useCallback((column: SortColumn) => {
    setSortState((prev) =>
      prev.column === column
        ? { column, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { column, direction: 'asc' }
    )
  }, [])

  const setSort = useCallback((column: SortColumn, direction: SortState['direction']) => {
    setSortState({ column, direction })
  }, [])

  const setSortDirection = useCallback((direction: SortState['direction']) => {
    setSortState((prev) => ({ ...prev, direction }))
  }, [])

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

  const pasteToPath = useCallback(
    (targetPath: string[]) => {
      if (!clipboard) return

      if (
        clipboard.mode === 'cut' &&
        pathsEqual(clipboard.sourceFolderPath, targetPath)
      ) {
        toast.error('Cannot move items into the same folder')
        return
      }

      const targetFolder = getNodeByPath(fileTree, targetPath)
      if (!targetFolder || targetFolder.type !== 'folder') return

      let existingNames = (targetFolder.children ?? []).map((item) => item.name)
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
        return addItemsToFolder(next, targetPath, pastedItems)
      })

      if (clipboard.mode === 'cut') {
        setClipboard(null)
      }

      toast.success(
        clipboard.mode === 'cut'
          ? `Moved ${pastedItems.length} item(s)`
          : `Pasted ${pastedItems.length} item(s)`
      )
    },
    [clipboard, fileTree]
  )

  const cutTreeItem = useCallback((item: FileSystemItem, parentPath: string[]) => {
    setClipboard({
      mode: 'cut',
      items: [cloneFileSystemItem(item)],
      sourceFolderPath: parentPath,
    })
    toast.message(`Cut "${item.name}"`)
  }, [])

  const copyTreeItem = useCallback((item: FileSystemItem, parentPath: string[]) => {
    setClipboard({
      mode: 'copy',
      items: [cloneFileSystemItem(item)],
      sourceFolderPath: parentPath,
    })
    toast.message(`Copied "${item.name}"`)
  }, [])

  const deleteTreeItem = useCallback(
    (item: FileSystemItem, parentPath: string[]) => {
      setFileTree((prev) => removeItemsFromFolder(prev, parentPath, [item.id]))

      if (clipboard?.items.some((entry) => entry.id === item.id)) {
        setClipboard(null)
      }

      if (currentPath.includes(item.id)) {
        navigateTo(parentPath)
      }

      selection.clearSelection()
      toast.success(`Deleted "${item.name}"`)
    },
    [clipboard, currentPath, navigateTo, selection]
  )

  const createFolder = useCallback(() => {
    const folder = createNewFolder(contents.map((item) => item.name))
    setFileTree((prev) => addItemsToFolder(prev, currentPath, [folder]))
    selection.setSelection([folder.id])
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
      } else if (key === 'escape') {
        selection.clearSelection()
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
    expandedIds,
    clipboard,
    dropTargetId,
    setDropTargetId,
    canGoBack,
    canGoForward,
    canGoUp,
    canPaste,
    sortState,
    toggleSort,
    setSort,
    setSortDirection,
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
    cutItems,
    copyItems,
    pasteItems,
    pasteToPath,
    deleteItems,
    cutTreeItem,
    copyTreeItem,
    deleteTreeItem,
    createFolder,
    showProperties,
    dropItemsOnFolder,
    handleDragStart,
  }
}

export type FileBrowserState = ReturnType<typeof useFileBrowser>
