import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ClipboardPaste,
  Copy,
  FolderPlus,
  Pencil,
  RefreshCw,
  Scissors,
  Search,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Breadcrumb } from './Breadcrumb'
import type { BreadcrumbSegment } from './types'

type ExplorerToolbarProps = {
  breadcrumbs: BreadcrumbSegment[]
  hasSelection: boolean
  canRename: boolean
  canGoBack: boolean
  canGoForward: boolean
  canGoUp: boolean
  canPaste: boolean
  onBack: () => void
  onForward: () => void
  onUp: () => void
  onRefresh: () => void
  onNavigate: (path: string[]) => void
  onCut: () => void
  onCopy: () => void
  onPaste: () => void
  onDelete: () => void
  onRename: () => void
  onNewFolder: () => void
}

function NavButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Button
      type='button'
      variant='ghost'
      size='icon'
      className='size-7 rounded-none hover:bg-accent'
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
    >
      {children}
    </Button>
  )
}

export function ExplorerToolbar({
  breadcrumbs,
  hasSelection,
  canRename,
  canGoBack,
  canGoForward,
  canGoUp,
  canPaste,
  onBack,
  onForward,
  onUp,
  onRefresh,
  onNavigate,
  onCut,
  onCopy,
  onPaste,
  onDelete,
  onRename,
  onNewFolder,
}: ExplorerToolbarProps) {
  return (
    <div className='shrink-0 border-b bg-background'>
      <div className='flex items-center gap-2 px-2 py-1.5'>
        <div
          className='flex shrink-0 items-center overflow-hidden rounded-md border bg-background shadow-xs'
          role='group'
          aria-label='Navigation'
        >
          <NavButton label='Back' disabled={!canGoBack} onClick={onBack}>
            <ArrowLeft className='size-4' />
          </NavButton>
          <div className='h-5 w-px bg-border' />
          <NavButton
            label='Forward'
            disabled={!canGoForward}
            onClick={onForward}
          >
            <ArrowRight className='size-4' />
          </NavButton>
          <div className='h-5 w-px bg-border' />
          <NavButton label='Up' disabled={!canGoUp} onClick={onUp}>
            <ArrowUp className='size-4' />
          </NavButton>
          <div className='h-5 w-px bg-border' />
          <NavButton label='Refresh' onClick={onRefresh}>
            <RefreshCw className='size-4' />
          </NavButton>
        </div>

        <Breadcrumb segments={breadcrumbs} onNavigate={onNavigate} />

        <div className='relative hidden w-44 shrink-0 lg:block xl:w-52'>
          <Search className='absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder={`Search ${breadcrumbs[breadcrumbs.length - 1]?.label ?? 'Desktop'}`}
            className='h-7 rounded-md border-input bg-background ps-8 text-xs'
            readOnly
            aria-label='Search files'
          />
        </div>
      </div>

      <div className='flex flex-wrap items-center gap-1 border-t bg-muted/20 px-2 py-1'>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='h-7 gap-1.5 px-2 text-xs'
          disabled={!hasSelection}
          onClick={onCut}
        >
          <Scissors className='size-3.5' />
          Cut
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='h-7 gap-1.5 px-2 text-xs'
          disabled={!hasSelection}
          onClick={onCopy}
        >
          <Copy className='size-3.5' />
          Copy
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='h-7 gap-1.5 px-2 text-xs'
          disabled={!canPaste}
          onClick={onPaste}
        >
          <ClipboardPaste className='size-3.5' />
          Paste
        </Button>
        <Separator orientation='vertical' className='mx-1 h-5' />
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='h-7 gap-1.5 px-2 text-xs'
          disabled={!canRename}
          onClick={() => onRename()}
        >
          <Pencil className='size-3.5' />
          Rename
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='h-7 gap-1.5 px-2 text-xs text-destructive hover:text-destructive'
          disabled={!hasSelection}
          onClick={onDelete}
        >
          <Trash2 className='size-3.5' />
          Delete
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='h-7 gap-1.5 px-2 text-xs'
          onClick={onNewFolder}
        >
          <FolderPlus className='size-3.5' />
          New folder
        </Button>
      </div>
    </div>
  )
}
