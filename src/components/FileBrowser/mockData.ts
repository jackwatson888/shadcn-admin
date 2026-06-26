import { getFileIconFromExtension } from './utils'
import type { FileSystemItem } from './types'

function file(
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
    icon: getFileIconFromExtension(extension),
    type: 'file',
  }
}

function folder(
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

export const mockFileSystem: FileSystemItem = folder(
  'desktop',
  'Desktop',
  '2026-06-26T09:00:00',
  [
    folder('projects', 'Projects', '2026-06-20T14:30:00', [
      folder('react', 'React', '2026-06-18T10:15:00', [
        file(
          'react-app-tsx',
          'App.tsx',
          'tsx',
          4820,
          '2026-06-18T10:12:00'
        ),
        file(
          'react-index-ts',
          'index.ts',
          'ts',
          1240,
          '2026-06-17T16:45:00'
        ),
        file(
          'react-styles-css',
          'styles.css',
          'css',
          3680,
          '2026-06-17T16:40:00'
        ),
        file(
          'react-package-json',
          'package.json',
          'json',
          2150,
          '2026-06-16T09:20:00'
        ),
      ]),
      folder('nextjs', 'NextJS', '2026-06-15T11:00:00', [
        file(
          'next-page-tsx',
          'page.tsx',
          'tsx',
          3890,
          '2026-06-15T10:55:00'
        ),
        file(
          'next-layout-tsx',
          'layout.tsx',
          'tsx',
          2740,
          '2026-06-14T18:30:00'
        ),
        file(
          'next-config-js',
          'next.config.js',
          'js',
          980,
          '2026-06-14T18:00:00'
        ),
      ]),
      folder('api', 'API', '2026-06-12T08:45:00', [
        file('api-server-ts', 'server.ts', 'ts', 6540, '2026-06-12T08:40:00'),
        file(
          'api-routes-json',
          'routes.json',
          'json',
          4320,
          '2026-06-11T15:20:00'
        ),
        file('api-readme-txt', 'README.txt', 'txt', 1560, '2026-06-10T12:00:00'),
      ]),
      file(
        'projects-readme-md',
        'README.md',
        'md',
        2890,
        '2026-06-19T09:00:00'
      ),
    ]),
    folder('downloads', 'Downloads', '2026-06-25T17:20:00', [
      folder('images', 'Images', '2026-06-24T13:10:00', [
        file(
          'img-screenshot-png',
          'screenshot.png',
          'png',
          2457600,
          '2026-06-24T13:05:00'
        ),
        file(
          'img-wallpaper-jpg',
          'wallpaper.jpg',
          'jpg',
          3145728,
          '2026-06-23T20:15:00'
        ),
        file(
          'img-logo-svg',
          'logo.svg',
          'svg',
          12400,
          '2026-06-22T11:30:00'
        ),
      ]),
      folder('videos', 'Videos', '2026-06-21T19:45:00', [
        file(
          'vid-demo-mp4',
          'demo.mp4',
          'mp4',
          52428800,
          '2026-06-21T19:40:00'
        ),
        file(
          'vid-tutorial-mov',
          'tutorial.mov',
          'mov',
          78643200,
          '2026-06-20T14:00:00'
        ),
      ]),
      file(
        'downloads-archive-zip',
        'backup.zip',
        'zip',
        15728640,
        '2026-06-25T17:15:00'
      ),
    ]),
    folder('documents', 'Documents', '2026-06-10T08:00:00', [
      file(
        'doc-resume-pdf',
        'Resume.pdf',
        'pdf',
        524288,
        '2026-06-08T10:30:00'
      ),
      file(
        'doc-invoice-pdf',
        'Invoice.pdf',
        'pdf',
        389120,
        '2026-06-05T14:20:00'
      ),
      file(
        'doc-notes-txt',
        'Notes.txt',
        'txt',
        8192,
        '2026-06-09T16:45:00'
      ),
      file(
        'doc-report-docx',
        'Report.docx',
        'docx',
        1048576,
        '2026-06-07T11:00:00'
      ),
      file(
        'doc-budget-xlsx',
        'Budget.xlsx',
        'xlsx',
        786432,
        '2026-06-06T09:15:00'
      ),
      file(
        'doc-presentation-pptx',
        'Presentation.pptx',
        'pptx',
        4194304,
        '2026-06-04T13:50:00'
      ),
    ]),
    folder('pictures', 'Pictures', '2026-06-01T12:00:00', [
      file(
        'pic-vacation-jpg',
        'vacation.jpg',
        'jpg',
        2097152,
        '2026-05-28T18:00:00'
      ),
      file(
        'pic-family-png',
        'family.png',
        'png',
        1835008,
        '2026-05-25T10:30:00'
      ),
    ]),
    folder('music', 'Music', '2026-05-15T20:00:00', []),
    file(
      'desktop-archive-zip',
      'Archive.zip',
      'zip',
      10485760,
      '2026-06-01T08:30:00'
    ),
    file(
      'desktop-index-html',
      'index.html',
      'html',
      4520,
      '2026-05-20T15:00:00'
    ),
  ]
)
