import React from 'react'
import { ResourcePending } from './ResourcePending'

export { ResourcePending } from './ResourcePending'
export {
  NetworkUnavailableError,
  NotAuthorizedError,
  InsufficientPermissionError,
  ResourceNotFoundError,
  VersionConflictError,
  UnexpectedServerError,
} from './Errors'
export type { PageHeader } from './Page'
export { Page } from './Page'
export type { Point } from './Point'
export type { Selection } from './Selection'
export { Text } from './Text'
export type {
  Source,
  SourceDetail,
  Author,
  Topic,
  SourceCitationHeader,
  BlockRelation,
  Block,
  BlockReference,
  BlockRelationsServerResponse,
} from './Block'
export type { Document, DocumentDict } from './Document'
export { BlockType } from './Block'
export type { FSA } from './FSA'
export { RangeType } from './Range'
export type { Range } from './Range'
export type { PageState } from './PageState'
export type { PatchBatch } from './Patch'
export type { SourceState } from './SourceState'
export type { TopicState } from './TopicState'
export type {
  CatalogState,
  CatalogResult,
  GroupedCatalogResults,
  CatalogService,
} from './CatalogState'
export { CatalogType } from './CatalogState'
export type {
  CitationFormatOptions,
  CitationDTO,
  CitationProcessOptions,
} from './Citation'
export type ResourceResponse<T> = T | ResourcePending | Error | null
export interface CacheDict<T> {
  [key: string]: ResourceResponse<T>
}
export type NullableCache<T> = ResourceResponse<CacheDict<T>>
export type CacheList<T> = ResourceResponse<T[]>
export interface RefDict {
  [key: string]: React.Ref<HTMLInputElement>
}

export type { EntryState } from './EntryState'
export type { GroupHeader } from './Group'
export { Group, GroupState } from './Group'
