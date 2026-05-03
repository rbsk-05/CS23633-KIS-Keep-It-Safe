# -----------------------------------------------------------
# KIS - Keep It Safe | AWS Infrastructure setup
# -----------------------------------------------------------

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# -----------------------------------------------------------
# 1. Amazon S3 - Frontend Hosting
# -----------------------------------------------------------
resource "aws_s3_bucket" "frontend_bucket" {
  bucket = "${var.project_name}-frontend-${var.environment}"
}

resource "aws_s3_bucket_website_configuration" "frontend_hosting" {
  bucket = aws_s3_bucket.frontend_bucket.id

  index_document {
    suffix = "index.html"
  }
  error_document {
    key = "index.html" # For React Router fallback
  }
}

# -----------------------------------------------------------
# 2. AWS KMS - Zero-Knowledge Encryption Key
# -----------------------------------------------------------
resource "aws_kms_key" "vault_key" {
  description             = "KMS Key for encrypting KIS password vaults"
  deletion_window_in_days = 7
  enable_key_rotation     = true
}

resource "aws_kms_alias" "vault_key_alias" {
  name          = "alias/${var.project_name}-key"
  target_key_id = aws_kms_key.vault_key.key_id
}

# -----------------------------------------------------------
# 3. Amazon DynamoDB - User Vault Storage
# -----------------------------------------------------------
resource "aws_dynamodb_table" "user_vaults" {
  name           = "${var.project_name}-Vaults-${var.environment}"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "user_id"   # Cognito Sub ID
  range_key      = "vault_id"  # Unique credential ID

  attribute {
    name = "user_id"
    type = "S"
  }

  attribute {
    name = "vault_id"
    type = "S"
  }

  server_side_encryption {
    enabled     = true
    kms_key_arn = aws_kms_key.vault_key.arn
  }
}

# -----------------------------------------------------------
# 4. Amazon Cognito - User Authentication
# -----------------------------------------------------------
resource "aws_cognito_user_pool" "users" {
  name = "${var.project_name}-UserPool-${var.environment}"

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }

  auto_verified_attributes = ["email"]
}

resource "aws_cognito_user_pool_client" "client" {
  name                                 = "${var.project_name}-AppClient"
  user_pool_id                         = aws_cognito_user_pool.users.id
  generate_secret                      = false
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["email", "openid", "profile"]
  callback_urls                        = ["http://localhost:5173/dashboard"] # Update for prod
  logout_urls                          = ["http://localhost:5173/"]
  supported_identity_providers         = ["COGNITO"]
  allowed_oauth_flows_user_pool_client = true
}

resource "aws_cognito_user_pool_domain" "main" {
  domain       = "${var.project_name}-auth-${var.environment}"
  user_pool_id = aws_cognito_user_pool.users.id
}

# -----------------------------------------------------------
# 5. AWS Lambda & IAM - Backend Logic
# -----------------------------------------------------------
resource "aws_iam_role" "lambda_exec" {
  name = "${var.project_name}-LambdaExecRole-${var.environment}"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

# Granting Lambda permission to DynamoDB and KMS
resource "aws_iam_policy" "lambda_policy" {
  name = "${var.project_name}-LambdaPolicy-${var.environment}"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["dynamodb:PutItem", "dynamodb:GetItem", "dynamodb:Query", "dynamodb:DeleteItem"]
        Resource = aws_dynamodb_table.user_vaults.arn
      },
      {
        Effect   = "Allow"
        Action   = ["kms:Encrypt", "kms:Decrypt"]
        Resource = aws_kms_key.vault_key.arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_policy_attach" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = aws_iam_policy.lambda_policy.arn
}

resource "aws_lambda_function" "api_backend" {
  function_name = "${var.project_name}-Backend-${var.environment}"
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  role          = aws_iam_role.lambda_exec.arn

  # Dummy zip file placeholder for Terraform state (In reality, CI/CD provides this)
  filename         = "dummy_lambda.zip" 
  
  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.user_vaults.name
      KMS_KEY_ID = aws_kms_key.vault_key.id
    }
  }
}

# -----------------------------------------------------------
# 6. Amazon API Gateway - HTTP API Routing
# -----------------------------------------------------------
resource "aws_apigatewayv2_api" "http_api" {
  name          = "${var.project_name}-API-${var.environment}"
  protocol_type = "HTTP"
  
  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers = ["Authorization", "Content-Type"]
  }
}

# Route API traffic to Lambda
resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id           = aws_apigatewayv2_api.http_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.api_backend.invoke_arn
}

resource "aws_apigatewayv2_route" "default_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_apigatewayv2_stage" "prod" {
  api_id      = aws_apigatewayv2_api.http_api.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_lambda_permission" "api_gw_invoke" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api_backend.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*"
}
