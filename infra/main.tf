module "vpc" {
  source = "./modules/vpc"

  project_name = var.project_name
  environment  = var.environment
}

module "security_groups" {
  source = "./modules/security_groups"

  project_name        = var.project_name
  environment         = var.environment
  vpc_id              = module.vpc.vpc_id
  allowed_cidr_blocks = var.allowed_cidr_blocks
}

module "rds" {
  source = "./modules/rds"

  project_name          = var.project_name
  environment           = var.environment
  private_subnet_ids    = module.vpc.private_subnet_ids
  rds_sg_id             = module.security_groups.rds_sg_id
  db_name               = var.db_name
  db_username           = var.db_username
  db_password           = var.db_password
  db_instance_class     = var.db_instance_class
  rds_allocated_storage = var.rds_allocated_storage
}

module "beanstalk" {
  source = "./modules/beanstalk"

  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  public_subnet_ids  = module.vpc.public_subnet_ids
  beanstalk_sg_id    = module.security_groups.beanstalk_sg_id
  rds_endpoint       = module.rds.rds_endpoint
  db_name            = var.db_name
  db_username        = var.db_username
  db_password        = var.db_password
  domain_name        = var.domain_name
  frontend_subdomain = var.frontend_subdomain
}

module "s3_cloudfront" {
  source = "./modules/s3_cloudfront"

  project_name                   = var.project_name
  environment                    = var.environment
  domain_name                    = var.domain_name
  frontend_subdomain             = var.frontend_subdomain
  backend_subdomain              = var.backend_subdomain
  beanstalk_cname                = module.beanstalk.beanstalk_cname
  cloudfront_acm_certificate_arn = var.cloudfront_acm_certificate_arn
}

module "budget" {
  source = "./modules/budget"

  project_name = var.project_name
  environment  = var.environment
  budget_email = var.budget_email
}
