import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { users } from './users'

export const userMedicalProfile = sqliteTable('user_medical_profile', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  height: real('height'),
  bloodType: text('blood_type'),
  dateOfBirth: text('date_of_birth'),
  biologicalSex: text('biological_sex'),
  smokingStatus: text('smoking_status'),
  alcoholUse: text('alcohol_use'),
  allergies: text('allergies'),
  chronicConditions: text('chronic_conditions'),
  currentMedications: text('current_medications'),
  familyHistory: text('family_history'),
  notes: text('notes'),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').notNull().default('CURRENT_TIMESTAMP'),
})
