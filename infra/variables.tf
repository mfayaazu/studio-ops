variable "aws_region" {
  type        = string
  description = "AWS region to deploy resources in"
  default     = "us-east-1"
}

variable "project_name" {
  type        = string
  description = "Name of the project"
  default     = "studio-ops"
}

variable "environment" {
  type        = string
  description = "Target environment (e.g. beta, prod)"
  default     = "beta"
}

variable "domain_name" {
  type        = string
  description = "Root domain name for the application (e.g. studioops.photo)"
}

variable "frontend_subdomain" {
  type        = string
  description = "Subdomain for the React frontend application"
  default     = "beta"
}

variable "backend_subdomain" {
  type        = string
  description = "Subdomain for the Spring Boot backend API"
  default     = "api-beta"
}

variable "db_name" {
  type        = string
  description = "Database name for PostgreSQL"
  default     = "studioops"
}

variable "db_username" {
  type        = string
  description = "Master username for PostgreSQL database"
  default     = "studioops_admin"
}

variable "db_password" {
  type        = string
  description = "Master password for PostgreSQL database"
  sensitive   = true
}

variable "db_instance_class" {
  type        = string
  description = "Instance class for RDS PostgreSQL"
  default     = "db.t4g.micro"
}

variable "rds_allocated_storage" {
  type        = number
  description = "Allocated storage size for RDS database in GB"
  default     = 20
}

variable "cloudfront_acm_certificate_arn" {
  type        = string
  description = "ACM Certificate ARN in us-east-1 for CloudFront custom domain"
}

variable "budget_email" {
  type        = string
  description = "Email address for AWS Budget notification alerts"
}

variable "allowed_cidr_blocks" {
  type        = list(string)
  description = "List of CIDR blocks allowed to access the backend directly if needed"
  default     = ["0.0.0.0/0"]
}
