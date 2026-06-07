output "beanstalk_cname" {
  value       = aws_elastic_beanstalk_environment.env.cname
  description = "The public CNAME of the Elastic Beanstalk environment"
}

output "beanstalk_endpoint" {
  value       = aws_elastic_beanstalk_environment.env.endpoint_url
  description = "The endpoint URL of the Elastic Beanstalk environment"
}
