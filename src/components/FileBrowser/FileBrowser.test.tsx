import { describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import {
  fileItem,
  fileListSurface,
  focusExplorer,
  getVisibleFileNames,
  modifierClick,
  navGroup,
  openFolderInTree,
  renderExplorer,
  selectFileItem,
  statusBar,
  treeDesktop,
  treeFolder,
} from './test-utils'

describe('FileBrowser', () => {
  describe('navigation', () => {
    it('starts on Desktop with history buttons disabled', async () => {
      const screen = await renderExplorer()

      await expect.element(navGroup(screen).getByLabelText('Back')).toBeDisabled()
      await expect.element(navGroup(screen).getByLabelText('Forward')).toBeDisabled()
      await expect.element(navGroup(screen).getByLabelText('Up')).toBeDisabled()
      await expect
        .element(statusBar(screen).getByText('Desktop', { exact: true }))
        .toBeInTheDocument()
    })

    it('opens initialPath on mount', async () => {
      const screen = await renderExplorer(['documents'])
      await expect
        .element(statusBar(screen).getByText('Documents', { exact: true }))
        .toBeInTheDocument()
      await expect
        .element(screen.getByText('Resume.pdf', { exact: true }))
        .toBeInTheDocument()
    })

    it('navigates from the tree on click', async () => {
      const screen = await renderExplorer()
      await userEvent.click(treeFolder(screen, 'documents'))
      await expect
        .element(statusBar(screen).getByText('Documents', { exact: true }))
        .toBeInTheDocument()
    })

    it('returns to Desktop from the tree root button', async () => {
      const screen = await renderExplorer(['documents'])
      await userEvent.click(treeDesktop(screen))
      await expect
        .element(statusBar(screen).getByText('Desktop', { exact: true }))
        .toBeInTheDocument()
    })

    it('opens folders from the details panel on double-click', async () => {
      const screen = await renderExplorer()
      await userEvent.dblClick(fileItem(screen, 'documents'))
      await expect
        .element(screen.getByText('Resume.pdf', { exact: true }))
        .toBeInTheDocument()
    })

    it('walks back and forward through history', async () => {
      const screen = await renderExplorer()
      await openFolderInTree(screen, 'documents')
      await openFolderInTree(screen, 'downloads')

      await userEvent.click(navGroup(screen).getByLabelText('Back'))
      await expect
        .element(statusBar(screen).getByText('Documents', { exact: true }))
        .toBeInTheDocument()

      await userEvent.click(navGroup(screen).getByLabelText('Forward'))
      await expect
        .element(statusBar(screen).getByText('Downloads', { exact: true }))
        .toBeInTheDocument()
    })

    it('goes up one level from the toolbar', async () => {
      const screen = await renderExplorer(['projects', 'react'])
      await userEvent.click(navGroup(screen).getByLabelText('Up'))
      await expect
        .element(statusBar(screen).getByText('Projects', { exact: true }))
        .toBeInTheDocument()
      await expect
        .element(screen.getByText('README.md', { exact: true }))
        .toBeInTheDocument()
    })

    it('jumps to a breadcrumb ancestor', async () => {
      const screen = await renderExplorer(['projects', 'react'])
      await expect
        .element(screen.getByRole('button', { name: 'Projects', exact: true }))
        .toBeInTheDocument()
      await expect
        .element(screen.getByRole('button', { name: 'React', exact: true }))
        .toBeInTheDocument()

      await userEvent.click(
        screen.getByRole('button', { name: 'Projects', exact: true })
      )
      await expect
        .element(statusBar(screen).getByText('Projects', { exact: true }))
        .toBeInTheDocument()
      await expect.element(treeFolder(screen, 'react')).toBeInTheDocument()
    })

    it('shows the correct breadcrumb for Projects > React', async () => {
      const screen = await renderExplorer()
      await openFolderInTree(screen, 'projects')
      await openFolderInTree(screen, 'react')

      await expect
        .element(screen.getByRole('button', { name: 'Desktop', exact: true }))
        .toBeInTheDocument()
      await expect
        .element(screen.getByRole('button', { name: 'Projects', exact: true }))
        .toBeInTheDocument()
      await expect
        .element(screen.getByRole('button', { name: 'React', exact: true }))
        .toBeInTheDocument()
      await expect
        .element(screen.getByRole('button', { name: 'NextJS', exact: true }))
        .not.toBeInTheDocument()
    })

    it('shows a copyable path string when the address bar is clicked', async () => {
      const screen = await renderExplorer(['projects', 'react'])
      await userEvent.click(screen.getByRole('navigation', { name: 'Address bar' }))

      const pathField = screen.getByRole('textbox', { name: 'Folder path' })
      await expect.element(pathField).toBeInTheDocument()
      await expect.element(pathField).toHaveValue('Desktop\\Projects\\React')
      await expect.element(pathField).toHaveAttribute('readOnly')
    })
  })

  describe('selection', () => {
    it('selects one item and highlights it', async () => {
      const screen = await renderExplorer()
      await selectFileItem(screen, 'documents')
      await expect
        .element(statusBar(screen).getByText('Documents', { exact: true }))
        .toBeInTheDocument()
      await expect.element(fileItem(screen, 'documents')).toHaveClass(/ring-inset/)
    })

    it('replaces selection on a plain click', async () => {
      const screen = await renderExplorer()
      await selectFileItem(screen, 'documents')
      await selectFileItem(screen, 'downloads')
      await expect
        .element(statusBar(screen).getByText('Downloads', { exact: true }))
        .toBeInTheDocument()
      await expect
        .element(fileItem(screen, 'documents'))
        .not.toHaveClass(/ring-inset/)
    })

    it('toggles with Ctrl/Cmd click', async () => {
      const screen = await renderExplorer()
      await selectFileItem(screen, 'documents')
      await modifierClick(screen, 'downloads', 'Control')

      await expect
        .element(statusBar(screen).getByText('2 items selected'))
        .toBeInTheDocument()
      await expect.element(fileItem(screen, 'documents')).toHaveClass(/ring-inset/)
      await expect.element(fileItem(screen, 'downloads')).toHaveClass(/ring-inset/)

      await modifierClick(screen, 'downloads', 'Control')
      await expect
        .element(statusBar(screen).getByText('Documents', { exact: true }))
        .toBeInTheDocument()
      await expect
        .element(fileItem(screen, 'downloads'))
        .not.toHaveClass(/ring-inset/)
    })

    it('selects a range with Shift click', async () => {
      const screen = await renderExplorer()
      await selectFileItem(screen, 'documents')
      await modifierClick(screen, 'pictures', 'Shift')

      await expect
        .element(statusBar(screen).getByText('4 items selected'))
        .toBeInTheDocument()
      await expect.element(fileItem(screen, 'downloads')).toHaveClass(/ring-inset/)
      await expect.element(fileItem(screen, 'music')).toHaveClass(/ring-inset/)
    })

    it('clears selection with Escape', async () => {
      const screen = await renderExplorer()
      await selectFileItem(screen, 'documents')
      await focusExplorer(screen)
      await userEvent.keyboard('{Escape}')
      await expect
        .element(statusBar(screen).getByText('5 folders | 2 files'))
        .toBeInTheDocument()
    })
  })

  describe('sorting', () => {
    it('defaults to name ascending with folders first', async () => {
      const screen = await renderExplorer()
      const names = await getVisibleFileNames(screen)
      expect(names).toEqual([
        'Documents',
        'Downloads',
        'Music',
        'Pictures',
        'Projects',
        'Archive.zip',
        'index.html',
      ])
    })

    it('flips name sort from the column header', async () => {
      const screen = await renderExplorer()
      await userEvent.click(
        screen.getByRole('button', { name: 'Sort by Name', exact: true })
      )
      const names = await getVisibleFileNames(screen)
      expect(names.slice(0, 5)).toEqual([
        'Projects',
        'Pictures',
        'Music',
        'Downloads',
        'Documents',
      ])
    })

    it('sorts by date modified from the column header', async () => {
      const screen = await renderExplorer()
      await userEvent.click(
        screen.getByRole('button', { name: 'Sort by Date modified', exact: true })
      )
      const names = await getVisibleFileNames(screen)
      expect(names[0]).toBe('Music')
      expect(names.at(-1)).toBe('Archive.zip')
    })

    it('sorts by size from the column header', async () => {
      const screen = await renderExplorer()
      await openFolderInTree(screen, 'documents')
      await userEvent.click(
        screen.getByRole('button', { name: 'Sort by Size', exact: true })
      )
      const names = await getVisibleFileNames(screen)
      expect(names[0]).toBe('Notes.txt')
      expect(names.at(-1)).toBe('Presentation.pptx')
    })

    it('changes sort from the toolbar menu', async () => {
      const screen = await renderExplorer()
      await userEvent.click(screen.getByRole('button', { name: 'Sort', exact: true }))
      await userEvent.click(screen.getByRole('menuitem', { name: /Date modified/i }))
      expect((await getVisibleFileNames(screen))[0]).toBe('Music')
    })

    it('changes sort direction from the toolbar menu', async () => {
      const screen = await renderExplorer()
      await userEvent.click(screen.getByRole('button', { name: 'Sort', exact: true }))
      await userEvent.click(screen.getByRole('menuitem', { name: 'Descending' }))
      expect((await getVisibleFileNames(screen))[0]).toBe('Projects')
    })
  })

  describe('clipboard', () => {
    it('keeps Paste disabled until something is copied', async () => {
      const screen = await renderExplorer()
      await expect
        .element(screen.getByRole('button', { name: 'Paste' }))
        .toBeDisabled()
    })

    it('enables Paste after Copy', async () => {
      const screen = await renderExplorer()
      await selectFileItem(screen, 'desktop-archive-zip')
      await userEvent.click(screen.getByRole('button', { name: 'Copy' }))
      await expect
        .element(screen.getByRole('button', { name: 'Paste' }))
        .toBeEnabled()
    })

    it('pastes a copy into another folder', async () => {
      const screen = await renderExplorer()
      await selectFileItem(screen, 'desktop-archive-zip')
      await userEvent.click(screen.getByRole('button', { name: 'Copy' }))
      await openFolderInTree(screen, 'music')
      await userEvent.click(screen.getByRole('button', { name: 'Paste' }))
      await expect
        .element(
          fileListSurface(screen).getByText('Archive.zip - Copy.zip', { exact: true })
        )
        .toBeInTheDocument()
    })

    it('moves a cut file on paste', async () => {
      const screen = await renderExplorer()
      await openFolderInTree(screen, 'documents')
      await selectFileItem(screen, 'doc-notes-txt')
      await userEvent.click(screen.getByRole('button', { name: 'Cut' }))
      await openFolderInTree(screen, 'music')
      await userEvent.click(screen.getByRole('button', { name: 'Paste' }))

      await expect
        .element(fileListSurface(screen).getByText('Notes.txt', { exact: true }))
        .toBeInTheDocument()

      await openFolderInTree(screen, 'documents')
      await expect
        .element(fileListSurface(screen).getByText('Notes.txt', { exact: true }))
        .not.toBeInTheDocument()
    })

    it('disables cut, copy, and delete with no selection', async () => {
      const screen = await renderExplorer()
      await expect.element(screen.getByRole('button', { name: 'Cut' })).toBeDisabled()
      await expect.element(screen.getByRole('button', { name: 'Copy' })).toBeDisabled()
      await expect
        .element(screen.getByRole('button', { name: 'Delete' }))
        .toBeDisabled()
    })
  })

  describe('file operations', () => {
    it('creates a new folder', async () => {
      const screen = await renderExplorer()
      await userEvent.click(
        screen.getByRole('button', { name: 'New folder', exact: true })
      )
      await expect
        .element(statusBar(screen).getByText('New folder', { exact: true }))
        .toBeInTheDocument()
      await expect
        .element(fileListSurface(screen).getByText('New folder', { exact: true }))
        .toBeInTheDocument()
    })

    it('deletes the selected item', async () => {
      const screen = await renderExplorer()
      await selectFileItem(screen, 'desktop-archive-zip')
      await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
      await expect
        .element(screen.getByText('Archive.zip', { exact: true }))
        .not.toBeInTheDocument()
    })

    it('shows the empty-folder message', async () => {
      const screen = await renderExplorer()
      await openFolderInTree(screen, 'music')
      await expect
        .element(screen.getByText('This folder is empty.', { exact: true }))
        .toBeInTheDocument()
    })

    it('renders file metadata in details view', async () => {
      const screen = await renderExplorer()
      await openFolderInTree(screen, 'documents')
      await expect
        .element(
          fileItem(screen, 'doc-resume-pdf').getByText('PDF document', { exact: true })
        )
        .toBeInTheDocument()
      await expect
        .element(
          fileItem(screen, 'doc-resume-pdf').getByText('512 KB', { exact: true })
        )
        .toBeInTheDocument()
    })

    it('updates status bar counts per folder', async () => {
      const screen = await renderExplorer()
      await expect
        .element(statusBar(screen).getByText('5 folders | 2 files'))
        .toBeInTheDocument()
      await openFolderInTree(screen, 'downloads')
      await expect
        .element(statusBar(screen).getByText('2 folders | 1 file'))
        .toBeInTheDocument()
    })

    it('renames a folder from the tree context menu', async () => {
      const screen = await renderExplorer()
      await treeFolder(screen, 'pictures').click({ button: 'right' })
      await userEvent.click(screen.getByRole('menuitem', { name: /Rename/i }))

      const input = screen.getByRole('textbox', { name: /Rename Pictures/i })
      await input.fill('Photos')
      await userEvent.keyboard('{Enter}')

      await expect
        .element(treeFolder(screen, 'pictures').getByText('Photos', { exact: true }))
        .toBeInTheDocument()
      await expect
        .element(fileItem(screen, 'pictures').getByText('Photos', { exact: true }))
        .toBeInTheDocument()
    })

    it('cancels tree rename with Escape', async () => {
      const screen = await renderExplorer()
      await treeFolder(screen, 'music').click({ button: 'right' })
      await userEvent.click(screen.getByRole('menuitem', { name: /Rename/i }))

      const input = screen.getByRole('textbox', { name: /Rename Music/i })
      await input.fill('Audio')
      await userEvent.keyboard('{Escape}')

      await expect.element(screen.getByText('Audio', { exact: true })).not.toBeInTheDocument()
    })
  })

  describe('keyboard', () => {
    it('selects all with Ctrl+A', async () => {
      const screen = await renderExplorer()
      await openFolderInTree(screen, 'documents')
      await focusExplorer(screen)
      await userEvent.keyboard('{Control>}a{/Control}')
      await expect
        .element(statusBar(screen).getByText('6 items selected'))
        .toBeInTheDocument()
    })

    it('deletes with Delete', async () => {
      const screen = await renderExplorer()
      await selectFileItem(screen, 'desktop-index-html')
      await focusExplorer(screen)
      await userEvent.keyboard('{Delete}')
      await expect
        .element(screen.getByText('index.html', { exact: true }))
        .not.toBeInTheDocument()
    })

    it('copies and pastes with Ctrl+C / Ctrl+V', async () => {
      const screen = await renderExplorer()
      await selectFileItem(screen, 'desktop-archive-zip')
      await focusExplorer(screen)
      await userEvent.keyboard('{Control>}c{/Control}')
      await openFolderInTree(screen, 'music')
      await focusExplorer(screen)
      await userEvent.keyboard('{Control>}v{/Control}')
      await expect
        .element(
          fileListSurface(screen).getByText('Archive.zip - Copy.zip', { exact: true })
        )
        .toBeInTheDocument()
    })
  })
})
