export interface ScanItem {
  $id: string
  $collectionId: string
  $databaseId: string
  $permissions: string[]
  $createdAt: string
  $updatedAt: string
  "file-id": string
  "final-url": string
  "input-url": string
  status: string
  started: string
  finished: string
  "scan-id": string
  htmlfiles: [string]
  error?: string
}
