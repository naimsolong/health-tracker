import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { users } from './users'

export const userFiles = sqliteTable('user_files', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  r2Key: text('r2_key').notNull(),
  filename: text('filename').notNull(),
  fileSize: integer('file_size'),
  mimeType: text('mime_type'),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
})
