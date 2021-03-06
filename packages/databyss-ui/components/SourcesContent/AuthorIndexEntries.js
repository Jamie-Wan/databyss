import React from 'react'

import { BaseControl, RawHtml, Text, View } from '@databyss-org/ui/primitives'
import { stateBlockToHtml } from '@databyss-org/editor/lib/slateUtils'

const AuthorIndexEntries = ({ entries, onClick }) => {
  const render = () =>
    entries.map((entry, index) => {
      if (entry.text) {
        return (
          <View key={index} mb="em" px="medium" widthVariant="content">
            <BaseControl
              data-test-element="source-results"
              onClick={() => {
                if (onClick) {
                  onClick(entry)
                }
              }}
              py="small"
              hoverColor="background.2"
              activeColor="background.3"
              userSelect="auto"
              childViewProps={{ flexDirection: 'row' }}
            >
              <Text variant="bodyNormalSemibold">
                <RawHtml html={stateBlockToHtml(entry)} />
              </Text>
            </BaseControl>
          </View>
        )
      }
      return null
    })

  return render()
}

export default AuthorIndexEntries
