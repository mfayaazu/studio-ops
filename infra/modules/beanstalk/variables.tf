variable "project_name" {
  type        = string
  description = "Name of the project"
}

variable "environment" {
  type        = string
  description = "Deployment environment"
}

variable "vpc_id" {
  type        = string
  description = "ID of the VPC"
}

variable "public_subnet_ids" {
  type        = list(string)
  description = "List of public subnet IDs for Elastic Beanstalk instances"
}

variable "beanstalk_sg_id" {
  type        = string
  description = "Security Group ID for Beanstalk instances"
}

variable "rds_endpoint" {
  type        = string
  description = "RDS connection endpoint"
}

variable "db_name" {
  type        = string
  description = "Database name for PostgreSQL"
}

variable "db_username" {
  type        = string
  description = "Master username for database"
}

variable "db_password" {
  type        = string
  description = "Master password for database"
  sensitive   = true
}

variable "domain_name" {
  type        = string
  description = "Root domain name for application"
}

variable "frontend_subdomain" {
  type        = string
  description = "Frontend application subdomain"
}

variable "instance_type" {
  type        = string
  description = "EC2 instance type for Beanstalk"
  default     = "t3.micro"
}
