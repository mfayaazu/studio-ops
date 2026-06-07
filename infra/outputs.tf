output "frontend_cloudfront_domain" {
  value       = module.s3_cloudfront.cloudfront_domain_name
  description = "The public domain name of the CloudFront static website distribution"
}

output "frontend_bucket_name" {
  value       = module.s3_cloudfront.s3_bucket_name
  description = "Name of S3 bucket hosting frontend assets"
}

output "backend_beanstalk_endpoint" {
  value       = module.beanstalk.beanstalk_endpoint
  description = "The public endpoint URL of the Elastic Beanstalk application backend"
}

output "backend_beanstalk_cname" {
  value       = module.beanstalk.beanstalk_cname
  description = "The public CNAME of the Elastic Beanstalk environment"
}

output "rds_endpoint" {
  value       = module.rds.rds_endpoint
  description = "Database connection endpoint (hostname:port)"
}

output "route53_zone_id" {
  value       = module.s3_cloudfront.route53_zone_id
  description = "The Route 53 Hosted Zone ID"
}
