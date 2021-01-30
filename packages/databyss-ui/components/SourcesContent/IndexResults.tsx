import React from 'react'
import { View, RawHtml } from '@databyss-org/ui/primitives'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import PageSvg from '@databyss-org/ui/assets/page.svg'
import {
  SearchResultsContainer,
  SearchResultTitle,
  SearchResultDetails,
} from '@databyss-org/ui/components/SearchContent/SearchResults'
import { slateBlockToHtmlWithSearch } from '@databyss-org/editor/lib/util'
import {
  useBlockRelations,
  useBlocks,
  usePages,
} from '@databyss-org/data/pouchdb/hooks'
import { BlockType } from '@databyss-org/editor/interfaces'
import { LoadingFallback } from '@databyss-org/ui/components'
import { groupBlockRelationsByPage } from '@databyss-org/services/blocks'

interface IndexResultsProps {
  blockType: BlockType
  relatedBlockId: string
}

export const IndexResults = ({
  blockType,
  relatedBlockId,
}: IndexResultsProps) => {
  const { navigate } = useNavigationContext()
  const blockRelationRes = useBlockRelations(blockType)
  const blocksRes = useBlocks(blockType)
  const pagesRes = usePages()
  const queryRes = [blockRelationRes, blocksRes, pagesRes]

  if (queryRes.some((q) => !q.isSuccess)) {
    return <LoadingFallback queryObserver={queryRes} />
  }

  const relations = Object.values(blockRelationRes.data!).filter(
    (_rel) => _rel.relatedBlock === relatedBlockId
  )

  const groupedRelations = groupBlockRelationsByPage(relations)

  const onPageClick = (pageId) => {
    // if topic has no blocks associated with it, page click should instead redirect to the topic in the page
    if (
      groupedRelations[pageId].length === 1 &&
      !groupedRelations[pageId][0].blockText.textValue.length
    ) {
      const _blockId = groupedRelations[pageId][0].relatedBlock
      navigate(`/pages/${pageId}#${_blockId}`)
    } else {
      navigate(`/pages/${pageId}`)
    }
  }

  const onEntryClick = (pageId, entryId) => {
    navigate(`/pages/${pageId}#${entryId}`)
  }

  const _results = Object.keys(groupedRelations)
    // filter out results for archived and missing pages
    .filter((r) => pagesRes.data![r] && !pagesRes.data![r].archive)
    // filter out results if no entries are included
    .filter((r) => groupedRelations[r].length)
    .map((r, i) => (
      <SearchResultsContainer key={i}>
        <SearchResultTitle
          key={`pageHeader-${i}`}
          onPress={() => onPageClick(r)}
          icon={<PageSvg />}
          text={pagesRes.data![r].name}
          dataTestElement="atomic-results"
        />

        {groupedRelations[r]
          .filter((e) => e.blockText.textValue.length)
          .map((e, k) => (
            <SearchResultDetails
              key={k}
              onPress={() => onEntryClick(r, e.block)}
              text={
                <RawHtml
                  html={slateBlockToHtmlWithSearch(blocksRes.data![e.block])}
                />
              }
              dataTestElement="atomic-result-item"
            />
          ))}
      </SearchResultsContainer>
    ))

  return <View px="medium">{_results}</View>
}
