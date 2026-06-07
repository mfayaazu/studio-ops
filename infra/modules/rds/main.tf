resource "aws_db_subnet_group" "db_subnets" {
  name        = "${var.project_name}-${var.environment}-db-subnet-group"
  description = "Subnet group for RDS database"
  subnet_ids  = var.private_subnet_ids

  tags = {
    Name        = "${var.project_name}-${var.environment}-db-subnet-group"
    Environment = var.environment
  }
}

resource "aws_db_parameter_group" "pg" {
  name   = "${var.project_name}-${var.environment}-pg"
  family = "postgres16"

  parameter {
    name  = "log_connections"
    value = "1"
  }

  parameter {
    name  = "log_disconnections"
    value = "1"
  }
}

resource "aws_db_instance" "db" {
  identifier             = "${var.project_name}-${var.environment}-db"
  allocated_storage      = var.rds_allocated_storage
  max_allocated_storage  = 100 # Autoscales up to 100GB if needed
  storage_type           = "gp3"
  engine                 = "postgres"
  engine_version         = "16.3"
  instance_class         = var.db_instance_class
  db_name                = var.db_name
  username               = var.db_username
  password               = var.db_password
  parameter_group_name   = aws_db_parameter_group.pg.name
  db_subnet_group_name   = aws_db_subnet_group.db_subnets.name
  vpc_security_group_ids = [var.rds_sg_id]

  # Cost Containment & Beta Settings
  publicly_accessible     = false
  multi_az                = false
  backup_retention_period = 1 # 1-day retention is sufficient and cheap for beta
  skip_final_snapshot     = true
  deletion_protection     = false

  tags = {
    Name        = "${var.project_name}-${var.environment}-rds"
    Environment = var.environment
  }
}
