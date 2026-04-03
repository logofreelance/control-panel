CREATE TABLE `admin_users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`username` varchar(255) NOT NULL,
	`password_hash` text NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `admin_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_users_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
CREATE TABLE `api_categories` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`roles` text,
	`permissions` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `api_categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `api_endpoints` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`category_id` int,
	`data_source_id` int,
	`resource_id` int,
	`path` varchar(255) NOT NULL,
	`method` varchar(10) DEFAULT 'GET',
	`description` text,
	`response_data` text,
	`roles` text,
	`permissions` text,
	`min_role_level` int DEFAULT 0,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`operation_type` varchar(20) DEFAULT 'read',
	`writable_fields` text,
	`protected_fields` text,
	`auto_populate_fields` text,
	`ownership_column` varchar(64),
	`allow_owner_only` boolean DEFAULT true,
	CONSTRAINT `api_endpoints_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `api_error_templates` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`scope` varchar(20) DEFAULT 'global',
	`scope_id` int,
	`status_code` int NOT NULL,
	`template` text NOT NULL,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `api_error_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `api_keys` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`key` varchar(255) NOT NULL,
	`roles` text,
	`permissions` text,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`last_used_at` timestamp,
	CONSTRAINT `api_keys_id` PRIMARY KEY(`id`),
	CONSTRAINT `api_keys_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `api_logs` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`api_key_id` int,
	`endpoint` varchar(255),
	`method` varchar(10),
	`status_code` int,
	`duration_ms` int,
	`origin` varchar(255),
	`ip` varchar(45),
	`user_agent` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `api_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `api_mutation_logs` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`endpoint_id` int,
	`user_id` int,
	`action` varchar(20),
	`table_name` varchar(100),
	`record_id` int,
	`before_data` text,
	`after_data` text,
	`ip` varchar(45),
	`user_agent` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `api_mutation_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cors_domains` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`domain` varchar(255) NOT NULL,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `cors_domains_id` PRIMARY KEY(`id`),
	CONSTRAINT `cors_domains_domain_unique` UNIQUE(`domain`)
);
--> statement-breakpoint
CREATE TABLE `data_source_migrations` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`data_source_id` int NOT NULL,
	`version` int NOT NULL,
	`action` varchar(20) NOT NULL,
	`changes_json` text NOT NULL,
	`executed_ddl` text,
	`rollback_ddl` text,
	`status` varchar(20) DEFAULT 'PENDING',
	`error_message` text,
	`executed_at` timestamp,
	`executed_by` int,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `data_source_migrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `data_source_relations` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`source_id` int NOT NULL,
	`target_id` int NOT NULL,
	`type` varchar(20) NOT NULL,
	`local_key` varchar(100),
	`foreign_key` varchar(100) DEFAULT 'id',
	`pivot_table` varchar(255),
	`pivot_source_key` varchar(100),
	`pivot_target_key` varchar(100),
	`alias` varchar(100),
	`description` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `data_source_relations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `data_source_resources` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`data_source_id` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100),
	`description` text,
	`fields_json` text,
	`filters_json` text,
	`joins_json` text,
	`relations_json` text,
	`aggregates_json` text,
	`computed_fields_json` text,
	`fields` text,
	`filters` text,
	`order_by` varchar(255),
	`order_direction` varchar(4) DEFAULT 'DESC',
	`default_limit` int DEFAULT 100,
	`max_limit` int DEFAULT 1000,
	`limit` int DEFAULT 100,
	`cache_ttl` int DEFAULT 0,
	`cache_key` varchar(255),
	`is_public` boolean DEFAULT false,
	`required_roles` text,
	`required_permissions` text,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `data_source_resources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `data_source_templates` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`category` varchar(50),
	`icon` varchar(10),
	`schema_json` text NOT NULL,
	`sample_data_json` text,
	`is_system` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `data_source_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `data_sources` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`table_name` varchar(255) NOT NULL,
	`description` text,
	`schema_json` text,
	`indexes_json` text,
	`constraints_json` text,
	`relations_json` text,
	`validation_json` text,
	`selectable_columns` text,
	`filterable_columns` text,
	`prefix` varchar(10) DEFAULT 'usr_',
	`is_system` boolean DEFAULT false,
	`is_archived` boolean DEFAULT false,
	`row_count` int DEFAULT 0,
	`version` int DEFAULT 1,
	`created_by` int,
	`updated_by` int,
	`archived_at` timestamp,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `data_sources_id` PRIMARY KEY(`id`),
	CONSTRAINT `data_sources_table_name_unique` UNIQUE(`table_name`)
);
--> statement-breakpoint
CREATE TABLE `databases` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`host` varchar(255) NOT NULL,
	`port` int DEFAULT 4000,
	`user` varchar(255) NOT NULL,
	`password` text NOT NULL,
	`db_name` varchar(255) NOT NULL,
	`status` varchar(50) DEFAULT 'healthy',
	`storage_used` bigint DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `databases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `login_attempts` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`identifier` varchar(255) NOT NULL,
	`ip` varchar(45),
	`user_agent` text,
	`success` boolean DEFAULT false,
	`failure_reason` varchar(100),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `login_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `node_health_metrics` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`node_id` varchar(255) NOT NULL,
	`endpoint_url` varchar(255) NOT NULL,
	`cpu_usage` varchar(50),
	`memory_usage` varchar(50),
	`uptime` int,
	`status` varchar(50) DEFAULT 'online',
	`last_heartbeat` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `node_health_metrics_id` PRIMARY KEY(`id`),
	CONSTRAINT `node_health_metrics_node_id_unique` UNIQUE(`node_id`)
);
--> statement-breakpoint
CREATE TABLE `permissions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`group` varchar(50),
	`description` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `permissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `permissions_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	`display_name` varchar(100),
	`description` text,
	`level` int DEFAULT 0,
	`is_super` boolean DEFAULT false,
	`permissions` text,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `roles_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` varchar(255) NOT NULL,
	`user_id` int NOT NULL,
	`expires_at` timestamp NOT NULL,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `site_settings` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`site_name` varchar(255) DEFAULT 'Modular Engine',
	`site_title` varchar(255) DEFAULT 'Dashboard',
	`meta_description` text,
	`favicon_url` text,
	`primary_color` varchar(20) DEFAULT '#059669',
	`config_version` int DEFAULT 1,
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sites` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`url` varchar(255) NOT NULL,
	`is_active` boolean DEFAULT true,
	`database_id` int,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sites_id` PRIMARY KEY(`id`),
	CONSTRAINT `sites_url_unique` UNIQUE(`url`)
);
--> statement-breakpoint
CREATE TABLE `user_permissions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`permission_id` int NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `user_permissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`username` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` text NOT NULL,
	`role` varchar(20) DEFAULT 'user',
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;