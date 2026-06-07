# IAM Instance Profile for Elastic Beanstalk EC2 instances
resource "aws_iam_role" "eb_ec2_role" {
  name = "${var.project_name}-${var.environment}-eb-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

# Attach standard web tier policy (for logs, X-Ray, etc.)
resource "aws_iam_role_policy_attachment" "web_tier" {
  role       = aws_iam_role.eb_ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier"
}

resource "aws_iam_role_policy_attachment" "worker_tier" {
  role       = aws_iam_role.eb_ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkWorkerTier"
}

resource "aws_iam_instance_profile" "eb_profile" {
  name = "${var.project_name}-${var.environment}-eb-instance-profile"
  role = aws_iam_role.eb_ec2_role.name
}

# Elastic Beanstalk Application
resource "aws_elastic_beanstalk_application" "app" {
  name        = "${var.project_name}-${var.environment}-app"
  description = "Elastic Beanstalk application for StudioOps backend"
}

# Elastic Beanstalk Environment (configured as a cost-effective single instance)
resource "aws_elastic_beanstalk_environment" "env" {
  name                = "${var.project_name}-${var.environment}-env"
  application         = aws_elastic_beanstalk_application.app.name
  solution_stack_name = "64bit Amazon Linux 2023 v4.3.0 running on Corretto 21"

  # Network Configuration
  setting {
    namespace = "aws:ec2:vpc"
    name      = "VPCId"
    value     = var.vpc_id
  }

  setting {
    namespace = "aws:ec2:vpc"
    name      = "Subnets"
    value     = join(",", var.public_subnet_ids) # EC2 instances run in public subnets with public IPs
  }

  setting {
    namespace = "aws:ec2:vpc"
    name      = "AssociatePublicIpAddress"
    value     = "true"
  }

  # EC2 Launch configuration & Instance profile
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = aws_iam_instance_profile.eb_profile.name
  }

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "InstanceType"
    value     = var.instance_type
  }

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "SecurityGroups"
    value     = var.beanstalk_sg_id
  }

  # Single Instance Mode (Bypasses Load Balancer charges to keep costs under $15/month)
  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "EnvironmentType"
    value     = "SingleInstance"
  }

  # Environment variables for Spring Boot application
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "SPRING_PROFILES_ACTIVE"
    value     = "prod"
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "SPRING_DATASOURCE_URL"
    value     = "jdbc:postgresql://${var.rds_endpoint}/${var.db_name}"
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "SPRING_DATASOURCE_USERNAME"
    value     = var.db_username
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "SPRING_DATASOURCE_PASSWORD"
    value     = var.db_password
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "STUDIOOPS_BETA_WHATSAPP_ONLY"
    value     = "true"
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "PORT"
    value     = "5000"
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "JAVA_TOOL_OPTIONS"
    value     = "-XX:MaxRAMPercentage=75.0 -XX:+UseG1GC"
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "STUDIOOPS_CORS_ALLOWED_ORIGINS"
    value     = "https://${var.frontend_subdomain}.${var.domain_name}"
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-eb-env"
    Environment = var.environment
  }
}
