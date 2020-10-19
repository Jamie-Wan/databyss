import { createContext, useContextSelector } from 'use-context-selector'
import { debounce } from 'lodash'
import MurmurHash3 from 'imurmurhash'
import React, { useCallback } from 'react'
import createReducer from '@databyss-org/services/lib/createReducer'
import { SourceDetail } from '../interfaces'
import { CitationDTO, processCitation } from './actions'
import { CitationFormatOptions } from '.'
import CitationProcessStatus from './constants/CitationProcessStatus'
import reducer from './reducer'

interface PropsType {
  children: JSX.Element
}

interface ContextType {
  generateCitation: (
    source: SourceDetail,
    options: CitationFormatOptions
  ) => String
}

const useReducer = createReducer()

export const CitationContext = createContext<ContextType | null>(null)
export const citationUpdateCooldown = 1500

const generateHash = (source: SourceDetail, options: CitationFormatOptions) => {
  const str = JSON.stringify({
    source,
    options,
  })
  return MurmurHash3(str).result()
}

const CitationProvider: React.FunctionComponent<PropsType> = (
  props: PropsType
) => {
  const [state, dispatch] = useReducer(
    reducer,
    {
      status: CitationProcessStatus.IDLE,
      errorCount: 0,
      queue: {
        current: null,
        next: null,
      },
      citationCache: {},
    },
    { name: 'CitationProvider' }
  )

  const debouncedProcessCitation = useCallback(
    debounce((data: CitationDTO, hash: String) => {
      console.info('--- CitationProvider.debouncedProcessCitation ---')
      dispatch(processCitation(data, hash))
      return null
    }, citationUpdateCooldown),
    [state.citationCache]
  )

  const generateCitation = useCallback(
    (source: SourceDetail, options: CitationFormatOptions) => {
      console.info('--- CitationProvider.generateCitation ---')

      const hash = generateHash(source, options)
      if (state.citationCache[hash]) {
        return state.citationCache[hash]
      }

      return debouncedProcessCitation({ source, options }, hash)
    },
    [state]
  )

  return (
    <CitationContext.Provider
      value={{
        generateCitation,
      }}
    >
      {props.children}
    </CitationContext.Provider>
  )
}

export const useCitationContext = (selector = x => x) =>
  useContextSelector(CitationContext, selector)

export default CitationProvider
