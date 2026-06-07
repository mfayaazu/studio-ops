# Elastic Beanstalk (EC2 Instances) Security Group
resource "aws_security_group" "beanstalk" {
  name        = "${var.project_name}-${var.environment}-eb-sg"
  description = "Security Group for Elastic Beanstalk EC2 instances"
  vpc_id      = var.vpc_id

  # HTTP Ingress
  ingress {
    description = "Allow HTTP inbound traffic"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = var.allowed_cidr_blocks
  }

  # HTTPS Ingress
  ingress {
    description = "Allow HTTPS inbound traffic"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = var.allowed_cidr_blocks
  }

  # Allow all outbound traffic (needed to query updates, access DB, fetch metadata)
  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-eb-sg"
    Environment = var.environment
  }
}

# RDS Security Group (Restricts database access only to Beanstalk)
resource "aws_security_group" "rds" {
  name        = "${var.project_name}-${var.environment}-rds-sg"
  description = "Security Group for RDS PostgreSQL database"
  vpc_id      = var.vpc_id

  ingress {
    description     = "Allow PostgreSQL access from Beanstalk EC2"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.beanstalk.id]
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-rds-sg"
    Environment = var.environment
  }
}
