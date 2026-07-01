import { render, type RenderResult } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { FileBrowser } from './FileBrowser'
import { mockFileSystem } from './mockData'
import type { FileSystemItem } from './types'

export async function renderExplorer(initialPath?: string[]) {
  return await render(
    <FileBrowser root={mockFileSystem} initialPath={initialPath} />
  )
}

export function treeFolder(screen: RenderResult, id: string) {
  return screen.getByTestId(`tree-folder-${id}`)
}

export function treeDesktop(screen: RenderResult) {
  return screen.getByTestId('tree-desktop')
}

export function fileItem(screen: RenderResult, id: string) {
  return screen.getByTestId(`file-item-${id}`)
}

export function fileListSurface(screen: RenderResult) {
  return screen.getByTestId('file-list-surface')
}

export async function focusExplorer(screen: RenderResult) {
  await userEvent.click(screen.getByTestId('file-browser-root'))
}

export async function getVisibleFileNames(screen: RenderResult) {
  const surface = fileListSurface(screen).element()
  const rows = Array.from(surface.querySelectorAll('[data-file-item]'))
  return rows.map((row) => {
    const nameCell = row.querySelector(':scope > span:first-child .truncate')
    return nameCell?.textContent ?? ''
  })
}

export function statusBar(screen: RenderResult) {
  return screen.getByRole('contentinfo')
}

export function navGroup(screen: RenderResult) {
  return screen.getByRole('group', { name: /navigation/i })
}

export async function openFolderInTree(screen: RenderResult, folderId: string) {
  await userEvent.dblClick(treeFolder(screen, folderId))
}

export async function openFolderInDetails(
  screen: RenderResult,
  folderId: string
) {
  await userEvent.dblClick(fileItem(screen, folderId))
}

export async function selectFileItem(screen: RenderResult, itemId: string) {
  await userEvent.click(fileItem(screen, itemId))
}

function resolveToggleModifier(
  modifier: 'Control' | 'Shift' | 'Meta'
): 'Control' | 'Shift' | 'Meta' {
  if (modifier !== 'Control') return modifier
  if (typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)) {
    return 'Meta'
  }
  return modifier
}

export async function modifierClick(
  screen: RenderResult,
  itemId: string,
  modifier: 'Control' | 'Shift' | 'Meta'
) {
  await fileItem(screen, itemId).click({
    modifiers: [resolveToggleModifier(modifier)],
  })
}

export function makeFolder(
  id: string,
  name: string,
  modified: string,
  children: FileSystemItem[] = []
): FileSystemItem {
  return {
    id,
    name,
    modified: new Date(modified),
    icon: 'folder',
    type: 'folder',
    children,
  }
}

export function makeFile(
  id: string,
  name: string,
  extension: string,
  size: number,
  modified: string
): FileSystemItem {
  return {
    id,
    name,
    extension,
    size,
    modified: new Date(modified),
    icon: 'file',
    type: 'file',
  }
}
