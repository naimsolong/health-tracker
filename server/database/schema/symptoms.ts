import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { users } from './users'

export const symptomsLog = sqliteTable('symptoms_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  loggedAt: text('logged_at').notNull(),
  date: text('date').notNull(),
  symptom: text('symptom').notNull(),
  severity: integer('severity'),
  durationMin: integer('duration_min'),
  notes: text('notes'),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
})

export const COMMON_SYMPTOMS = [
  'Headache',
  'Fatigue',
  'Fever',
  'Cough',
  'Shortness of breath',
  'Chest pain',
  'Nausea',
  'Vomiting',
  'Diarrhea',
  'Abdominal pain',
  'Back pain',
  'Joint pain',
  'Muscle aches',
  'Dizziness',
  'Insomnia',
  'Anxiety',
  'Swelling',
  'Rash',
  'Sore throat',
  'Runny nose',
] as const
