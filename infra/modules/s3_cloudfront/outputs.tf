output "cloudfront_domain_name" {
  value       = aws_cloudfront_distribution.frontend_distribution.domain_name
  description = "The domain name of the CloudFront distribution"
}

output "cloudfront_distribution_id" {
  value       = aws_cloudfront_distribution.frontend_distribution.id
  description = "The ID of the CloudFront distribution"
}

output "s3_bucket_name" {
  value       = aws_s3_bucket.frontend.id
  description = "The name of the S3 bucket hosting the frontend"
}

output "route53_zone_id" {
  value       = data.aws_route53_zone.primary.zone_id
  description = "The Route 53 zone ID for the domain"
}
