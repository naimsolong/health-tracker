import { createError } from 'h3'

/**
 * Throws a 400 error if `value` is a string exceeding `max` characters.
 * Silently passes for null/undefined (field is optional).
 */
export function assertMaxLength(value: unknown, field: string, max: number): void {
  if (typeof value === 'string' && value.length > max) {
    throw createError({ statusCode: 400, message: `${field} must be ${max} characters or fewer` })
  }
}

/**
 * Throws a 400 error if `value` is not an integer within [min, max].
 * Returns the clamped integer for use in .limit() / .offset() calls.
 */
export function parseBoundedInt(value: unknown, defaultVal: number, min: number, max: number): number {
  const parsed = parseInt(String(value ?? defaultVal), 10)
  if (isNaN(parsed)) return defaultVal
  return Math.min(Math.max(parsed, min), max)
}
