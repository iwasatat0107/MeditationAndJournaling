import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  pgEnum,
  integer,
  boolean,
  date,
  unique,
  index,
} from 'drizzle-orm/pg-core';

// Enums
export const authProviderEnum = pgEnum('auth_provider', ['email', 'google']);
export const planTypeEnum = pgEnum('plan_type', ['free', 'premium']);
export const sessionTypeEnum = pgEnum('session_type', ['meditation', 'journaling']);
export const themeEnum = pgEnum('theme', ['light', 'dark', 'system']);
export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'active',
  'canceled',
  'expired',
]);

// Users table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  displayName: varchar('display_name', { length: 100 }),
  authProvider: authProviderEnum('auth_provider').notNull().default('email'),
  planType: planTypeEnum('plan_type').notNull().default('free'),
  timezone: varchar('timezone', { length: 50 }).default('Asia/Tokyo'),
  locale: varchar('locale', { length: 10 }).default('ja'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Sessions table
export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: sessionTypeEnum('type').notNull(),
    duration: integer('duration').notNull(), // 秒数
    pagesCompleted: integer('pages_completed'), // journaling用
    completedAt: timestamp('completed_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdCompletedAtIdx: index('sessions_user_id_completed_at_idx').on(
      table.userId,
      table.completedAt
    ),
  })
);

// User Settings table
export const userSettings = pgTable('user_settings', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  meditationDuration: integer('meditation_duration').notNull().default(5), // 分: 2,5,7,10,15
  journalingDuration: integer('journaling_duration').notNull().default(120), // 秒: 60,120,300,420,600
  journalingBreakDuration: integer('journaling_break_duration').notNull().default(10), // 秒: 5,10,15
  theme: themeEnum('theme').notNull().default('system'),
  notificationsEnabled: boolean('notifications_enabled').notNull().default(false),
  soundEnabled: boolean('sound_enabled').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Daily Stats table
export const dailyStats = pgTable(
  'daily_stats',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    statDate: date('stat_date').notNull(),
    meditationCount: integer('meditation_count').notNull().default(0),
    journalingCount: integer('journaling_count').notNull().default(0),
    totalDuration: integer('total_duration').notNull().default(0), // 秒数
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdStatDateUnique: unique('daily_stats_user_id_stat_date_unique').on(
      table.userId,
      table.statDate
    ),
    userIdStatDateIdx: index('daily_stats_user_id_stat_date_idx').on(
      table.userId,
      table.statDate
    ),
  })
);

// Subscriptions table (将来のプレミアム機能用)
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  planType: varchar('plan_type', { length: 50 }).notNull(), // 'premium_monthly' | 'premium_yearly'
  status: subscriptionStatusEnum('status').notNull().default('active'),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Types (TypeScriptの型として利用)
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type UserSettings = typeof userSettings.$inferSelect;
export type NewUserSettings = typeof userSettings.$inferInsert;

export type DailyStats = typeof dailyStats.$inferSelect;
export type NewDailyStats = typeof dailyStats.$inferInsert;

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
