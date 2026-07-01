import { getFileIconFromExtension } from './utils'
import type { FileSystemItem } from './types'

export function cloneFileSystemItem(item: FileSystemItem): FileSystemItem {
  return {
    ...item,
    modified: new Date(item.modified),
    children: item.children?.map(cloneFileSystemItem),
  }
}

export function cloneFileTree(root: FileSystemItem): FileSystemItem {
  return cloneFileSystemItem(root)
}

function updateNodeAtPath(
  root: FileSystemItem,
  path: string[],
  updater: (node: FileSystemItem) => FileSystemItem
): FileSystemItem {
  if (path.length === 0) return updater(root)

  const [head, ...rest] = path

  return {
    ...root,
    children: root.children?.map((child) =>
      child.id === head ? updateNodeAtPath(child, rest, updater) : child
    ),
  }
}

export function removeItemFromFolder(
  root: FileSystemItem,
  folderPath: string[],
  itemId: string
): FileSystemItem {
  return updateNodeAtPath(root, folderPath, (folder) => ({
    ...folder,
    children: folder.children?.filter((child) => child.id !== itemId),
  }))
}

export function removeItemsFromFolder(
  root: FileSystemItem,
  folderPath: string[],
  itemIds: string[]
): FileSystemItem {
  const idSet = new Set(itemIds)
  return updateNodeAtPath(root, folderPath, (folder) => ({
    ...folder,
    children: folder.children?.filter((child) => !idSet.has(child.id)),
  }))
}

export function addItemToFolder(
  root: FileSystemItem,
  folderPath: string[],
  item: FileSystemItem
): FileSystemItem {
  return updateNodeAtPath(root, folderPath, (folder) => ({
    ...folder,
    children: [...(folder.children ?? []), item],
  }))
}

export function addItemsToFolder(
  root: FileSystemItem,
  folderPath: string[],
  items: FileSystemItem[]
): FileSystemItem {
  return updateNodeAtPath(root, folderPath, (folder) => ({
    ...folder,
    children: [...(folder.children ?? []), ...items],
  }))
}

export function renameItemInFolder(
  root: FileSystemItem,
  folderPath: string[],
  itemId: string,
  newName: string
): FileSystemItem {
  return updateNodeAtPath(root, folderPath, (folder) => ({
    ...folder,
    children: folder.children?.map((child) => {
      if (child.id !== itemId) return child

      if (child.type === 'file' && child.extension) {
        const ext = child.extension
        const baseName = newName.endsWith(`.${ext}`)
          ? newName.slice(0, -(ext.length + 1))
          : newName.replace(/\.[^.]+$/, '')

        return {
          ...child,
          name: newName.includes('.') ? newName : `${baseName}.${ext}`,
          modified: new Date(),
        }
      }

      return {
        ...child,
        name: newName,
        modified: new Date(),
      }
    }),
  }))
}

export function createUniqueItemId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function assignFreshIds(item: FileSystemItem): FileSystemItem {
  const next: FileSystemItem = {
    ...item,
    id: createUniqueItemId(item.id),
    modified: new Date(item.modified),
    children: item.children?.map(assignFreshIds),
  }
  return next
}

export function createMovedItem(
  item: FileSystemItem,
  existingNames: string[]
): FileSystemItem {
  const clone = cloneFileSystemItem(item)
  const name = item.name

  if (!existingNames.includes(name)) {
    return clone
  }

  const pasted = createPastedItem(item, existingNames)
  return pasted
}

export function createPastedItem(
  item: FileSystemItem,
  existingNames: string[]
): FileSystemItem {
  const clone = assignFreshIds(item)
  const baseName = item.name.replace(/ - Copy( \(\d+\))?$/, '')
  let nextName = `${baseName} - Copy`
  let counter = 2

  while (existingNames.includes(nextName)) {
    nextName = `${baseName} - Copy (${counter})`
    counter += 1
  }

  if (clone.type === 'file' && clone.extension) {
    const ext = clone.extension
    const nameWithoutExt = nextName.replace(new RegExp(`\\.${ext}$`, 'i'), '')
    return {
      ...clone,
      name: `${nameWithoutExt}.${ext}`,
      modified: new Date(),
    }
  }

  return {
    ...clone,
    name: nextName,
    modified: new Date(),
  }
}

export function createNewFolder(existingNames: string[]): FileSystemItem {
  let name = 'New folder'
  let counter = 2

  while (existingNames.includes(name)) {
    name = `New folder (${counter})`
    counter += 1
  }

  return {
    id: createUniqueItemId('folder'),
    name,
    modified: new Date(),
    icon: 'folder',
    type: 'folder',
    children: [],
  }
}

export function isDescendantOrSelfPath(
  itemId: string,
  sourceFolderPath: string[],
  destFolderPath: string[]
): boolean {
  const itemFullPath = [...sourceFolderPath, itemId]
  if (
    itemFullPath.length === destFolderPath.length &&
    itemFullPath.every((id, index) => destFolderPath[index] === id)
  ) {
    return true
  }
  if (destFolderPath.length < itemFullPath.length) return false
  return itemFullPath.every((id, index) => destFolderPath[index] === id)
}

export function moveItemsBetweenFolders(
  root: FileSystemItem,
  sourceFolderPath: string[],
  destFolderPath: string[],
  itemIds: string[],
  mode: 'move' | 'copy'
): FileSystemItem | null {
  const sourceFolder = getFolderAtPath(root, sourceFolderPath)
  if (!sourceFolder?.children) return null

  const idSet = new Set(itemIds)
  const movingItems = sourceFolder.children.filter((child) => idSet.has(child.id))
  if (movingItems.length === 0) return null

  for (const item of movingItems) {
    if (
      item.type === 'folder' &&
      isDescendantOrSelfPath(item.id, sourceFolderPath, destFolderPath)
    ) {
      return null
    }
  }

  let next = root
  const destFolder = getFolderAtPath(next, destFolderPath)
  const existingNames = new Set(destFolder?.children?.map((child) => child.name) ?? [])

  const itemsToAdd = movingItems.map((item) => {
    if (mode === 'copy') {
      const pasted = createPastedItem(item, [...existingNames])
      existingNames.add(pasted.name)
      return pasted
    }
    existingNames.add(item.name)
    return item
  })

  if (mode === 'move') {
    next = removeItemsFromFolder(next, sourceFolderPath, itemIds)
  }

  return addItemsToFolder(next, destFolderPath, itemsToAdd)
}

function getFolderAtPath(
  root: FileSystemItem,
  path: string[]
): FileSystemItem | null {
  let current: FileSystemItem = root
  for (const id of path) {
    const child = current.children?.find((item) => item.id === id)
    if (!child || child.type !== 'folder') return null
    current = child
  }
  return current
}

export function splitFileName(name: string): { base: string; extension?: string } {
  const lastDot = name.lastIndexOf('.')
  if (lastDot <= 0) return { base: name }
  return {
    base: name.slice(0, lastDot),
    extension: name.slice(lastDot + 1),
  }
}

export function buildRenamedFileName(
  _currentName: string,
  newBaseName: string,
  extension?: string
): string {
  if (extension) {
    return `${newBaseName}.${extension}`
  }
  return newBaseName
}

export function getItemExtension(item: FileSystemItem): string | undefined {
  return item.extension ?? splitFileName(item.name).extension
}

export function refreshItemIcon(item: FileSystemItem): FileSystemItem {
  if (item.type === 'folder') {
    return { ...item, icon: 'folder' }
  }

  const extension = getItemExtension(item) ?? ''
  return {
    ...item,
    extension,
    icon: getFileIconFromExtension(extension),
  }
}
