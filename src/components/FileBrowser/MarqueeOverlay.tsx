import { WIN_EXPLORER, type SelectionRect } from './types'

type MarqueeOverlayProps = {
  rect: SelectionRect
}

export function MarqueeOverlay({ rect }: MarqueeOverlayProps) {
  return (
    <div
      className='pointer-events-none absolute z-20 border'
      style={{
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        borderColor: WIN_EXPLORER.marqueeBorder,
        backgroundColor: WIN_EXPLORER.marqueeFill,
      }}
    />
  )
}
