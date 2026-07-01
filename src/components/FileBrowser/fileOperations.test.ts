import { describe, expect, it } from 'vitest'
import {
  addItemsToFolder,
  buildRenamedFileName,
  cloneFileTree,
  createMovedItem,
  createNewFolder,
  createPastedItem,
  getItemExtension,
  isDescendantOrSelfPath,
  moveItemsBetweenFolders,
  removeItemsFromFolder,
  renameItemInFolder,
  splitFileName,
} from './fileOperations'
import { getNodeByPath } from './utils'
import { makeFile, makeFolder } from './test-utils'

const tree = makeFolder('desktop', 'Desktop', '2026-06-01', [
  makeFolder('docs', 'Documents', '2026-06-02', [
    makeFile('resume', 'Resume.pdf', 'pdf', 1024, '2026-06-03'),
    makeFile('notes', 'Notes.txt', 'txt', 256, '2026-06-04'),
  ]),
  makeFolder('downloads', 'Downloads', '2026-06-05', [
    makeFolder('images', 'Images', '2026-06-06', []),
  ]),
])

describe('cloneFileTree', () => {
  it('deep-clones without sharing references', () => {
    const clone = cloneFileTree(tree)
    expect(clone).toEqual(tree)
    expect(clone).not.toBe(tree)
    expect(clone.children?.[0]).not.toBe(tree.children?.[0])
  })
})

describe('addItemsToFolder / removeItemsFromFolder', () => {
  it('adds and removes items immutably', () => {
    const folder = createNewFolder([])
    let next = addItemsToFolder(tree, ['docs'], [folder])
    expect(getNodeByPath(next, ['docs'])?.children).toHaveLength(3)

    next = removeItemsFromFolder(next, ['docs'], [folder.id])
    expect(getNodeByPath(next, ['docs'])?.children).toHaveLength(2)
  })
})

describe('renameItemInFolder', () => {
  it('renames folders and keeps file extensions', () => {
    const renamedFolder = renameItemInFolder(tree, [], 'docs', 'Papers')
    expect(getNodeByPath(renamedFolder, ['docs'])?.name).toBe('Papers')

    const renamedFile = renameItemInFolder(tree, ['docs'], 'resume', 'CV')
    const file = getNodeByPath(renamedFile, ['docs'])?.children?.find(
      (item) => item.id === 'resume'
    )
    expect(file?.name).toBe('CV.pdf')
  })
})

describe('createNewFolder', () => {
  it('picks a unique default name', () => {
    expect(createNewFolder([]).name).toBe('New folder')
    expect(createNewFolder(['New folder']).name).toBe('New folder (2)')
    expect(createNewFolder(['New folder', 'New folder (2)']).name).toBe('New folder (3)')
  })
})

describe('createPastedItem', () => {
  it('copies names and assigns new ids', () => {
    const folder = makeFolder('f1', 'Projects', '2026-01-01')
    expect(createPastedItem(folder, []).name).toBe('Projects - Copy')
    expect(createPastedItem(folder, ['Projects - Copy']).name).toBe('Projects - Copy (2)')

    const file = makeFile('f1', 'Report.pdf', 'pdf', 100, '2026-01-01')
    const pasted = createPastedItem(file, [])
    expect(pasted.name).toBe('Report.pdf - Copy.pdf')
    expect(pasted.id).not.toBe(file.id)
  })

  it('assigns fresh ids throughout a pasted folder tree', () => {
    const folder = makeFolder('react', 'React', '2026-01-01', [
      makeFile('child', 'App.tsx', 'tsx', 1, '2026-01-01'),
    ])
    const pasted = createPastedItem(folder, [])
    expect(pasted.id).not.toBe(folder.id)
    expect(pasted.children?.[0]?.id).not.toBe('child')
  })
})

describe('createMovedItem', () => {
  it('reuses the item or adds a copy suffix on conflict', () => {
    const unique = makeFile('f1', 'Unique.txt', 'txt', 10, '2026-01-01')
    const moved = createMovedItem(unique, [])
    expect(moved).toEqual(unique)

    const conflict = makeFile('f1', 'Report.pdf', 'pdf', 10, '2026-01-01')
    expect(createMovedItem(conflict, ['Report.pdf']).name).toBe('Report.pdf - Copy.pdf')
  })
})

describe('moveItemsBetweenFolders', () => {
  it('moves and copies between folders', () => {
    const moved = moveItemsBetweenFolders(
      tree,
      ['docs'],
      ['downloads'],
      ['resume'],
      'move'
    )
    expect(
      getNodeByPath(moved, ['docs'])?.children?.some((item) => item.id === 'resume')
    ).toBe(false)
    expect(
      getNodeByPath(moved, ['downloads'])?.children?.some((item) => item.id === 'resume')
    ).toBe(true)

    const copied = moveItemsBetweenFolders(
      tree,
      ['docs'],
      ['downloads'],
      ['notes'],
      'copy'
    )
    expect(
      getNodeByPath(copied, ['docs'])?.children?.some((item) => item.id === 'notes')
    ).toBe(true)
    const pasted = getNodeByPath(copied, ['downloads'])?.children?.find((item) =>
      item.name.startsWith('Notes')
    )
    expect(pasted?.id).not.toBe('notes')
  })

  it('blocks moving a folder into itself or a descendant', () => {
    expect(
      moveItemsBetweenFolders(tree, [], ['docs'], ['docs'], 'move')
    ).toBeNull()
    expect(
      moveItemsBetweenFolders(tree, [], ['downloads', 'images'], ['downloads'], 'move')
    ).toBeNull()
  })
})

describe('isDescendantOrSelfPath', () => {
  it('detects ancestor relationships', () => {
    expect(isDescendantOrSelfPath('docs', [], ['docs'])).toBe(true)
    expect(isDescendantOrSelfPath('downloads', [], ['downloads', 'images'])).toBe(true)
    expect(isDescendantOrSelfPath('docs', [], ['downloads'])).toBe(false)
  })
})

describe('splitFileName / buildRenamedFileName / getItemExtension', () => {
  it('splits, rebuilds, and reads extensions', () => {
    expect(splitFileName('archive.tar.gz')).toEqual({
      base: 'archive.tar',
      extension: 'gz',
    })
    expect(buildRenamedFileName('old.pdf', 'new', 'pdf')).toBe('new.pdf')
    expect(
      getItemExtension(makeFile('f', 'ignored', 'pdf', 1, '2026-01-01'))
    ).toBe('pdf')
  })
})
