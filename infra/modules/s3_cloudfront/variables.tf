variable "project_name" {
  type        = string
  description = "Name of the project"
}

variable "environment" {
  type        = string
  description = "Deployment environment"
}

variable "domain_name" {
  type        = string
  description = "Root domain name for application (e.g. studioops.photo)"
}

variable "frontend_subdomain" {
  type        = string
  description = "Frontend application subdomain (e.g. beta)"
}

variable "backend_subdomain" {
  type        = string
  description = "Backend API subdomain (e.g. api-beta)"
}

variable "beanstalk_cname" {
  type        = string
  description = "Elastic Beanstalk CNAME endpoint for routing"
}

variable "cloudfront_acm_certificate_arn" {
  type        = string
  description = "ACM Certificate ARN in us-east-1 for CloudFront custom domain"
}

variable "beanstalk_acm_certificate_arn" {
  type        = string
  description = "ACM Certificate ARN in target region for Beanstalk backend custom domain (optional if not using ALB/SSL termination on backend directly, but useful if domain SSL is set up)"
  default     = ""
}
