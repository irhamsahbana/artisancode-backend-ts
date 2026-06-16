export function buildUrl(
  baseUrl: string,
  path: string,
  query?: Record<string, string | number | boolean | undefined | null>,
): string {
  // Ensure baseUrl ends with / and path doesn't start with /
  // so URL constructor joins them correctly
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  const url = new URL(cleanPath, base)

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value != null) {
        url.searchParams.set(key, String(value))
      }
    }
  }

  return url.toString()
}
