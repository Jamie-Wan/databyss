import React from 'react'
import { Router } from '@reach/router'
import { sortEntriesAtoZ } from '@databyss-org/services/sources/util'
import { AuthorsLoader } from '@databyss-org/ui/components/Loaders'
import IndexPageEntries from '../PageContent/IndexPageEntries'
import IndexPageContent from '../PageContent/IndexPageContent'

export const AuthorsRouter = () => (
  <Router>
    <AuthorsContent path="/" />
  </Router>
)

const AuthorsContent = () => (
  <AuthorsLoader>
    {authors => {
      const authorData = Object.values(authors).map(value => {
        const firstName = value.firstName?.textValue
        const lastName = value.lastName?.textValue
        return {
          text: `${lastName}${firstName && `, ${firstName}`}`,
          type: 'authors',
        }
      })
      const sortedAuthors = sortEntriesAtoZ(authorData, 'text')

      return (
        <IndexPageContent title="All Authors">
          <IndexPageEntries entries={sortedAuthors} />
        </IndexPageContent>
      )
    }}
  </AuthorsLoader>
)

export default AuthorsContent
