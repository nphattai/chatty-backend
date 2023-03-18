terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}


terraform {
  backend "s3" {
    bucket = "funny-chatapp" # unique AWS S3 bucket
    # create a sub-folder called development
    key     = "development/funnychatapp.tfstate"
    region  = "ap-southeast-1"
    encrypt = true
  }
}

# Configure the AWS Provider
provider "aws" {
  region = var.aws_region
}

locals {
  prefix = "${var.prefix}-${terraform.workspace}"

  common_tags = {
    Environment = terraform.workspace
    Project     = var.project
    ManagedBy   = "Terraform"
    Owner       = "Henry"
  }
}
