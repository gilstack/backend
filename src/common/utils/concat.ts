export const concatStr = (strings: (number | string)[], divider?: string): string =>
  strings.join(divider ?? ' ')
