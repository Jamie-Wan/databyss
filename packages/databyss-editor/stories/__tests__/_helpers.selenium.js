import { Key, By, until } from 'selenium-webdriver'

const waitUntilTime = 20000

const SLEEP_TIME = 500

// HACK: saucelabs environment double triggers meta key, use ctrl key instead

const CONTROL = process.env.SAUCE !== 'no' ? Key.CONTROL : Key.META

export const sleep = m => new Promise(r => setTimeout(r, m))

export const getEditor = async driver => {
  const el = await driver.wait(
    until.elementLocated(By.tagName('[contenteditable="true"]')),
    waitUntilTime
  )

  const _driver = await driver.wait(until.elementIsVisible(el), waitUntilTime)
  return _driver
}

export const getElementByTag = async (driver, tag) => {
  const el = await driver.wait(
    until.elementLocated(By.tagName(tag)),
    waitUntilTime
  )

  const _driver = await driver.wait(until.elementIsVisible(el), waitUntilTime)
  return _driver
}

export const getElementById = async (driver, id) => {
  const el = await driver.wait(until.elementLocated(By.id(id)), waitUntilTime)

  const _driver = await driver.wait(until.elementIsVisible(el), waitUntilTime)
  return _driver
}

export const toggleBold = actions =>
  actions
    .keyDown(CONTROL)
    .sendKeys('b')
    .keyUp(CONTROL)

export const toggleItalic = actions =>
  actions
    .keyDown(CONTROL)
    .sendKeys('i')
    .keyUp(CONTROL)

export const toggleLocation = actions =>
  actions
    .keyDown(CONTROL)
    .sendKeys('k')
    .keyUp(CONTROL)

export const singleHighlight = actions => {
  actions
    .keyDown(Key.SHIFT)
    .sendKeys(Key.ARROW_RIGHT)
    .keyUp(Key.SHIFT)
}

const navigationActionsBuilder = async (actions, key) => {
  await actions.sendKeys(key)
  await actions.perform()
  await actions.clear()
  await sleep(SLEEP_TIME)
}

export const enterKey = async actions => {
  await navigationActionsBuilder(actions, Key.ENTER)
}

export const upKey = async actions => {
  await navigationActionsBuilder(actions, Key.ARROW_UP)
}

export const tabKey = async actions => {
  await navigationActionsBuilder(actions, '\t')
}

export const downKey = async actions => {
  await navigationActionsBuilder(actions, Key.ARROW_DOWN)
}

export const backspaceKey = async actions => {
  await navigationActionsBuilder(actions, Key.BACK_SPACE)
}

export const selectAll = async actions => {
  await actions
    .keyDown(CONTROL)
    .sendKeys('a')
    .keyUp(CONTROL)
    .perform()
  await actions.clear()
  await sleep(SLEEP_TIME)
}

export const copy = async actions => {
  await actions
    .keyDown(CONTROL)
    .sendKeys('c')
    .keyUp(CONTROL)
    .perform()
  await actions.clear()
  await sleep(SLEEP_TIME)
}

export const paste = async actions => {
  await actions
    .keyDown(CONTROL)
    .sendKeys('v')
    .keyUp(CONTROL)
    .perform()
  await actions.clear()
  await sleep(SLEEP_TIME)
}

export const upShiftKey = async actions => {
  await actions
    .keyDown(Key.SHIFT)
    .sendKeys(Key.ARROW_UP)
    .keyUp(Key.SHIFT)
    .perform()

  await actions.clear()
  await sleep(SLEEP_TIME)
}

export const rightShiftKey = async actions => {
  await actions
    .keyDown(Key.SHIFT)
    .sendKeys(Key.ARROW_RIGHT)
    .keyUp(Key.SHIFT)
    .perform()

  await actions.clear()
  await sleep(SLEEP_TIME)
}
