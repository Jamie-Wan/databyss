import {
  SourceCitationHeader,
  BlockType,
} from '@databyss-org/services/interfaces'
import { ResourceNotFoundError } from '@databyss-org/services/interfaces/Errors'
import { DocumentType } from '../../interfaces'
import { findOne, findAll } from '../../utils'

const getSource = async (
  _id: string
): Promise<SourceCitationHeader | ResourceNotFoundError> => {
  // get source and pages source exists in

  const _source: SourceCitationHeader = await findOne(DocumentType.Block, {
    _id,
    type: BlockType.Source,
  })

  if (!_source) {
    return new ResourceNotFoundError('source not found')
  }

  if (!_source || _source.type !== BlockType.Source) {
    return new ResourceNotFoundError()
  }

  const isInPages: string[] = []
  // returns all pages where source id is found in element id
  const _pageResponse = await findAll(DocumentType.Page, {
    blocks: {
      $elemMatch: {
        _id,
      },
    },
  })

  if (_pageResponse.length) {
    _pageResponse.forEach((d) => {
      if (!d.archive) {
        isInPages.push(d._id)
      }
    })
  }
  _source.isInPages = isInPages

  return _source
}

export default getSource