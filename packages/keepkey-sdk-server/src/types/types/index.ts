export * as decimal from './decimal'
export * as hex from './hex'
export * as numeric from './numeric'

/**
 * @minLength 8
 * @minLength 90
 * @pattern ^[!-~]{1,83}1[02-9ac-hj-np-z]{6,}$
 * @format bech32
 */
export type Bech32 = string
