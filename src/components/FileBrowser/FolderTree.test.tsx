import { describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { renderExplorer, statusBar, treeFolder } from './test-utils'

describe('FolderTree', () => {
  it('double-click expands subfolders and opens the folder', async () => {
    const screen = await renderExplorer()
    const bar = statusBar(screen)

    await expect.element(treeFolder(screen, 'react')).not.toBeInTheDocument()

    await userEvent.dblClick(treeFolder(screen, 'projects'))

    await expect.element(treeFolder(screen, 'react')).toBeInTheDocument()
    await expect.element(treeFolder(screen, 'nextjs')).toBeInTheDocument()
    await expect
      .element(bar.getByText('Projects', { exact: true }))
      .toBeInTheDocument()
    await expect
      .element(screen.getByText('README.md', { exact: true }))
      .toBeInTheDocument()
  })

  it('double-click again collapses subfolders', async () => {
    const screen = await renderExplorer()
    const row = treeFolder(screen, 'projects')

    await userEvent.dblClick(row)
    await expect.element(treeFolder(screen, 'react')).toBeInTheDocument()

    await userEvent.dblClick(row)
    await expect.element(treeFolder(screen, 'react')).not.toBeInTheDocument()
  })

  it('double-click opens leaf folders', async () => {
    const screen = await renderExplorer()
    await userEvent.dblClick(treeFolder(screen, 'documents'))
    await expect
      .element(statusBar(screen).getByText('Documents', { exact: true }))
      .toBeInTheDocument()
    await expect
      .element(screen.getByText('Resume.pdf', { exact: true }))
      .toBeInTheDocument()
  })

  it('keeps opening siblings after another folder is selected', async () => {
    const screen = await renderExplorer()
    const bar = statusBar(screen)

    await userEvent.dblClick(treeFolder(screen, 'downloads'))
    await expect.element(bar.getByText('Downloads', { exact: true })).toBeInTheDocument()

    await userEvent.dblClick(treeFolder(screen, 'documents'))
    await expect.element(bar.getByText('Documents', { exact: true })).toBeInTheDocument()

    await userEvent.dblClick(treeFolder(screen, 'pictures'))
    await expect.element(bar.getByText('Pictures', { exact: true })).toBeInTheDocument()

    await userEvent.dblClick(treeFolder(screen, 'music'))
    await expect.element(bar.getByText('Music', { exact: true })).toBeInTheDocument()
  })

  it('double-clicking the chevron collapses without navigating away', async () => {
    const screen = await renderExplorer()
    const bar = statusBar(screen)

    await userEvent.dblClick(treeFolder(screen, 'downloads'))
    await expect.element(treeFolder(screen, 'images')).toBeInTheDocument()

    await userEvent.dblClick(
      screen.getByRole('button', { name: 'Collapse Downloads', exact: true })
    )

    await expect.element(treeFolder(screen, 'images')).not.toBeInTheDocument()
    await expect.element(bar.getByText('Downloads', { exact: true })).toBeInTheDocument()
  })

  it('single click navigates', async () => {
    const screen = await renderExplorer()
    await userEvent.click(treeFolder(screen, 'projects'))
    await expect
      .element(statusBar(screen).getByText('Projects', { exact: true }))
      .toBeInTheDocument()
  })

  it('double-click on an expanded folder collapses it but stays open in the panel', async () => {
    const screen = await renderExplorer()

    await userEvent.click(
      screen.getByRole('button', { name: 'Expand Projects', exact: true })
    )
    await expect.element(treeFolder(screen, 'react')).toBeInTheDocument()

    await userEvent.dblClick(treeFolder(screen, 'projects'))

    await expect.element(treeFolder(screen, 'react')).not.toBeInTheDocument()
    await expect
      .element(statusBar(screen).getByText('Projects', { exact: true }))
      .toBeInTheDocument()
  })
})
