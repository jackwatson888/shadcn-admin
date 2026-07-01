import { describe, expect, it } from 'vitest'
import {
  compareByNameAsc,
  findFolderPathById,
  formatAddressPath,
  formatFileSize,
  formatModifiedDate,
  getBreadcrumbSegments,
  getFileIconFromExtension,
  getFileTypeLabel,
  getFolderContents,
  getNodeByPath,
  getParentPath,
  getSortedFolderChildren,
  pathsEqual,
  resolveActionTargets,
  resolveFolderPath,
  sortFolderContents,
} from './utils'
import { makeFile, makeFolder } from './test-utils'

const root = makeFolder('desktop', 'Desktop', '2026-06-01T00:00:00', [
  makeFolder('zebra', 'Zebra', '2026-06-02T00:00:00', []),
  makeFolder('alpha', 'Alpha', '2026-06-03T00:00:00', [
    makeFile('note', 'notes.txt', 'txt', 512, '2026-06-04T00:00:00'),
  ]),
  makeFile('archive', 'backup.zip', 'zip', 1_048_576, '2026-06-05T00:00:00'),
])

describe('formatFileSize', () => {
  it('formats bytes through megabytes', () => {
    expect(formatFileSize(undefined)).toBe('—')
    expect(formatFileSize(0)).toBe('0 B')
    expect(formatFileSize(512)).toBe('512 B')
    expect(formatFileSize(2560)).toBe('2.5 KB')
    expect(formatFileSize(10_485_760)).toBe('10 MB')
  })
})

describe('formatModifiedDate', () => {
  it('uses month/day/year with 12-hour clock', () => {
    const formatted = formatModifiedDate(new Date('2026-06-15T14:30:00'))
    expect(formatted).toMatch(/6\/15\/2026/)
    expect(formatted).toMatch(/2:30 PM/)
  })
})

describe('getFileIconFromExtension', () => {
  it('maps known extensions and falls back to file', () => {
    expect(getFileIconFromExtension('png')).toBe('image')
    expect(getFileIconFromExtension('PDF')).toBe('pdf')
    expect(getFileIconFromExtension('unknown')).toBe('file')
  })
})

describe('getFileTypeLabel', () => {
  it('labels folders and common file types', () => {
    expect(getFileTypeLabel(makeFolder('f', 'Folder', '2026-01-01'))).toBe('File folder')
    expect(
      getFileTypeLabel(makeFile('f', 'a.zip', 'zip', 1, '2026-01-01'))
    ).toBe('Compressed (zipped) folder')
    expect(
      getFileTypeLabel(makeFile('f', 'a.xyz', 'xyz', 1, '2026-01-01'))
    ).toBe('XYZ file')
  })
})

describe('getNodeByPath', () => {
  it('walks valid paths and returns null for bad segments', () => {
    expect(getNodeByPath(root, [])?.id).toBe('desktop')
    expect(getNodeByPath(root, ['alpha'])?.name).toBe('Alpha')
    expect(getNodeByPath(root, ['missing'])).toBeNull()
    expect(getNodeByPath(root, ['archive'])).toBeNull()
  })
})

describe('getSortedFolderChildren', () => {
  it('returns child folders sorted by name', () => {
    expect(getSortedFolderChildren(root).map((f) => f.name)).toEqual(['Alpha', 'Zebra'])
  })
})

describe('sortFolderContents', () => {
  const items = getFolderContents(root)

  it('lists folders before files', () => {
    const sorted = sortFolderContents(items, { column: 'name', direction: 'asc' })
    const firstFile = sorted.findIndex((item) => item.type === 'file')
    const lastFolder = sorted.findLastIndex((item) => item.type === 'folder')
    expect(lastFolder).toBeLessThan(firstFile)
  })

  it('sorts by name, date, and size', () => {
    expect(
      sortFolderContents(items, { column: 'name', direction: 'asc' }).map((i) => i.name)
    ).toEqual(['Alpha', 'Zebra', 'backup.zip'])

    expect(
      sortFolderContents(items, { column: 'name', direction: 'desc' }).map((i) => i.name)
    ).toEqual(['Zebra', 'Alpha', 'backup.zip'])

    const byDate = sortFolderContents(items, {
      column: 'dateModified',
      direction: 'asc',
    })
    expect(byDate[0].name).toBe('Zebra')
    expect(byDate.at(-1)?.name).toBe('backup.zip')

    const bySize = sortFolderContents(items, { column: 'size', direction: 'asc' })
    expect(bySize.at(-1)?.name).toBe('backup.zip')
  })

  it('breaks ties by name', () => {
    const ties = [
      makeFile('b', 'b.txt', 'txt', 100, '2026-06-01'),
      makeFile('a', 'a.txt', 'txt', 100, '2026-06-01'),
    ]
    const sorted = sortFolderContents(ties, { column: 'size', direction: 'asc' })
    expect(sorted.map((item) => item.name)).toEqual(['a.txt', 'b.txt'])
  })
})

describe('compareByNameAsc', () => {
  it('is case-insensitive', () => {
    const a = makeFile('a', 'apple', 'txt', 1, '2026-01-01')
    const b = makeFile('b', 'Banana', 'txt', 1, '2026-01-01')
    expect(compareByNameAsc(a, b)).toBeLessThan(0)
  })
})

describe('getBreadcrumbSegments', () => {
  it('builds segments along a path and stops at invalid ids', () => {
    expect(getBreadcrumbSegments(root, [])).toEqual([{ id: '', label: 'Desktop' }])
    expect(getBreadcrumbSegments(root, ['alpha'])).toEqual([
      { id: '', label: 'Desktop' },
      { id: 'alpha', label: 'Alpha' },
    ])
    expect(getBreadcrumbSegments(root, ['alpha', 'missing'])).toEqual([
      { id: '', label: 'Desktop' },
      { id: 'alpha', label: 'Alpha' },
    ])
  })
})

describe('formatAddressPath', () => {
  it('joins breadcrumb labels with backslashes', () => {
    expect(formatAddressPath([{ id: '', label: 'Desktop' }])).toBe('Desktop')
    expect(
      formatAddressPath([
        { id: '', label: 'Desktop' },
        { id: 'projects', label: 'Projects' },
        { id: 'react', label: 'React' },
      ])
    ).toBe('Desktop\\Projects\\React')
  })
})

describe('resolveFolderPath', () => {
  it('finds a moved folder by id when the stored path is stale', () => {
    const moved = makeFolder('desktop', 'Desktop', '2026-06-01', [
      makeFolder('projects', 'Projects', '2026-06-02', [
        makeFolder('nextjs', 'NextJS', '2026-06-03', [
          makeFolder('react', 'React', '2026-06-04', []),
        ]),
      ]),
    ])

    expect(resolveFolderPath(moved, ['projects', 'react'])).toEqual([
      'projects',
      'nextjs',
      'react',
    ])
    expect(getBreadcrumbSegments(moved, ['projects', 'react'])).toEqual([
      { id: '', label: 'Desktop' },
      { id: 'projects', label: 'Projects' },
      { id: 'nextjs', label: 'NextJS' },
      { id: 'react', label: 'React' },
    ])
  })

  it('looks up a folder path by id', () => {
    expect(findFolderPathById(root, 'alpha')).toEqual(['alpha'])
    expect(findFolderPathById(root, 'missing')).toBeNull()
  })
})

describe('pathsEqual', () => {
  it('compares path arrays', () => {
    expect(pathsEqual(['a', 'b'], ['a', 'b'])).toBe(true)
    expect(pathsEqual(['a'], ['a', 'b'])).toBe(false)
  })
})

describe('getParentPath', () => {
  it('drops the last segment', () => {
    expect(getParentPath(['projects', 'react'])).toEqual(['projects'])
    expect(getParentPath([])).toEqual([])
  })
})

describe('resolveActionTargets', () => {
  const selected = [
    makeFile('a', 'a.txt', 'txt', 1, '2026-01-01'),
    makeFile('b', 'b.txt', 'txt', 1, '2026-01-01'),
  ]
  const selectedIds = new Set(['a', 'b'])

  it('returns explicit items or the full selection', () => {
    expect(
      resolveActionTargets([selected[0]], [selected[0]], new Set(['a']))
    ).toEqual([selected[0]])
    expect(resolveActionTargets([selected[0]], selected, selectedIds)).toEqual(selected)
    expect(resolveActionTargets(undefined, selected, selectedIds)).toEqual(selected)
  })
})
