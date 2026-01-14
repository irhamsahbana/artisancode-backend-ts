export interface PaginationQuery {
  page?: number
  per_page?: number
}

export interface PaginationMetadata {
  total: number
  page: number
  per_page: number
  last_page: number
}
