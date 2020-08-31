export const createSidebarListItems = ({
  text,
  type,
  route,
  params,
  id,
  icon,
}) =>
  // {
  // text: string,
  // type: 'sources' | 'authors' | 'topics' | 'pages',
  // route: '/sources' | '/sources/authors' | '/pages' | '/topics',
  // params: string,
  // id: number | string,
  // icon: React.ReactNode,
  // }
  ({
    text,
    type,
    route,
    params,
    id,
    icon,
  })

export const createIndexPageEntries = ({
  text,
  type,
  id,
  citations,
  ...others
}) =>
  // {
  //   text: string,
  //   type: 'sources' | 'authors' | 'topics' | 'pages',
  //   id: number | string,
  // }
  ({
    text,
    type,
    citations,
    id,
    ...others,
  })

export const sortEntriesAtoZ = (entries, sortBy) =>
  entries?.sort(
    (a, b) => (a[sortBy]?.toLowerCase() > b[sortBy]?.toLowerCase() ? 1 : -1)
  )

export const filterEntries = (entries, filterQuery) => {
  const findEntry = query => entry =>
    query
      .split(' ')
      .reduce(
        (qacc, qcurr) =>
          Boolean(qacc && entry.text.match(new RegExp(`\\b${qcurr}`, 'i'))),
        true
      )
  return entries.filter(findEntry(filterQuery.textValue))
}
