# Define all hardcoded local variable and local variables looked up from data resources
locals {
  stack_name                = "filing-create" # this must match the stack name the service deploys into
  name_prefix               = "${local.stack_name}-${var.environment}"
  service_name              = "overseas-entities-web"
  container_port            = "3000" # default node port required here until prod docker container is built allowing port change via env var
  docker_repo               = "overseas-entities-web"
  lb_listener_rule_priority = 10
  lb_listener_paths         = ["/register-an-overseas-entity/*","/update-an-overseas-entity/*"]
  healthcheck_path          = "/register-an-overseas-entity/healthcheck" #healthcheck path for overseas entities web
  healthcheck_matcher       = "200"

  service_secrets           = jsondecode(data.vault_generic_secret.service_secrets.data_json)

  parameter_store_secrets    = {
    "vpc_name"                  = local.service_secrets["vpc_name"]
    "chs_api_key"               = local.service_secrets["chs_api_key"]
    "internal_api_url"          = local.service_secrets["internal_api_url"]
    "cdn_host"                  = local.service_secrets["cdn_host"]
    "oauth2_auth_uri"           = local.service_secrets["oauth2_auth_uri"]
    "oauth2_redirect_uri"       = local.service_secrets["oauth2_redirect_uri"]
    "account_test_url"          = local.service_secrets["account_test_url"]
    "account_url"               = local.service_secrets["account_url"]
    "cache_server"              = local.service_secrets["cache_server"]
  }

  vpc_name                  = local.service_secrets["vpc_name"]
  chs_api_key               = local.service_secrets["chs_api_key"]
  internal_api_url          = local.service_secrets["internal_api_url"]
  cdn_host                  = local.service_secrets["cdn_host"] #TODO: Defined both as a secret and non-secret 
  oauth2_auth_uri           = local.service_secrets["oauth2_auth_uri"]
  oauth2_redirect_uri       = local.service_secrets["oauth2_redirect_uri"]
  account_test_url          = local.service_secrets["account_test_url"]
  account_url               = local.service_secrets["account_url"]
  cache_server              = local.service_secrets["cache_server"]

  # create a map of secret name => secret arn to pass into ecs service module
  # using the trimprefix function to remove the prefixed path from the secret name
  secrets_arn_map = {
    for sec in data.aws_ssm_parameter.secret:
      trimprefix(sec.name, "/${local.name_prefix}/") => sec.arn
  }

  service_secrets_arn_map = {
    for sec in module.secrets.secrets:
      trimprefix(sec.name, "/${local.service_name}-${var.environment}/") => sec.arn
  }

  # TODO: task_secrets don't seem to correspond with 'parameter_store_secrets'. What is the difference?
  task_secrets = [
    { "name": "CHS_DEVELOPER_CLIENT_ID", "valueFrom": "${local.secrets_arn_map.web-oauth2-client-id}" },  # TODO Where is this used?
    { "name": "CHS_DEVELOPER_CLIENT_SECRET", "valueFrom": "${local.secrets_arn_map.web-oauth2-client-secret}" }, # TODO Where is this used?
    { "name": "COOKIE_SECRET", "valueFrom": "${local.secrets_arn_map.web-oauth2-cookie-secret}" },
    { "name": "DEVELOPER_OAUTH2_REQUEST_KEY", "valueFrom": "${local.secrets_arn_map.web-oauth2-request-key}" }, # TODO Where is this used?
    { "name": "CHS_API_KEY", "valueFrom": "${local.service_secrets_arn_map.chs_api_key}" },
    { "name": "CACHE_SERVER", "valueFrom": "${local.service_secrets_arn_map.cache_server}" },
    { "name": "OAUTH2_REDIRECT_URI", "valueFrom": "${local.service_secrets_arn_map.oauth2_redirect_uri}" },  # TODO Not found in OE or CS Web config. Is this needed? 
    { "name": "OAUTH2_AUTH_URI", "valueFrom": "${local.service_secrets_arn_map.oauth2_auth_uri}" }, # TODO Not found in OE or CS Web config. Is this needed? 
    { "name": "OAUTH2_CLIENT_ID", "valueFrom": "${local.service_secrets_arn_map.oauth2_client_id}" },  
    { "name": "OAUTH2_CLIENT_SECRET", "valueFrom": "${local.service_secrets_arn_map.oauth2_client_secret}" },
    { "name": "ACCOUNT_URL", "valueFrom": "${local.service_secrets_arn_map.account_url}" },
    { "name": "ACCOUNT_TEST_URL", "valueFrom": "${local.service_secrets_arn_map.account_test_url}" }, # TODO Not found in OE or CS Web config. Is this needed? 
    { "name": "INTERNAL_API_URL", "valueFrom": "${local.service_secrets_arn_map.internal_api_url}" },
    { "name": "PAYMENTS_API_URL", "valueFrom": "${local.service_secrets_arn_map.payments_api_url}" }
  ]

  task_environment = [
    { "name": "NODE_PORT", "value": "${local.container_port}" },  # TODO Is this needed?
    { "name": "LOG_LEVEL", "value": "${var.log_level}" },
    { "name": "CHS_URL", "value": "${var.chs_url}" },
    { "name": "PIWIK_URL", "value": "${var.piwik_url}" },
    { "name": "PIWIK_SITE_ID", "value": "${var.piwik_site_id}" },
    { "name": "REDIRECT_URI", "value": "${var.redirect_uri}" }, # TODO Is this needed?
    { "name": "CDN_HOST", "value": "//${var.cdn_host}" },
    { "name": "CACHE_POOL_SIZE", "value": "${var.cache_pool_size}" }, # TODO Is this needed?
    { "name": "COOKIE_DOMAIN", "value": "${var.cookie_domain}" },
    { "name": "COOKIE_NAME", "value": "${var.cookie_name}" },
    { "name": "COOKIE_SECURE_ONLY", "value": "${var.cookie_secure_only}" }, # TODO Does this match COOKIE_SECRET in docker yaml file.
    { "name": "DEFAULT_SESSION_EXPIRATION", "value": "${var.default_session_expiration}" }, # TODO Is this needed?
    { "name": "APPLICATIONS_API_URL", "value": "${var.account_local_url}" }, # TODO Is this needed?
    { "name": "PIWIK_START_GOAL_ID", "value": "${var.piwik_start_goal_id}" },
    { "name": "PIWIK_UPDATE_START_GOAL_ID", "value": "${var.piwik_update_start_goal_id}" },
    { "name": "SHOW_SERVICE_OFFLINE_PAGE", "value": "${var.show_service_offline_page}" },
    { "name": "FEATURE_FLAG_ENABLE_REFRESH_TOKEN_29092022", "value": "${var.feature_flag_enable_refresh_token_29092022}" },
    { "name": "FEATURE_FLAG_ENABLE_SAVE_AND_RESUME_17102022", "value": "${var.feature_flag_enable_save_and_resume_17102022}" },
    { "name": "FEATURE_FLAG_ENABLE_ROE_UPDATE_24112022", "value": "${var.feature_flag_enable_roe_update_24112022}" },
    { "name": "FEATURE_FLAG_ENABLE_ROE_REMOVE_24112022", "value": "${var.feature_flag_enable_roe_remove_24112022}" },
    { "name": "FEATURE_FLAG_ENABLE_TRUSTS_WEB_07112022", "value": "${var.feature_flag_enable_trusts_web_07112022}" },
    { "name": "FEATURE_FLAG_ENABLE_UPDATE_SAVE_AND_RESUME_07032023", "value": "${var.feature_flag_enable_update_save_and_resume_07032023}" },
    { "name": "FEATURE_FLAG_DISABLE_UPDATE_PRIVATE_DATA_FETCH_28062023", "value": "${var.feature_flag_disable_update_private_data_fetch_28062023}" },
    { "name": "FEATURE_FLAG_ENABLE_UPDATE_TRUSTS_30062023", "value": "${var.feature_flag_enable_update_trusts_30062023}" },
    { "name": "LANDING_PAGE_URL", "value": "${var.landing_page_url}" },
    { "name": "LANDING_PAGE_STARTING_NEW_URL", "value": "${var.landing_page_starting_new_url}" },
    { "name": "PAYMENT_FEE", "value": "${var.payment_fee}" },
    { "name": "UPDATE_LANDING_PAGE_URL", "value": "${var.update_landing_page_url}" },
    { "name": "UPDATE_PAYMENT_FEE", "value": "${var.update_payment_fee}" },
    { "name": "VF01_FORM_DOWNLOAD_URL", "value": "${var.vf01_form_download_url}" }, 
    { "name": "API_URL", "value": "${var.api_url}" } # TODO Should this be a secret?
  ]
}