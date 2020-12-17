import { PatchBatch } from '../../interfaces/Patch'
import { DbPage } from '../interfaces'
import { db } from '../db'
import { runPatches } from './lib'

const savePatchData = async (data: PatchBatch) => {
  const { patches, id } = data
  const _page: DbPage = await db.get(id)
  if (!patches) {
    return
  }
  for (const patch of patches) {
    await runPatches(patch, _page)
  }
  // save page
  await db.upsert(_page._id, () => _page)
}

export default savePatchData