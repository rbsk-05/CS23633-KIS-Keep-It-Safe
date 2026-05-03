variable "aws_region" {
  description = "The AWS region to deploy the KIS infrastructure"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "The core name of the project to prefix resources"
  type        = string
  default     = "KIS"
}

variable "environment" {
  description = "The environment tier (dev, staging, prod)"
  type        = string
  default     = "dev"
}
