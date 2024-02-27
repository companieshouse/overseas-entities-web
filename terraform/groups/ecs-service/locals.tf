# Define all hardcoded local variable and local variables looked up from data resources
locals {
  stack_name                = "filing-create" # this must match the stack name the service deploys into
  name_prefix               = "${local.stack_name}-${var.environment}"
  global_prefix             = "global-${var.environment}"
  service_name              = "overseas-entities-web"
  container_port            = "3000" # default node port required here until prod docker container is built allowing port change via env var
  docker_repo               = "overseas-entities-web"
  kms_alias                 = "alias/${var.aws_profile}/environment-services-kms"
  lb_listener_rule_priority = 91
  lb_listener_paths         = ["/register-an-overseas-entity*","/update-an-overseas-entity*"]
  healthcheck_path          = "/register-an-overseas-entity/healthcheck" #healthcheck path for overseas entities web
  healthcheck_matcher       = "200"
  vpc_name                  = local.service_secrets["vpc_name"]
  application_subnet_ids      = data.aws_subnets.application.ids
  application_subnet_pattern  = local.stack_secrets["application_subnet_pattern"]

  # Environment Files
  use_set_environment_files   = var.use_set_environment_files
  app_environment_filename    = "restricted-word-web.env"

  # Secrets
  stack_secrets               = jsondecode(data.vault_generic_secret.stack_secrets.data_json)
  service_secrets             = jsondecode(data.vault_generic_secret.service_secrets.data_json)

  # GLOBAL: create a map of secret name => secret arn to pass into ecs service module
  global_secrets_arn_map = {
    for sec in data.aws_ssm_parameter.global_secret :
    trimprefix(sec.name, "/${local.global_prefix}/") => sec.arn
  }

  # GLOBAL: create a list of secret name => secret arn to pass into ecs service module
  global_secret_list = flatten([for key, value in local.global_secrets_arn_map :
    { "name" = upper(key), "valueFrom" = value }
  ])

  # SERVICE: create a map of secret name => secret arn to pass into ecs service module
  service_secrets_arn_map = {
    for sec in module.secrets.secrets :
    trimprefix(sec.name, "/${local.service_name}-${var.environment}/") => sec.arn
  }

  # SERVICE: create a list of secret name => secret arn to pass into ecs service module
  service_secret_list = flatten([for key, value in local.service_secrets_arn_map :
    { "name" = upper(key), "valueFrom" = value }
  ])

  # TASK SECRET: GLOBAL SECRET + SERVICE SECRET
  task_secrets = concat(local.global_secret_list,local.service_secret_list,[
  ])

  # GLOBAL: create a map of secret name and secret version to pass into ecs service module
  ssm_global_version_map = [
    for sec in data.aws_ssm_parameter.global_secret : {
      name = "GLOBAL_${var.ssm_version_prefix}${replace(upper(basename(sec.name)), "-", "_")}", value = sec.version
    }
  ]

  # SERVICE: create a map of secret name and secret version to pass into ecs service module
  ssm_service_version_map = [
    for sec in module.secrets.secrets : {
      name = "${replace(upper(local.service_name), "-", "_")}_${var.ssm_version_prefix}${replace(upper(basename(sec.name)), "-", "_")}", value = sec.version
    }
  ]

  # TASK ENVIRONMENT: GLOBAL SECRET Version + SERVICE SECRET Version
  task_environment = concat(local.ssm_global_version_map,local.ssm_service_version_map,[
    { "name": "NODE_PORT", "value": "${local.container_port}" }
    ])
}
