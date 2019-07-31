import colors from './colors'
import responsive from './responsive'
import space from './space'

import fonts, { EM } from './fonts'

export { EM }

export default {
  /* layout */
  mobileWidth: '600px',
  desktopWidth: '1024px',
  maxPageWidth: '1024px',
  contentWidth: '500px',

  /* space */
  ...space,

  /* fonts */
  ...fonts,

  /* colors */
  ...colors,

  /* responsive */
  ...responsive,

  /* transitions */
  slow: '800ms',
  medium: '500ms',
  quick: '300ms',
  superQuick: '100ms',
  ease: 'ease-in-out',
  touchDecayDuration: 800,

  /* shadows */
  lightShadow:
    '0px 1px 3px 0px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 2px 1px -1px rgba(0, 0, 0, 0.12)',

  /* border radius */
  borderRadius: '3px',

  zIndex: {
    modalOverlay: 200,
  },
}