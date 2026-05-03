output "s3_website_endpoint" {
  description = "The S3 bucket endpoint for the React frontend"
  value       = aws_s3_bucket_website_configuration.frontend_hosting.website_endpoint
}

output "api_gateway_url" {
  description = "The base URL for the backend API"
  value       = aws_apigatewayv2_api.http_api.api_endpoint
}

output "cognito_user_pool_id" {
  description = "The Cognito User Pool ID"
  value       = aws_cognito_user_pool.users.id
}

output "cognito_app_client_id" {
  description = "The Cognito App Client ID"
  value       = aws_cognito_user_pool_client.client.id
}

output "cognito_auth_domain" {
  description = "The Cognito Hosted UI Domain"
  value       = "https://${aws_cognito_user_pool_domain.main.domain}.auth.${var.aws_region}.amazoncognito.com"
}

output "dynamodb_table_name" {
  description = "The name of the DynamoDB table"
  value       = aws_dynamodb_table.user_vaults.name
}

output "kms_key_arn" {
  description = "The ARN of the KMS Key used for zero-knowledge encryption"
  value       = aws_kms_key.vault_key.arn
}
