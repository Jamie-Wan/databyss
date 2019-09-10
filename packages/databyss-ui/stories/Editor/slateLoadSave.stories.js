import React, { useEffect } from 'react'
import { storiesOf } from '@storybook/react'
import { View, Button, Text } from '@databyss-org/ui/primitives'
import Grid from '@databyss-org/ui/components/Grid/Grid'
import EditorProvider, {
  useEditorContext,
} from '@databyss-org/ui/components/Editor/EditorProvider'
import PageProvider, {
  usePageContext,
} from '@databyss-org/services/pages/PageProvider'

import {
  loadPage,
  savePage,
  seedPage,
  getPages,
} from '@databyss-org/services/pages/actions'
import { initialState } from '@databyss-org/services/pages/reducer'

import SlateContentEditable from '@databyss-org/ui/components/Editor/slate/ContentEditable'
import slateReducer from '@databyss-org/ui/components/Editor/slate/reducer'
import EditorPage from '@databyss-org/ui/components/Editor/EditorPage'
import AutoSave from '@databyss-org/ui/components/Editor/AutoSave'
import seedState from './_seedState'
import { ViewportDecorator } from '../decorators'

const ToolbarDemo = () => {
  const [state] = useEditorContext()
  const [, dispatchPage] = usePageContext()

  return (
    <Grid mb="medium">
      <View>
        <Button onPress={() => dispatchPage(savePage(state))}>SAVE</Button>
      </View>
    </Grid>
  )
}

const Box = ({ children }) => (
  <View borderVariant="thinDark" paddingVariant="tiny" width="100%">
    {children}
  </View>
)

const EditorLoader = ({ children }) => {
  const [state, dispatch] = usePageContext()
  useEffect(
    () => {
      dispatch(getPages())
    },
    [dispatch]
  )

  const pages = state.pages.map(p => (
    <View key={p._id}>
      <Button onPress={() => dispatch(loadPage(p._id))}>
        load page {p._id}
      </Button>
    </View>
  ))

  return state.isLoading ? (
    <View mb="medium">
      <View>
        <Button onPress={() => dispatch(seedPage(seedState))}>SEED</Button>
      </View>
      {pages}
      <Text> is Loading </Text>
    </View>
  ) : (
    <EditorProvider
      initialState={state.pageState}
      editableReducer={slateReducer}
    >
      <AutoSave />
      {children}
    </EditorProvider>
  )
}

const ProviderDecorator = storyFn => (
  <PageProvider initialState={initialState}>
    <EditorLoader>{storyFn()}</EditorLoader>
  </PageProvider>
)

storiesOf('Editor//Save and Load', module)
  .addDecorator(ProviderDecorator)
  .addDecorator(ViewportDecorator)
  .add('Slate Load and Save', () => (
    <View>
      <ToolbarDemo />
      <Box>
        <EditorPage>
          <SlateContentEditable />
        </EditorPage>
      </Box>
    </View>
  ))
