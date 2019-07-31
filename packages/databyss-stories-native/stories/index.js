import { storiesOf } from '@storybook/react-native'
import Typography from '@databyss-org/ui/stories/Styleguides/Typography'
import { ThemeDecorator, ContentDecorator } from './decorators'

storiesOf('Styleguides', module)
  .addDecorator(ThemeDecorator)
  .addDecorator(ContentDecorator)
  .add('Typography', Typography)
