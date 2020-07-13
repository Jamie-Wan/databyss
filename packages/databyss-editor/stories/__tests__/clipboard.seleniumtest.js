/** @jsx h */
/* eslint-disable func-names */
import { Key } from 'selenium-webdriver'
import assert from 'assert'
import { startSession, WIN, CHROME } from '@databyss-org/ui/lib/saucelabs'
import { jsx as h } from './hyperscript'
import { sanitizeEditorChildren } from './__helpers'
import {
  getEditor,
  getElementByTag,
  sleep,
  toggleBold,
  getElementById,
  enterKey,
  upKey,
  downKey,
  paste,
  copy,
  selectAll,
  upShiftKey,
  rightShiftKey,
} from './_helpers.selenium'

let driver
let editor
let slateDocument
let actions
const LOCAL_URL = 'http://localhost:6006/iframe.html?id=services-auth--login'
const PROXY_URL = 'http://0.0.0.0:8080/iframe.html?id=services-auth--login'

const LOCAL_URL_EDITOR =
  'http://localhost:6006/iframe.html?id=services-page--slate-5'
const PROXY_URL_EDITOR =
  'http://0.0.0.0:8080/iframe.html?id=services-page--slate-5'

const random = Math.random()
  .toString(36)
  .substring(7)

describe('editor clipboard', () => {
  beforeEach(async done => {
    // OSX and safari are necessary
    driver = await startSession('Slate-5-clipboard', WIN, CHROME)
    await driver.get(process.env.LOCAL_ENV ? LOCAL_URL : PROXY_URL)

    const emailField = await getElementByTag(driver, '[data-test-path="email"]')
    await emailField.sendKeys(`${random}@test.com`)

    let continueButton = await getElementByTag(
      driver,
      '[data-test-id="continueButton"]'
    )
    await continueButton.click()

    const codeField = await getElementByTag(driver, '[data-test-path="code"]')
    await codeField.sendKeys('test-code-42')

    continueButton = await getElementByTag(
      driver,
      '[data-test-id="continueButton"]'
    )
    await continueButton.click()

    await getElementByTag(driver, '[data-test-id="logoutButton"]')

    await driver.get(
      process.env.LOCAL_ENV ? LOCAL_URL_EDITOR : PROXY_URL_EDITOR
    )

    editor = await getEditor(driver)

    editor.click()

    actions = driver.actions({ bridge: true })
    await actions.click(editor)

    //   actions = driver.actions()

    done()
  })

  afterEach(async () => {
    const clearButton = await getElementById(driver, 'clear-state')
    await clearButton.click()
    await driver.navigate().refresh()

    // sleep(500)
    await driver.quit()
  })

  it('should copy a whole block and paste it at the end of the same block', async () => {
    // TODO: FIX CURSOR POSITION FOR THIS TEST
    await sleep(300)
    await actions.sendKeys('this text will be pasted with ')

    await toggleBold(actions)
    await actions.sendKeys('bold ')
    await selectAll(actions)

    await copy(actions)

    await actions.sendKeys(Key.ARROW_RIGHT)
    await paste(actions)
    //  await actions.perform()
    await sleep(3000)

    await driver.navigate().refresh()

    await sleep(500)

    slateDocument = await getElementById(driver, 'slateDocument')

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="ENTRY">
          <text>this text will be pasted with </text>
          <text bold>
            bold <cursor />
          </text>
          <text>this text will be pasted with </text>
          <text bold>bold </text>
        </block>
      </editor>
    )

    assert.deepEqual(
      sanitizeEditorChildren(actual.children),
      sanitizeEditorChildren(expected.children)
    )

    assert.deepEqual(actual.selection, expected.selection)
  })

  it('should copy a whole block and paste it in the middle of a block', async () => {
    await sleep(300)
    await actions.sendKeys('this text will be pasted with ')
    await toggleBold(actions)
    await actions.sendKeys('bold ')
    await selectAll(actions)

    await copy(actions)

    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.sendKeys(Key.ARROW_RIGHT)
    await actions.sendKeys(Key.ARROW_RIGHT)
    await actions.sendKeys(Key.ARROW_RIGHT)
    await actions.sendKeys(Key.ARROW_RIGHT)
    await actions.sendKeys(Key.ARROW_RIGHT)

    await paste(actions)
    //  await actions.perform()
    await sleep(3000)

    await driver.navigate().refresh()

    await sleep(500)

    slateDocument = await getElementById(driver, 'slateDocument')

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="ENTRY">
          <text>
            this <cursor />this text will be pasted with{' '}
          </text>
          <text bold>bold </text>
          <text>text will be pasted with </text>
          <text bold>bold </text>
        </block>
      </editor>
    )

    assert.deepEqual(
      sanitizeEditorChildren(actual.children),
      sanitizeEditorChildren(expected.children)
    )

    assert.deepEqual(actual.selection, expected.selection)
  })

  it('should copy a whole block and paste it at the start of a block', async () => {
    await sleep(300)
    await actions.sendKeys('this text will be pasted with ')
    await toggleBold(actions)
    await actions.sendKeys('bold ')
    await selectAll(actions)

    await copy(actions)

    await actions.sendKeys(Key.ARROW_LEFT)
    await paste(actions)
    //  await actions.perform()
    await sleep(3000)

    await driver.navigate().refresh()

    await sleep(500)

    slateDocument = await getElementById(driver, 'slateDocument')

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="ENTRY">
          <text>
            <cursor />
            this text will be pasted with{' '}
          </text>
          <text bold>bold </text>
          <text>this text will be pasted with </text>
          <text bold>bold </text>
        </block>
      </editor>
    )

    assert.deepEqual(
      sanitizeEditorChildren(actual.children),
      sanitizeEditorChildren(expected.children)
    )

    assert.deepEqual(actual.selection, expected.selection)
  })

  it('should copy two entry fragments and paste them within an entry', async () => {
    await sleep(3000)
    await actions.sendKeys('this is a test')
    await enterKey(actions)
    await enterKey(actions)
    await actions.sendKeys('within the second block')
    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.perform()
    await actions.clear()

    await upShiftKey(actions)
    await upShiftKey(actions)
    await rightShiftKey(actions)
    await rightShiftKey(actions)
    await rightShiftKey(actions)
    await rightShiftKey(actions)
    await rightShiftKey(actions)

    await copy(actions)
    await downKey(actions)
    await downKey(actions)

    await enterKey(actions)
    await enterKey(actions)
    await actions.sendKeys('this is the third block')
    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.sendKeys(Key.ARROW_LEFT)

    await paste(actions)

    await sleep(4000)

    await driver.navigate().refresh()

    await sleep(500)

    slateDocument = await getElementById(driver, 'slateDocument')

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="ENTRY">
          <text>this is a test</text>
        </block>
        <block type="ENTRY">
          <text>within the second block</text>
        </block>
        <block type="ENTRY">
          <text>
            this is the third <cursor />block
          </text>
        </block>
        <block type="ENTRY">
          <text>is a test</text>
        </block>
        <block type="ENTRY">
          <text>within the second </text>
        </block>
      </editor>
    )

    assert.deepEqual(
      sanitizeEditorChildren(actual.children),
      sanitizeEditorChildren(expected.children)
    )

    assert.deepEqual(actual.selection, expected.selection)
  })

  it('should copy an atomic block and maintain atomic id integrity', async () => {
    await sleep(3000)
    await actions.sendKeys('@this is a source test')
    await enterKey(actions)
    await upKey(actions)
    await rightShiftKey(actions)

    await copy(actions)
    await downKey(actions)
    await downKey(actions)
    await actions.sendKeys('some inbetween text')
    await enterKey(actions)
    await enterKey(actions)

    await paste(actions)

    const atomic = await getElementByTag(
      driver,
      '[data-test-atomic-edit="open"]'
    )

    await atomic.click()
    await atomic.click()

    await actions.sendKeys(' with appended text').perform()

    const doneButton = await getElementByTag(
      driver,
      '[data-test-dismiss-modal="true"]'
    )
    await doneButton.click()

    await sleep(1000)

    await driver.navigate().refresh()

    await sleep(5000)

    slateDocument = await getElementById(driver, 'slateDocument')

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="SOURCE">
          <text>this is a source test with appended text</text>
        </block>
        <block type="ENTRY">
          <text>some inbetween text</text>
        </block>
        <block type="SOURCE">
          <text>
            <cursor />this is a source test with appended text
          </text>
        </block>
      </editor>
    )

    assert.deepEqual(
      sanitizeEditorChildren(actual.children),
      sanitizeEditorChildren(expected.children)
    )

    assert.deepEqual(actual.selection, expected.selection)
  })
})
