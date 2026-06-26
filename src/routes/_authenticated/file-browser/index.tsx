import { createFileRoute } from '@tanstack/react-router'
import { FileBrowserDemo } from '@/features/file-browser'

export const Route = createFileRoute('/_authenticated/file-browser/')({
  component: FileBrowserDemo,
})
