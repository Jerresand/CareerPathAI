ALTER TABLE "talent_profiles" ADD COLUMN "title" text;--> statement-breakpoint
ALTER TABLE "talent_profiles" ADD COLUMN "company" text;--> statement-breakpoint
ALTER TABLE "talent_profiles" ADD COLUMN "rating" real;--> statement-breakpoint
ALTER TABLE "talent_profiles" ADD COLUMN "status" text DEFAULT 'pending';