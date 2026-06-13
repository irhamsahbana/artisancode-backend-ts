ALTER TABLE "activity_logs" DROP CONSTRAINT "activity_logs_company_id_companies_id_fk";
--> statement-breakpoint
ALTER TABLE "activity_logs" DROP CONSTRAINT "activity_logs_branch_id_branches_id_fk";
--> statement-breakpoint
ALTER TABLE "activity_logs" DROP CONSTRAINT "activity_logs_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "branches" DROP CONSTRAINT "branches_company_id_companies_id_fk";
--> statement-breakpoint
ALTER TABLE "categories" DROP CONSTRAINT "categories_company_id_companies_id_fk";
--> statement-breakpoint
ALTER TABLE "enrollments" DROP CONSTRAINT "enrollments_company_id_companies_id_fk";
--> statement-breakpoint
ALTER TABLE "enrollments" DROP CONSTRAINT "enrollments_branch_id_branches_id_fk";
--> statement-breakpoint
ALTER TABLE "enrollments" DROP CONSTRAINT "enrollments_student_id_students_id_fk";
--> statement-breakpoint
ALTER TABLE "enrollments" DROP CONSTRAINT "enrollments_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "enrollments" DROP CONSTRAINT "enrollments_product_pricing_id_product_pricings_id_fk";
--> statement-breakpoint
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_company_id_companies_id_fk";
--> statement-breakpoint
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_branch_id_branches_id_fk";
--> statement-breakpoint
ALTER TABLE "payments" DROP CONSTRAINT "payments_company_id_companies_id_fk";
--> statement-breakpoint
ALTER TABLE "payments" DROP CONSTRAINT "payments_branch_id_branches_id_fk";
--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT "products_company_id_companies_id_fk";
--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT "products_branch_id_branches_id_fk";
--> statement-breakpoint
ALTER TABLE "roles" DROP CONSTRAINT "roles_company_id_companies_id_fk";
--> statement-breakpoint
ALTER TABLE "storage_files" DROP CONSTRAINT "storage_files_company_id_companies_id_fk";
--> statement-breakpoint
ALTER TABLE "storage_files" DROP CONSTRAINT "storage_files_created_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "students" DROP CONSTRAINT "students_company_id_companies_id_fk";
--> statement-breakpoint
ALTER TABLE "students" DROP CONSTRAINT "students_branch_id_branches_id_fk";
--> statement-breakpoint
ALTER TABLE "teacher_products" DROP CONSTRAINT "teacher_products_teacher_id_teachers_id_fk";
--> statement-breakpoint
ALTER TABLE "teachers" DROP CONSTRAINT "teachers_company_id_companies_id_fk";
--> statement-breakpoint
ALTER TABLE "teachers" DROP CONSTRAINT "teachers_branch_id_branches_id_fk";
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_company_id_companies_id_fk";
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_branch_id_branches_id_fk";
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_role_id_roles_id_fk";
