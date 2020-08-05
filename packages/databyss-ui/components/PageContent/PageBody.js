import React, { useEffect, useCallback, useRef } from 'react'
import { throttle } from 'lodash'
import ContentEditable from '@databyss-org/editor/components/ContentEditable'
import EditorProvider from '@databyss-org/editor/state/EditorProvider'
import HistoryProvider from '@databyss-org/editor/history/EditorHistory'
import { withMetaData } from '@databyss-org/editor/lib/util'
import {
  pageToEditorState,
  cleanupPatches,
  addMetaToPatches,
} from '@databyss-org/editor/state/util'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { useNavigationContext } from '@databyss-org/ui'

const PageBody = ({
  page,
  focusIndex,
  onNavigateUpFromEditor,
  editorRef,
  onEditorPathChange,
}) => {
  const { location } = useNavigationContext()
  const clearBlockDict = usePageContext(c => c.clearBlockDict)
  const setPatches = usePageContext(c => c.setPatches)

  useEffect(() => () => clearBlockDict(), [])

  const patchQueue = useRef([])
  const pageState = useRef(null)
  const editorStateRef = useRef()

  // throttled autosave occurs every SAVE_PAGE_THROTTLE ms when changes are happening
  const throttledAutosave = useCallback(
    throttle(({ nextState, patches }) => {
      const _patches = cleanupPatches(patches)
      if (_patches.length) {
        const payload = {
          id: nextState.pageHeader._id,
          patches: patchQueue.current,
        }
        setPatches(payload)
        patchQueue.current = []
      }
    }, process.env.SAVE_PAGE_THROTTLE),
    []
  )

  // state from provider is out of date
  const onChange = value => {
    //  console.log(editorStateRef)
    if (editorStateRef.current?.pagePath) {
      requestAnimationFrame(() =>
        onEditorPathChange(editorStateRef.current.pagePath)
      )
    }

    pageState.current = value.nextState

    const patches = addMetaToPatches(value)
    // push changes to a queue
    patchQueue.current = patchQueue.current.concat(patches)
    throttledAutosave({ ...value, patches })
  }

  return (
    <HistoryProvider ref={editorStateRef}>
      <EditorProvider
        key={location.pathname}
        onChange={onChange}
        initialState={pageToEditorState(withMetaData(page))}
      >
        <ContentEditable
          autofocus
          focusIndex={focusIndex}
          onNavigateUpFromTop={onNavigateUpFromEditor}
          active={false}
          editorRef={editorRef}
        />
      </EditorProvider>
    </HistoryProvider>
  )
}

export default React.memo(
  PageBody,
  (prev, next) =>
    prev.page._id === next.page._id && prev.focusIndex === next.focusIndex
)
