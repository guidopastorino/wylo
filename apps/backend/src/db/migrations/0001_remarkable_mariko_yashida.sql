CREATE TABLE "connected_repo" (
	"user_id" text NOT NULL,
	"repo_full_name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "connected_repo_user_id_repo_full_name_pk" PRIMARY KEY("user_id","repo_full_name")
);
--> statement-breakpoint
ALTER TABLE "connected_repo" ADD CONSTRAINT "connected_repo_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "connected_repo_userId_idx" ON "connected_repo" USING btree ("user_id");