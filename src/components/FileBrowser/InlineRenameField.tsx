import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { buildRenamedFileName, getItemExtension } from './fileOperations'
import type { FileSystemItem } from './types'

type InlineRenameFieldProps = {
  item: FileSystemItem
  viewMode: 'grid' | 'list'
  onConfirm: (name: string) => void
  onCancel: () => void
}

export function InlineRenameField({
  item,
  viewMode,
  onConfirm,
  onCancel,
}: InlineRenameFieldProps) {
  const extension = getItemExtension(item)
  const initialName =
    item.type === 'file' && extension
      ? item.name.replace(new RegExp(`\\.${extension}$`, 'i'), '')
      : item.name

  const [name, setName] = useState(initialName)
  const inputRef = useRef<HTMLInputElement>(null)
  const committedRef = useRef(false)

  useEffect(() => {
    const input = inputRef.current
    if (!input) return
    input.focus()
    input.select()
  }, [])

  const commit = () => {
    if (committedRef.current) return
    committedRef.current = true

    const trimmed = name.trim()
    if (!trimmed) {
      onCancel()
      return
    }

    onConfirm(buildRenamedFileName(item.name, trimmed, extension))
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    event.stopPropagation()
    if (event.key === 'Enter') {
      event.preventDefault()
      commit()
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      committedRef.current = true
      onCancel()
    }
  }

  return (
    <span
      data-rename-field
      className={cn(
        'inline-flex min-w-0 items-center',
        viewMode === 'grid' ? 'w-full justify-center px-0.5' : 'flex-1'
      )}
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
    >
      <input
        ref={inputRef}
        value={name}
        onChange={(event) => setName(event.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
        className={cn(
          'w-full min-w-0 rounded-[2px] border border-[#0078d4] bg-white px-1 text-[#111] outline-none dark:bg-[#2d2d2d] dark:text-white',
          viewMode === 'grid'
            ? 'text-center text-[11px]'
            : 'h-[18px] text-[12px]'
        )}
        aria-label={`Rename ${item.name}`}
      />
      {extension && viewMode === 'list' && (
        <span className='ms-0.5 shrink-0 text-[12px] text-[#666] dark:text-[#aaa]'>
          .{extension}
        </span>
      )}
    </span>
  )
}
