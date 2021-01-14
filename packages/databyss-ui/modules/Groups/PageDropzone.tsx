import React, { useCallback } from 'react'
import {
  DraggableItem,
  Text,
  View,
  List,
  ScrollView,
  ScrollViewProps,
  Icon,
  BaseControl,
  Separator,
} from '@databyss-org/ui/primitives'
import { PageHeader } from '@databyss-org/services/interfaces'
import { SidebarListRow } from '@databyss-org/ui/components'
import PageSvg from '@databyss-org/ui/assets/page.svg'
import CloseSvg from '@databyss-org/ui/assets/close.svg'

interface PageDropzoneProps extends ScrollViewProps {
  value?: PageHeader[]
  onChange?: (value: PageHeader[]) => void
}

export const PageDropzone = ({
  value,
  onChange,
  ...others
}: PageDropzoneProps) => {
  const onDrop = useCallback(
    (item: DraggableItem) => {
      const _pageHeader = item.payload as PageHeader
      onChange!(value!.concat(_pageHeader))
    },
    [onChange]
  )
  const onRemove = (page: PageHeader) => {
    onChange!(value!.filter((p) => p._id !== page._id))
  }

  return (
    <ScrollView shadowOnScroll {...others}>
      <List
        height="100%"
        dropzone={{
          accepts: 'PAGE',
          onDrop,
        }}
        py="small"
      >
        {value!.length ? (
          <>
            {value!.map((page) => (
              <SidebarListRow
                key={page._id}
                text={page.name}
                isActive
                icon={<PageSvg />}
              >
                <BaseControl onPress={() => onRemove(page)}>
                  <Icon sizeVariant="tiny">
                    <CloseSvg />
                  </Icon>
                </BaseControl>
              </SidebarListRow>
            ))}
            {value!.length === 1 && (
              <View pl="em" pt="none" pr="medium">
                <Separator spacing="small" color="text.3" />
                <Text variant="uiTextSmall" mb="em" mt="small" color="text.2">
                  To remove a page from this collection, click the ‘X’.
                </Text>
                <Text variant="uiTextSmall" color="text.2">
                  This will not remove it from its original collection.
                </Text>
              </View>
            )}
          </>
        ) : (
          <View pl="em" pr="medium" py="small">
            <Text variant="uiTextSmall" mb="em" color="text.2">
              Drag pages here from the sidebar to add them to this collection.
            </Text>
            <Text variant="uiTextSmall" color="text.2">
              Note that this does not remove them from their original
              collections.
            </Text>
          </View>
        )}
      </List>
    </ScrollView>
  )
}
