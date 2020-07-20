import ReactDOMServer from 'react-dom/server'
import ObjectId from 'bson-objectid'
import cloneDeep from 'clone-deep'
import { BlockType } from '@databyss-org/services/interfaces'
import { Text, Range, Selection, EditorState, Block } from '../interfaces'
import { isAtomicInlineType } from './util'
import { stateToHTMLString } from './slateUtils'

interface BasicBlock {
  type: BlockType
  text: Text
}

interface SplitBlocks {
  before: BasicBlock | null
  after: BasicBlock | null
}

// returns before and after value for block split at `offset`
const splitBlockAtOffset = ({
  block,
  offset,
}: {
  block: BasicBlock
  offset: number
}): SplitBlocks => {
  // if entire atomic is selected
  if (isAtomicInlineType(block.type) && offset !== 0) {
    return { before: { text: block.text, type: block.type }, after: null }
  }

  // if offset is at start of block, return block value
  if (offset === 0) {
    return { before: null, after: { text: block.text, type: block.type } }
  }

  if (offset === block.text.textValue.length) {
    return { before: { text: block.text, type: block.type }, after: null }
  }

  let rangesForBlockBefore: Range[] = []
  let rangesForBlockAfter: Range[] = []

  block.text.ranges.forEach((r: Range) => {
    if (r.offset > offset) {
      rangesForBlockAfter.push({
        offset: r.offset - offset,
        length: r.length,
        marks: r.marks,
      })
    }
    if (r.offset < offset) {
      rangesForBlockBefore.push({
        offset: r.offset,
        length: offset - r.offset,
        marks: r.marks,
      })
      rangesForBlockAfter.push({
        offset: 0,
        length: r.length + r.offset - offset,
        marks: r.marks,
      })
    }
    if (r.offset === offset) {
      rangesForBlockAfter.push({
        offset: 0,
        length: r.length,
        marks: r.marks,
      })
    }
  })

  rangesForBlockBefore = rangesForBlockBefore.filter(r => r.length > 0)

  rangesForBlockAfter = rangesForBlockAfter.filter(r => r.length > 0)

  return {
    before: {
      text: {
        textValue: block.text.textValue.substring(0, offset),
        ranges: rangesForBlockBefore,
      },
      type: block.type,
    },
    after: {
      text: {
        textValue: block.text.textValue.substring(offset),
        ranges: rangesForBlockAfter,
      },
      type: block.type,
    },
  }
}

// checks is state selection is collapsed
export const isSelectionCollapsed = (selection: Selection): boolean => {
  const { anchor, focus } = selection
  return anchor.index === focus.index && anchor.offset === focus.offset
}

// return atomic or new id
const fragmentId = (type: BlockType, id: string): string =>
  isAtomicInlineType(type) ? id : new ObjectId().toHexString()

// takes blocks array and resets the id's for non atomic types
export const resetIds = (fragment: Block[]): Block[] =>
  fragment.map(block => ({ ...block, _id: fragmentId(block.type, block._id) }))

const addBlockUIFields = (frag: Block[]): Block[] =>
  frag.map(b => ({ ...b, __showNewBlockMenu: false, __isActive: false }))

// always have the anchor come before the focus
export const sortSelection = (selection: Selection): Selection => {
  const { anchor, focus } = selection

  if (
    anchor.index > focus.index ||
    (anchor.offset > focus.offset && anchor.index === focus.index)
  ) {
    return {
      anchor: focus,
      focus: anchor,
    }
  }
  return { anchor, focus }
}

// returns fragment in state selection
export const getFragmentForCurrentSelection = (state: EditorState): Block[] => {
  if (isSelectionCollapsed(state.selection)) {
    return []
  }

  let frag: Block[] = []

  const { blocks, selection } = state

  const { anchor, focus } = sortSelection(selection)

  // if selection is within the same block
  if (anchor.index === focus.index) {
    const _selectionLength = focus.offset - anchor.offset
    const _block = blocks[anchor.index]
    // split block at anchor offset and use `after`
    const _firstSplit = splitBlockAtOffset({
      block: _block,
      offset: anchor.offset,
    }).after

    // split block at length of selection and get `before`
    const _secondSplit = splitBlockAtOffset({
      block: _firstSplit || _block,
      offset: _selectionLength,
    }).before

    // if selection is use the first split
    const _frag = _secondSplit || _firstSplit

    if (_frag) {
      frag.push({
        ..._frag,
        _id: fragmentId(_frag.type, blocks[anchor.index]._id),
      })
    }
  }

  // if selection is more than one block
  if (anchor.index < focus.index) {
    blocks.forEach((block: Block, index: number) => {
      // first block
      if (index === anchor.index) {
        const { after: firstBlock } = isAtomicInlineType(block.type)
          ? { after: block }
          : splitBlockAtOffset({
              block: block,
              offset: anchor.offset,
            })

        if (firstBlock) {
          frag.push({
            ...firstBlock,
            _id: fragmentId(firstBlock.type, block._id),
          })
        }
      }
      // get in between frags
      else if (index > anchor.index && index < focus.index) {
        const _sliceLength = focus.index - anchor.index
        //   console.log(_sliceLength)
        if (_sliceLength > 1) {
          frag.push({
            text: block.text,
            type: block.type,
            _id: fragmentId(block.type, block._id),
          })
        }
      }

      // last block
      else if (index === focus.index) {
        const { before: lastBlock } = splitBlockAtOffset({
          block: block,
          offset: focus.offset,
        })

        if (lastBlock) {
          frag.push({
            ...lastBlock,
            _id: fragmentId(lastBlock.type, block._id),
          })
        }
      }
    })
  }
  // add metadata
  frag = addBlockUIFields(frag)

  return frag
}

const mergeText = ({ a, b }: { a: Text; b: Text }): Text => {
  const mergedTextValue = a.textValue + b.textValue

  const mergedRanges = [
    ...a.ranges,
    ...b.ranges.map((r: Range) => ({
      ...r,
      offset: r.offset + a.textValue.length,
    })),
  ].filter(r => r.length > 0)

  const mergedText = {
    textValue: mergedTextValue,
    ranges: mergedRanges,
  }

  return mergedText
}

export const insertText = ({
  block,
  text,
  index,
}: {
  block: Block
  text: Text
  index: number
}): Block => {
  const splitBlock = splitBlockAtOffset({ block, offset: index })

  let mergedBlock
  if (splitBlock.before) {
    mergedBlock = {
      text: mergeText({
        a: splitBlock.before.text,
        b: text,
      }),
      type: 'ENTRY',
    }
  }

  if (splitBlock.after) {
    mergedBlock = {
      text: mergeText({
        a: mergedBlock ? mergedBlock.text : text,
        b: splitBlock.after.text,
      }),
      type: 'ENTRY',
    }
  }
  return mergedBlock
}

export const deleteBlocksAtSelection = ({
  state,
  draftState,
}: {
  state: EditorState
  draftState: EditorState
}) => {
  if (isSelectionCollapsed(draftState.selection)) {
    return
  }

  const { selection, blocks } = state
  const { anchor, focus } = sortSelection(selection)

  // check if selection is within a block
  // if so delete selection and merge block fragments
  if (focus.index === anchor.index) {
    let _newBlock
    const _currentBlock = blocks[anchor.index]
    // if selection spans over entire block, delete block contents
    if (focus.offset - anchor.offset === _currentBlock.text.textValue.length) {
      _newBlock = { text: { textValue: '', ranges: [] } }
    } else {
      // if not, split block at anchor offset if its not atomic
      const { before, after } = isAtomicInlineType(_currentBlock.type)
        ? {
            // reset block
            before: {
              text: { textValue: '', ranges: [] },
              type: 'ENTRY',
              _id: new ObjectId().toHexString(),
            },
            after: null,
          }
        : splitBlockAtOffset({
            block: _currentBlock,
            offset: anchor.offset,
          })

      let lastBlockFragment
      // if `after` exists, split `after` at focus offset - before block length
      if (after) {
        let { after: _lastBlockFragment } = splitBlockAtOffset({
          block: after,
          offset: focus.offset - anchor.offset,
        })
        lastBlockFragment = _lastBlockFragment
      }

      // take that result and merge it with `before` if `before` exists
      if (before && lastBlockFragment) {
        _newBlock = {
          text: mergeText({
            a: before.text,
            b: lastBlockFragment.text,
          }),
          type: 'ENTRY',
        }
      } else if (before) {
        _newBlock = before
      } else if (lastBlockFragment) {
        _newBlock = lastBlockFragment
      }
    }

    // replace block
    draftState.blocks[anchor.index] = {
      ...draftState.blocks[anchor.index],
      ..._newBlock,
    }
  } else {
    // if selection spans over multiple blocks

    const emptyBlock = { text: { textValue: '', ranges: [] } }

    // split focus and anchor block
    let _anchorBlock = blocks[anchor.index]
    let _focusBlock = blocks[focus.index]

    const _splitAnchorBlock = isAtomicInlineType(_anchorBlock.type)
      ? {
          before: {
            ...emptyBlock,
            type: 'ENTRY',
            _id: new ObjectId().toHexString(),
          },
          after: null,
        }
      : splitBlockAtOffset({
          block: _anchorBlock,
          offset: anchor.offset,
        })

    _anchorBlock = _splitAnchorBlock.before
      ? { ..._anchorBlock, ..._splitAnchorBlock.before }
      : {
          ..._anchorBlock,
          ...emptyBlock,
        }

    const _splitFocusBlock = splitBlockAtOffset({
      block: _focusBlock,
      offset: focus.offset,
    })

    _focusBlock = isAtomicInlineType(_focusBlock.type)
      ? _focusBlock
      : _splitFocusBlock.after
        ? { ..._focusBlock, ..._splitFocusBlock.after }
        : {
            ..._focusBlock,
            ...emptyBlock,
          }

    // replace blocks in the draftState
    draftState.blocks[anchor.index] = _anchorBlock
    draftState.blocks[focus.index] = _focusBlock

    const numberOfBlocksToRemove = focus.index - anchor.index - 1

    // remove all the the blocks in between the selection
    draftState.blocks.splice(anchor.index + 1, numberOfBlocksToRemove)
  }

  // replace selection in draft

  // set selection
  const _offset = anchor.offset
  const _index = anchor.index
  const _selection = {
    _id: draftState.selection._id,
    anchor: { offset: _offset, index: _index },
    focus: { offset: _offset, index: _index },
  }

  draftState.selection = _selection

  // TODO: create operation for this mutation

  draftState.operations.reloadAll = true
}

export const databyssFragToPlainText = (fragment: Block[]): string => {
  return fragment.reduce(
    (acc, curr) => acc + (acc.length ? '\n' : '') + curr.text.textValue,
    ''
  )
}

export const plainTextToDatabyssFrag = (text: string): Block[] => {
  const _frag = text.split('\n').map(f => ({
    text: { textValue: f, ranges: [] },
    type: 'ENTRY',
    _id: new ObjectId().toHexString(),
  }))
  return addBlockUIFields(_frag)
}

export const databyssFragToHtmlString = (frag: Block[]): string => {
  return stateToHTMLString(frag)
}

export const cutOrCopyEventHandler = (
  e: ClipboardEvent,
  fragment: Block[]
): void => {
  // set plain text
  e.clipboardData.setData('text/plain', databyssFragToPlainText(fragment))

  // set application data for clipboard
  e.clipboardData.setData(
    'application/x-databyss-frag',
    JSON.stringify(fragment)
  )

  // SET HTML
  e.clipboardData.setData('text/html', databyssFragToHtmlString(fragment))
}

export const pasteEventHandler = (e: ClipboardEvent): Block[] | null => {
  // databyss paste fragment
  const databyssDataTransfer = e.clipboardData.getData(
    'application/x-databyss-frag'
  )

  if (databyssDataTransfer) {
    let data = JSON.parse(databyssDataTransfer)
    data = resetIds(data)
    return data
  }

  // plaintext text fragment
  const plainTextDataTransfer = e.clipboardData.getData('text/plain')

  if (plainTextDataTransfer) {
    const data = plainTextToDatabyssFrag(plainTextDataTransfer)
    return data
  }

  // TODO: HTML paste fragment

  return null
}
