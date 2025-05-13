import { UAParser } from 'ua-parser-js'

export function parseUserAgent(userAgent: string) {
  const parser = new UAParser(userAgent)
  const result = parser.getResult()

  return {
    browser: result.browser.name,
    deviceName: result.device.model || result.device.type,
    deviceOs: result.os.name,
    osVersion: result.os.version,
    browserVersion: result.browser.version
  }
}
