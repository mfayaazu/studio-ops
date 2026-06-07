variable "project_name" {
  type        = string
  description = "Name of the project"
}

variable "environment" {
  type        = string
  description = "Deployment environment"
}

variable "private_subnet_ids" {
  type        = list(string)
  description = "List of private subnet IDs for database subnet group"
}

variable "rds_sg_id" {
  type        = string
  description = "Security Group ID of the RDS database"
}

variable "db_name" {
  type        = string
  description = "Database name for PostgreSQL"
}

variable "db_username" {
  type        = string
  description = "Master username for PostgreSQL database"
}

variable "db_password" {
  type        = string
  description = "Master password for PostgreSQL database"
  sensitive   = true
}

variable "db_instance_class" {
  type        = string
  description = "Instance class for RDS PostgreSQL"
}

variable "rds_allocated_storage" {
  type        = number
  description = "Allocated storage size for RDS database in GB"
}
