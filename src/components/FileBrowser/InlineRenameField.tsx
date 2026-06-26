import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { buildRenamedFileName, getItemExtension } from './fileOperations'
import { WIN_EXPLORER, type FileSystemItem } from './types'

type InlineRenameFieldProps = {
  item: FileSystemItem
  viewMode: 'grid' | 'list'
  onConfirm: (name: string) => void
  onCancel: () => void
}

function focusAndSelectInput(input: HTMLInputElement) {
  input.focus({ preventScroll: true })
  const end = input.value.length
  input.setSelectionRange(0, end)
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
  const allowBlurCommitRef = useRef(false)

  useEffect(() => {
    let raf2 = 0

    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const input = inputRef.current
        if (input) focusAndSelectInput(input)
      })
    })

    const blurTimer = window.setTimeout(() => {
      allowBlurCommitRef.current = true
      const input = inputRef.current
      if (input && document.activeElement !== input) {
        focusAndSelectInput(input)
      }
    }, 400)

    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
      window.clearTimeout(blurTimer)
    }
  }, [])

  const commit = () => {
    if (committedRef.current) return
    committedRef.current = true

    const trimmed = name.trim()
    if (!trimmed) {
      onCancel()
      return
    }

    const nextName = buildRenamedFileName(item.name, trimmed, extension)
    if (nextName === item.name) {
      onCancel()
      return
    }

    onConfirm(nextName)
  }

  const handleBlur = () => {
    window.setTimeout(() => {
      if (committedRef.current) return
      if (!allowBlurCommitRef.current) return
      if (document.activeElement?.closest('[data-rename-field]')) return
      commit()
    }, 0)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    event.stopPropagation()
    if (event.key === 'Enter') {
      event.preventDefault()
      allowBlurCommitRef.current = true
      commit()
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      committedRef.current = true
      onCancel()
    }
  }

  const inputClass = cn(
    'w-full min-w-0 rounded-[2px] border bg-white text-black outline-none',
    'border-[#0078d4] shadow-[0_0_0_1px_rgba(0,120,212,0.45)]',
    'caret-black selection:bg-[#0078d4] selection:text-white',
    'transition-shadow duration-150 focus:shadow-[0_0_0_2px_rgba(0,120,212,0.55)]',
    viewMode === 'grid'
      ? 'px-1 py-0.5 text-center text-[11px] leading-tight'
      : 'h-[18px] px-1 text-[12px] leading-[18px]'
  )

  return (
    <span
      data-rename-field
      className={cn(
        'inline-flex min-w-0 animate-in items-center fade-in-0 zoom-in-95 duration-150',
        viewMode === 'grid' ? 'w-full justify-center px-0.5' : 'min-w-0 flex-1'
      )}
      style={{ fontFamily: WIN_EXPLORER.font }}
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
    >
      <input
        ref={inputRef}
        type='text'
        value={name}
        autoComplete='off'
        spellCheck={false}
        onChange={(event) => setName(event.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onClick={(event) => {
          event.stopPropagation()
          event.currentTarget.select()
        }}
        onMouseDown={(event) => event.stopPropagation()}
        onFocus={(event) => event.currentTarget.select()}
        className={inputClass}
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
