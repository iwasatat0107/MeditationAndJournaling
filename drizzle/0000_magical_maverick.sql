CREATE TYPE "public"."auth_provider" AS ENUM('email', 'google');--> statement-breakpoint
CREATE TYPE "public"."plan_type" AS ENUM('free', 'premium');--> statement-breakpoint
CREATE TYPE "public"."session_type" AS ENUM('meditation', 'journaling');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'canceled', 'expired');--> statement-breakpoint
CREATE TYPE "public"."theme" AS ENUM('light', 'dark', 'system');--> statement-breakpoint
CREATE TABLE "daily_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"stat_date" date NOT NULL,
	"meditation_count" integer DEFAULT 0 NOT NULL,
	"journaling_count" integer DEFAULT 0 NOT NULL,
	"total_duration" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "daily_stats_user_id_stat_date_unique" UNIQUE("user_id","stat_date")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "session_type" NOT NULL,
	"duration" integer NOT NULL,
	"pages_completed" integer,
	"completed_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan_type" varchar(50) NOT NULL,
	"status" "subscription_status" DEFAULT 'active' NOT NULL,
	"stripe_customer_id" varchar(255),
	"stripe_subscription_id" varchar(255),
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"meditation_duration" integer DEFAULT 5 NOT NULL,
	"journaling_duration" integer DEFAULT 120 NOT NULL,
	"journaling_break_duration" integer DEFAULT 10 NOT NULL,
	"theme" "theme" DEFAULT 'system' NOT NULL,
	"notifications_enabled" boolean DEFAULT false NOT NULL,
	"sound_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255),
	"display_name" varchar(100),
	"auth_provider" "auth_provider" DEFAULT 'email' NOT NULL,
	"plan_type" "plan_type" DEFAULT 'free' NOT NULL,
	"timezone" varchar(50) DEFAULT 'Asia/Tokyo',
	"locale" varchar(10) DEFAULT 'ja',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "daily_stats" ADD CONSTRAINT "daily_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "daily_stats_user_id_stat_date_idx" ON "daily_stats" USING btree ("user_id","stat_date");--> statement-breakpoint
CREATE INDEX "sessions_user_id_completed_at_idx" ON "sessions" USING btree ("user_id","completed_at");