import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { users } from './users'

export const labResults = sqliteTable('lab_results', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  testDate: text('test_date').notNull(),
  testCategory: text('test_category').notNull(),
  testName: text('test_name').notNull(),
  value: real('value').notNull(),
  unit: text('unit').notNull(),
  referenceLow: real('reference_low'),
  referenceHigh: real('reference_high'),
  labName: text('lab_name'),
  orderedBy: text('ordered_by'),
  notes: text('notes'),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').notNull().default('CURRENT_TIMESTAMP'),
})

// Controlled vocabulary for test categories and names
export const LAB_TESTS = {
  lipid_panel: {
    label: 'Lipid Panel',
    tests: [
      { name: 'cholesterol_total', label: 'Total Cholesterol', unit: 'mg/dL' },
      { name: 'ldl', label: 'LDL Cholesterol', unit: 'mg/dL' },
      { name: 'hdl', label: 'HDL Cholesterol', unit: 'mg/dL' },
      { name: 'triglycerides', label: 'Triglycerides', unit: 'mg/dL' },
    ],
  },
  metabolic: {
    label: 'Metabolic',
    tests: [
      { name: 'hba1c', label: 'HbA1c', unit: '%' },
      { name: 'glucose_fasting', label: 'Fasting Glucose', unit: 'mg/dL' },
      { name: 'creatinine', label: 'Creatinine', unit: 'mg/dL' },
      { name: 'egfr', label: 'eGFR', unit: 'mL/min/1.73m²' },
    ],
  },
  thyroid: {
    label: 'Thyroid',
    tests: [
      { name: 'tsh', label: 'TSH', unit: 'mIU/L' },
      { name: 't3_free', label: 'Free T3', unit: 'pg/mL' },
      { name: 't4_free', label: 'Free T4', unit: 'ng/dL' },
    ],
  },
  cbc: {
    label: 'Complete Blood Count',
    tests: [
      { name: 'hemoglobin', label: 'Hemoglobin', unit: 'g/dL' },
      { name: 'wbc', label: 'White Blood Cells', unit: '×10³/µL' },
      { name: 'platelets', label: 'Platelets', unit: '×10³/µL' },
      { name: 'hematocrit', label: 'Hematocrit', unit: '%' },
    ],
  },
  urinalysis: {
    label: 'Urinalysis',
    tests: [
      { name: 'urine_protein', label: 'Protein', unit: 'mg/dL' },
      { name: 'urine_glucose', label: 'Glucose', unit: 'mg/dL' },
      { name: 'urine_specific_gravity', label: 'Specific Gravity', unit: '' },
      { name: 'urine_ph', label: 'pH', unit: '' },
      { name: 'urine_blood', label: 'Blood', unit: 'scale 0-3' },
      { name: 'urine_ketones', label: 'Ketones', unit: 'mg/dL' },
    ],
  },
} as const
