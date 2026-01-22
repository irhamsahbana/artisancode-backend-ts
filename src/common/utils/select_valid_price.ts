type PriceWithDates =
  | { startedAt: Date | string; endedAt?: Date | string | null }
  | { started_at: Date | string; ended_at?: Date | string | null }

export function selectValidPrice<T extends PriceWithDates>(
  prices: T[],
  date: Date = new Date(),
): T | undefined {
  return prices.find((p) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const startVal = 'startedAt' in p ? p.startedAt : (p as any).started_at
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const endVal = 'endedAt' in p ? p.endedAt : (p as any).ended_at

    const start = new Date(startVal)
    const end = endVal ? new Date(endVal) : null

    return start <= date && (end === null || end >= date)
  })
}
