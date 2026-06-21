import { plainToInstance, Type } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsNumber()
  @Type(() => Number)
  API_PORT = 3001;

  @IsUrl({ require_tld: false })
  FRONTEND_URL = 'http://localhost:3000';

  @IsIn(['development', 'test', 'production'])
  NODE_ENV = 'development';

  @IsString()
  @IsNotEmpty()
  JWT_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  JWT_EXPIRES_IN!: string;

  @IsOptional()
  @IsString()
  GITHUB_OAUTH_CLIENT_ID?: string;

  @IsOptional()
  @IsString()
  GITHUB_OAUTH_CLIENT_SECRET?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  GITHUB_OAUTH_CALLBACK_URL?: string;

  @IsOptional()
  @IsString()
  GITHUB_APP_ID?: string;

  @IsOptional()
  @IsString()
  GITHUB_APP_NAME?: string;

  @IsOptional()
  @IsString()
  GITHUB_APP_PRIVATE_KEY_PATH?: string;

  @IsOptional()
  @IsString()
  GITHUB_APP_WEBHOOK_SECRET?: string;

  @IsOptional()
  @IsString()
  GITHUB_CHECK_NAME?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  GITHUB_CHECK_DETAILS_BASE_URL?: string;

  @IsOptional()
  @IsString()
  GITHUB_WEBHOOK_ENABLED?: string;

  @IsOptional()
  @IsString()
  AUTO_SCAN_PUSH_ENABLED?: string;

  @IsOptional()
  @IsString()
  AUTO_SCAN_PULL_REQUEST_ENABLED?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  GITHUB_APP_INSTALL_URL?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  GITHUB_APP_CALLBACK_URL?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  FRONTEND_AUTH_CALLBACK_URL?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  FRONTEND_GITHUB_INTEGRATION_URL?: string;

  @IsOptional()
  @IsString()
  REPORT_STORAGE_DIR?: string;

  @IsOptional()
  @IsString()
  WORKSPACE_STORAGE_DIR?: string;

  @IsOptional()
  @IsString()
  REPORT_ENABLE_PDF?: string;

  @IsOptional()
  @IsString()
  PUPPETEER_EXECUTABLE_PATH?: string;

  @IsOptional() @IsString() BILLING_TAX_ENABLED?: string;
  @IsOptional() @IsString() BILLING_DEFAULT_TAX_RATE?: string;
  @IsOptional() @IsString() BILLING_TAX_LABEL?: string;
  @IsOptional() @IsString() BILLING_DEFAULT_CURRENCY?: string;
  @IsOptional() @IsString() BILLING_SUPPORTED_CURRENCIES?: string;
  @IsOptional() @IsString() BILLING_USE_LIVE_CURRENCY?: string;
  @IsOptional() @IsString() BILLING_EXCHANGE_RATE_CACHE_TTL_HOURS?: string;
  @IsOptional() @IsString() BILLING_ALLOW_STALE_EXCHANGE_RATE?: string;
  @IsOptional() @IsString() MIDTRANS_SERVER_KEY?: string;
  @IsOptional() @IsString() MIDTRANS_CLIENT_KEY?: string;
  @IsOptional() @IsString() MIDTRANS_MERCHANT_ID?: string;
  @IsOptional() @IsString() MIDTRANS_NOTIFICATION_SECRET?: string;
  @IsOptional() @IsString() MIDTRANS_IS_PRODUCTION?: string;
  @IsOptional() @IsString() PAYPAL_ENVIRONMENT?: string;
  @IsOptional() @IsString() PAYPAL_CLIENT_ID?: string;
  @IsOptional() @IsString() PAYPAL_CLIENT_SECRET?: string;
  @IsOptional() @IsString() PAYPAL_WEBHOOK_ID?: string;
  @IsOptional() @IsString() PAYPAL_SUPPORTED_CURRENCIES?: string;
  @IsOptional() @IsString() GITHUB_TOKEN?: string;
  @IsOptional() @IsString() APP_SETTINGS_ENCRYPTION_KEY?: string;
  @IsOptional() @IsString() SETTINGS_ENCRYPTION_KEY?: string;
  @IsOptional() @IsString() SETTINGS_ENCRYPTION_KEY_VERSION?: string;
  @IsOptional() @IsString() SETTINGS_CACHE_TTL_SECONDS?: string;
  @IsOptional() @IsString() ADMIN_SEED_EMAIL?: string;
  @IsOptional() @IsString() ADMIN_SEED_PASSWORD?: string;
  @IsOptional() @IsString() ADMIN_SEED_NAME?: string;
  @IsOptional() @IsString() ADMIN_SEED_OVERWRITE?: string;
  @IsOptional() @IsUrl({ require_tld: false }) PAYMENT_SUCCESS_URL?: string;
  @IsOptional() @IsUrl({ require_tld: false }) PAYMENT_PENDING_URL?: string;
  @IsOptional() @IsUrl({ require_tld: false }) PAYMENT_ERROR_URL?: string;
  @IsOptional() @IsUrl({ require_tld: false }) FRONTEND_BILLING_URL?: string;
  @IsOptional() @IsString() INVOICE_STORAGE_DIR?: string;
  @IsOptional() @IsString() INVOICE_PDF_ENABLED?: string;
  @IsOptional() @IsString() APP_URL?: string;
  @IsOptional() @IsUrl({ require_tld: false }) API_URL?: string;
  @IsOptional() @IsString() API_DOCS_ENABLED?: string;
  @IsOptional() @IsString() API_MAX_BODY_BYTES?: string;
  @IsOptional() @IsString() CORS_ORIGIN?: string;
  @IsOptional() @IsString() SCAN_WORKER_ENABLED?: string;
  @IsOptional() @IsString() AUTO_SCAN_ON_SYNC_ENABLED?: string;
  @IsOptional() @IsString() SCAN_WORKER_POLL_INTERVAL_MS?: string;
  @IsOptional() @IsString() SCAN_WORKER_MAX_CONCURRENCY?: string;
  @IsOptional() @IsString() SCAN_WORKER_TEMP_DIR?: string;
  @IsOptional() @IsString() SCANNER_EXECUTION_MODE?: string;
  @IsOptional() @IsString() SCANNER_SEMGREP_BIN?: string;
  @IsOptional() @IsString() SCANNER_SEMGREP_CONFIGS?: string;
  @IsOptional() @IsString() SCANNER_SEMGREP_INCLUDE_IGNORED?: string;
  @IsOptional() @IsString() SCANNER_GITLEAKS_BIN?: string;
  @IsOptional() @IsString() SCANNER_TRIVY_BIN?: string;
  @IsOptional() @IsString() SCANNER_TRIVY_SCANNERS?: string;
  @IsOptional() @IsString() SCANNER_STORE_CODE_EVIDENCE?: string;
  @IsOptional() @IsString() SCANNER_TIMEOUT_MS?: string;
  @IsOptional() @IsString() RATE_LIMIT_ENABLED?: string;
  @IsOptional() @IsString() RATE_LIMIT_WINDOW_MS?: string;
  @IsOptional() @IsString() RATE_LIMIT_MAX?: string;
  @IsOptional() @IsString() REQUIRE_HTTPS?: string;
  @IsOptional() @IsString() AI_ENABLED?: string;
  @IsOptional() @IsString() GROQ_API_KEY?: string;
  @IsOptional() @IsString() GROQ_MODEL?: string;
  @IsOptional() @IsString() AI_MAX_COMPLETION_TOKENS?: string;
  @IsOptional() @IsString() AI_REQUEST_TIMEOUT_MS?: string;
  @IsOptional() @IsString() AI_FIX_MAX_COMPLETION_TOKENS?: string;
  @IsOptional() @IsString() AI_FIX_MAX_FILE_BYTES?: string;
  @IsOptional() @IsString() AI_GITHUB_WRITE_ENABLED?: string;
}

export function validateEnvironment(
  configuration: Record<string, unknown>,
): EnvironmentVariables {
  const normalizedConfiguration = { ...configuration };
  for (const [key, value] of Object.entries(normalizedConfiguration)) {
    if (
      (key.startsWith('GITHUB_') || key.startsWith('FRONTEND_')) &&
      value === ''
    ) {
      delete normalizedConfiguration[key];
    }
  }

  const validatedConfig = plainToInstance(
    EnvironmentVariables,
    normalizedConfiguration,
    {
      enableImplicitConversion: true,
    },
  );
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
