output "beanstalk_sg_id" {
  value       = aws_security_group.beanstalk.id
  description = "Security Group ID of the Elastic Beanstalk instances"
}

output "rds_sg_id" {
  value       = aws_security_group.rds.id
  description = "Security Group ID of the RDS database"
}
