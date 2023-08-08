output "secrets_name" {
  value = [
    for sec in aws_ssm_parameter.secret_parameters : sec.name
  ]
}

output "secrets" {
  value = aws_ssm_parameter.secret_parameters
}