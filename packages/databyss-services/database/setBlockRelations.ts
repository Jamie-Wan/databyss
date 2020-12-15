import ObjectId from 'bson-objectid'
import { db } from './db'
import { DocumentType } from './interfaces'

const setPouchBlockRelations = async (payloadArray) => {
  for (const payload of payloadArray) {
    const { blocksRelationArray, clearPageRelationships } = payload

    // clear all block relationships associated to page id
    if (clearPageRelationships) {
      const _blockRelationsToClear = await db.find({
        selector: {
          documentType: DocumentType.BlockRelation,
          page: clearPageRelationships,
        },
      })
      const _idsToDelete = _blockRelationsToClear.docs.map((r) => ({
        _id: r._id,
        _rev: r._rev,
      }))

      await db.bulkDocs(
        _idsToDelete.map((i) => ({ _id: i._id, _rev: i._rev, _deleted: true }))
      )
    }
    if (blocksRelationArray.length) {
      for (const relationship of blocksRelationArray) {
        const { block, relatedBlock, removeBlock } = relationship

        const _blockRelationResults = await db.find({
          selector: {
            block,
            relatedBlock,
          },
        })
        const _blockRelation = _blockRelationResults.docs[0]
        if (removeBlock && _blockRelation) {
          // get blockID
          await db.upsert(_blockRelation._id, () => ({ _deleted: true }))
        } else if (_blockRelation) {
          // update block relation
          await db.upsert(_blockRelation._id, (oldDoc) => ({
            ...oldDoc,
            ...relationship,
          }))
        } else {
          // create a new block relation
          await db.put({
            documentType: DocumentType.BlockRelation,
            _id: new ObjectId().toHexString(),
            block,
            relatedBlock,
            ...relationship,
          })
        }
      }
    }
  }
}

export default setPouchBlockRelations
