import React, { useState, useEffect } from 'react'
import { View, List } from '@databyss-org/ui/primitives'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import PagesSvg from '@databyss-org/ui/assets/pages.svg'
import SearchSvg from '@databyss-org/ui/assets/search.svg'
import TopicSvg from '@databyss-org/ui/assets/topic.svg'
import SourceSvg from '@databyss-org/ui/assets/source.svg'
import MenuSvg from '@databyss-org/ui/assets/menu.svg'
import { pxUnits } from '@databyss-org/ui/theming/views'
import SidebarIconButton from '@databyss-org/ui/components/Sidebar/SidebarIconButton'
import Footer from '@databyss-org/ui/components/Sidebar/Footer'
import { darkTheme } from '../../theming/theme'
import { sidebar } from '../../theming/components'

export const defaultProps = {
  height: '100vh',
}

const SidebarCollapsed = () => {
  const {
    navigateSidebar,
    getTokensFromPath,
    getSidebarPath,
    isMenuOpen,
    setMenuOpen,
  } = useNavigationContext()
  const { isPublicAccount } = useSessionContext()

  const [activeItem, setActiveItem] = useState('pages')

  const onItemClick = item => {
    if (!isMenuOpen) {
      return (
        setMenuOpen(true) && navigateSidebar(`/${item}`) && setActiveItem(item)
      )
    }
    return activeItem === item
      ? setMenuOpen(!isMenuOpen)
      : navigateSidebar(`/${item}`) && setActiveItem(item)
  }

  useEffect(
    () =>
      setActiveItem(
        getSidebarPath() ? getSidebarPath() : getTokensFromPath().type
      ),
    [navigateSidebar]
  )

  let sideBarCollapsedItems = [
    {
      name: 'menuCollapse',
      title: 'Collapse menu',
      icon: <MenuSvg />,
      onClick: () => {
        setMenuOpen(!isMenuOpen)
      },
    },
    {
      name: 'search',
      title: 'Search',
      icon: <SearchSvg />,
      onClick: () => onItemClick('search'),
    },
    {
      name: 'pages',
      title: 'Pages',
      icon: <PagesSvg />,
      onClick: () => {
        onItemClick('pages')
      },
    },
    {
      name: 'sources',
      title: 'Sources',
      icon: <SourceSvg />,
      onClick: () => {
        onItemClick('sources')
      },
    },
    {
      name: 'topics',
      title: 'Topics',
      icon: <TopicSvg />,
      onClick: () => {
        onItemClick('topics')
      },
    },
  ]

  // if account is public, remove the pages icon
  if (isPublicAccount()) {
    sideBarCollapsedItems = sideBarCollapsedItems.filter(
      i => i.name !== 'pages'
    )
  }

  return (
    <View
      {...defaultProps}
      theme={darkTheme}
      bg="background.1"
      height="100vh"
      borderRightColor="border.1"
      borderRightWidth={pxUnits(1)}
      width={sidebar.collapsedWidth}
    >
      <List verticalItemPadding={2} horizontalItemPadding={1} m="none">
        {sideBarCollapsedItems.map(item => (
          <SidebarIconButton
            name={item.name}
            key={item.name}
            title={item.title}
            icon={item.icon}
            isActive={item.name === activeItem}
            onClick={item.onClick}
          />
        ))}
      </List>
      <Footer />
    </View>
  )
}

export default SidebarCollapsed
