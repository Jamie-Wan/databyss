import { db } from '../../db'
// import { DocumentType } from '../interfaces'
// import { ResourceNotFoundError } from '../../interfaces/Errors'
import { SourceCitationHeader, DocumentType } from '../../../interfaces'

const getSource = async (_id: string): Promise<SourceCitationHeader> => {
  // get source and pages source exists in
  const _source: SourceCitationHeader = await db.get(_id)

  // TODO: SHOULD THIS RETURN ERROR
  // if (!_source || _source.type !== BlockType.Source) {
  //   return new ResourceNotFoundError()
  // }

  const isInPages: string[] = []
  // returns all pages where source id is found in element id
  const _response = await db.find({
    selector: {
      documentType: DocumentType.Page,
      blocks: {
        $elemMatch: {
          _id,
        },
      },
    },
  })
  if (_response.docs.length) {
    _response.docs.forEach((d) => {
      if (!d.archive) {
        isInPages.push(d._id)
      }
    })
  }
  _source.isInPages = isInPages

  return _source
}

export default getSource
