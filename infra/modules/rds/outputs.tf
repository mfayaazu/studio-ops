output "rds_endpoint" {
  value       = aws_db_instance.db.endpoint
  description = "Database connection endpoint (hostname:port)"
}

output "rds_address" {
  value       = aws_db_instance.db.address
  description = "Hostname of the RDS PostgreSQL database"
}
