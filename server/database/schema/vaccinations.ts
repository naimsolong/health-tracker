import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { users } from './users'

export const vaccinations = sqliteTable('vaccinations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  vaccineName: text('vaccine_name').notNull(),
  dateGiven: text('date_given').notNull(),
  doseNumber: integer('dose_number'),
  manufacturer: text('manufacturer'),
  lotNumber: text('lot_number'),
  administeredBy: text('administered_by'),
  nextDueDate: text('next_due_date'),
  notes: text('notes'),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
})

export const COMMON_VACCINES = [
  'Influenza (Flu)',
  'COVID-19',
  'COVID-19 Booster',
  'Tdap (Tetanus, Diphtheria, Pertussis)',
  'Hepatitis A',
  'Hepatitis B',
  'MMR (Measles, Mumps, Rubella)',
  'Varicella (Chickenpox)',
  'Pneumococcal (PPSV23)',
  'Shingrix (Shingles)',
  'HPV',
  'Meningococcal',
  'Typhoid',
  'Yellow Fever',
  'Rabies',
] as const
