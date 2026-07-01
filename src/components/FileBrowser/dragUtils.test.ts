import { describe, expect, it } from 'vitest'
import { parseDragPayload } from './dragUtils'

function makeDragEvent(data: string): React.DragEvent {
  return {
    dataTransfer: {
      getData: (type: string) =>
        type === 'application/x-explorer-items' ? data : '',
    },
  } as unknown as React.DragEvent
}

describe('parseDragPayload', () => {
  it('parses a valid explorer drag payload', () => {
    const payload = {
      itemIds: ['resume', 'notes'],
      sourceFolderPath: ['docs'],
    }
    expect(parseDragPayload(makeDragEvent(JSON.stringify(payload)))).toEqual(
      payload
    )
  })

  it('returns null when the mime payload is missing', () => {
    expect(parseDragPayload(makeDragEvent(''))).toBeNull()
  })

  it('returns null for malformed JSON', () => {
    expect(parseDragPayload(makeDragEvent('{not-json'))).toBeNull()
  })
})
