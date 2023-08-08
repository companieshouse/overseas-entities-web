resource "aws_ssm_parameter" "secret_parameters" {
  for_each = nonsensitive(var.secrets)
    name  = "/${var.name_prefix}/${each.key}"
    key_id = var.kms_key_id
    description = each.key
    type  = "SecureString"
    overwrite = "true"
    value = each.value
}