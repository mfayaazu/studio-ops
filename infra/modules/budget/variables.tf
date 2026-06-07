variable "project_name" {
  type        = string
  description = "Name of the project"
}

variable "environment" {
  type        = string
  description = "Deployment environment"
}

variable "budget_email" {
  type        = string
  description = "Email address for budget alerts"
}

variable "limit_amount" {
  type        = string
  description = "Monthly budget limit in USD"
  default     = "15.0"
}
