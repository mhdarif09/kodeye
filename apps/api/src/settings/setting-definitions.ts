import { SettingCategory, SettingValueType } from '@prisma/client';

export interface SettingDefinition {
  key: string;
  label: string;
  category: SettingCategory;
  valueType: SettingValueType;
  description: string;
  isSecret?: boolean;
  envKey?: string;
  defaultValue?: string;
  requiredInProduction?: boolean;
  restartRequired?: boolean;
  whereToGet: string;
  exampleValue: string;
  setupStep: string;
  docsAnchor: string;
}

const APP = SettingCategory.APP;
const GITHUB = SettingCategory.GITHUB;
const MIDTRANS = SettingCategory.MIDTRANS;
const PAYPAL = SettingCategory.PAYPAL;
const BILLING = SettingCategory.BILLING;
const CURRENCY = SettingCategory.CURRENCY;
const SCANNER = SettingCategory.SCANNER;
const REPORT = SettingCategory.REPORT;
const INVOICE = SettingCategory.INVOICE;
const SECURITY = SettingCategory.SECURITY;

const STRING = SettingValueType.STRING;
const NUMBER = SettingValueType.NUMBER;
const BOOLEAN = SettingValueType.BOOLEAN;
const SECRET = SettingValueType.SECRET;

function setting(
  key: string,
  category: SettingCategory,
  valueType: SettingValueType,
  label: string,
  description: string,
  options: Partial<SettingDefinition> = {},
): SettingDefinition {
  return {
    docsAnchor: key.toLowerCase().replaceAll('_', '-'),
    envKey: key,
    exampleValue: '',
    isSecret: valueType === SECRET,
    setupStep: 'Isi nilai ini dari dashboard admin sesuai kategori.',
    whereToGet: 'Lihat dokumentasi setup Kodeye untuk sumber credential ini.',
    ...options,
    category,
    description,
    key,
    label,
    valueType,
  };
}

export const SETTING_DEFINITIONS: SettingDefinition[] = [
  setting('APP_URL', APP, STRING, 'App URL', 'Public app URL.', {
    defaultValue: 'http://localhost:3000',
    exampleValue: 'http://localhost:3000',
    whereToGet: 'Domain frontend Kodeye.',
  }),
  setting('FRONTEND_URL', APP, STRING, 'Frontend URL', 'Frontend base URL.', {
    defaultValue: 'http://localhost:3000',
    exampleValue: 'http://localhost:3000',
    whereToGet: 'Domain frontend Kodeye.',
  }),
  setting('API_URL', APP, STRING, 'API URL', 'Backend API base URL.', {
    defaultValue: 'http://127.0.0.1:3001',
    exampleValue: 'http://127.0.0.1:3001',
    whereToGet: 'Domain backend Kodeye.',
  }),
  setting(
    'API_DOCS_ENABLED',
    SECURITY,
    BOOLEAN,
    'API Docs Enabled',
    'Enable Swagger API documentation. Keep disabled in production unless access is restricted.',
    {
      defaultValue: 'false',
      exampleValue: 'false',
      restartRequired: true,
      whereToGet: 'Security policy for the deployed API.',
    },
  ),
  setting(
    'API_MAX_BODY_BYTES',
    SECURITY,
    NUMBER,
    'API Max Body Bytes',
    'Maximum request body size accepted before validation.',
    {
      defaultValue: '1048576',
      exampleValue: '1048576',
      restartRequired: true,
      whereToGet: 'Backend capacity and upload policy.',
    },
  ),
  setting(
    'CORS_ORIGIN',
    APP,
    STRING,
    'CORS Origin',
    'Allowed frontend origin.',
    {
      defaultValue: 'http://localhost:3000',
      exampleValue: 'http://localhost:3000',
      whereToGet: 'Origin frontend yang boleh memanggil API.',
    },
  ),
  setting(
    'WORKSPACE_STORAGE_DIR',
    APP,
    STRING,
    'Workspace Storage Dir',
    'Persistent storage directory for AI editor workspaces.',
    {
      defaultValue: './tmp/workspaces',
      exampleValue: './tmp/workspaces',
      restartRequired: true,
      whereToGet: 'Server path or mounted volume for editable workspaces.',
    },
  ),
  setting(
    'PAYMENT_SUCCESS_URL',
    APP,
    STRING,
    'Payment Success URL',
    'Frontend URL after successful payment.',
    { exampleValue: 'http://localhost:3000/dashboard/billing?status=success' },
  ),
  setting(
    'PAYMENT_PENDING_URL',
    APP,
    STRING,
    'Payment Pending URL',
    'Frontend URL after pending payment.',
    { exampleValue: 'http://localhost:3000/dashboard/billing?status=pending' },
  ),
  setting(
    'PAYMENT_ERROR_URL',
    APP,
    STRING,
    'Payment Error URL',
    'Frontend URL after failed or canceled payment.',
    { exampleValue: 'http://localhost:3000/dashboard/billing?status=error' },
  ),
  setting(
    'FRONTEND_BILLING_URL',
    APP,
    STRING,
    'Frontend Billing URL',
    'Billing page URL.',
    { exampleValue: 'http://localhost:3000/dashboard/billing' },
  ),

  setting(
    'GITHUB_OAUTH_CLIENT_ID',
    GITHUB,
    STRING,
    'OAuth Client ID',
    'Client ID from GitHub OAuth App.',
    {
      exampleValue: 'Ov23lixxxxxxxxxxxx',
      requiredInProduction: true,
      setupStep: 'Create GitHub OAuth App and copy Client ID.',
      whereToGet:
        'GitHub Settings -> Developer settings -> OAuth Apps -> Client ID.',
    },
  ),
  setting(
    'GITHUB_OAUTH_CLIENT_SECRET',
    GITHUB,
    SECRET,
    'OAuth Client Secret',
    'Secret from GitHub OAuth App.',
    {
      exampleValue: 'gho_xxxxxxxxxxxxxxxxxxxx',
      requiredInProduction: true,
      whereToGet:
        'GitHub Settings -> Developer settings -> OAuth Apps -> Client secrets.',
    },
  ),
  setting(
    'GITHUB_OAUTH_CALLBACK_URL',
    GITHUB,
    STRING,
    'OAuth Callback URL',
    'Backend OAuth callback URL.',
    { exampleValue: 'http://127.0.0.1:3001/api/auth/github/callback' },
  ),
  setting('GITHUB_APP_ID', GITHUB, STRING, 'GitHub App ID', 'GitHub App ID.', {
    exampleValue: '123456',
    requiredInProduction: true,
    whereToGet: 'GitHub App settings -> App ID.',
  }),
  setting('GITHUB_APP_NAME', GITHUB, STRING, 'GitHub App Name', 'App name.', {
    exampleValue: 'Kodeye Local',
  }),
  setting(
    'GITHUB_APP_WEBHOOK_SECRET',
    GITHUB,
    SECRET,
    'Webhook Secret',
    'Secret used to verify GitHub webhook signatures.',
    {
      exampleValue: 'long-random-string',
      requiredInProduction: true,
      whereToGet:
        'Create a random string and paste it into GitHub App webhook secret.',
    },
  ),
  setting(
    'GITHUB_APP_INSTALL_URL',
    GITHUB,
    STRING,
    'Install URL',
    'GitHub App installation URL.',
    { exampleValue: 'https://github.com/apps/kodeye-local/installations/new' },
  ),
  setting(
    'GITHUB_APP_CALLBACK_URL',
    GITHUB,
    STRING,
    'App Callback URL',
    'GitHub App setup callback URL.',
    { exampleValue: 'https://xxxx.ngrok-free.app/api/github/install/callback' },
  ),
  setting(
    'GITHUB_WEBHOOK_ENABLED',
    GITHUB,
    BOOLEAN,
    'Webhook Enabled',
    'Enable GitHub webhook processing.',
    { defaultValue: 'true', exampleValue: 'true' },
  ),
  setting(
    'GITHUB_CHECK_NAME',
    GITHUB,
    STRING,
    'Check Name',
    'Check Run name.',
    {
      defaultValue: 'Kodeye Security Scan',
      exampleValue: 'Kodeye Security Scan',
    },
  ),
  setting(
    'GITHUB_CHECK_DETAILS_BASE_URL',
    GITHUB,
    STRING,
    'Check Details URL',
    'Frontend base URL for GitHub Check details.',
    { exampleValue: 'http://localhost:3000/dashboard/scans' },
  ),
  setting(
    'GITHUB_TOKEN',
    GITHUB,
    SECRET,
    'GitHub Access Token',
    'Optional token for future GitHub API automation.',
    { exampleValue: 'github_pat_xxxxxxxxxxxx' },
  ),

  setting(
    'MIDTRANS_IS_PRODUCTION',
    MIDTRANS,
    BOOLEAN,
    'Production Mode',
    'Use production Midtrans endpoint when true.',
    { defaultValue: 'false', exampleValue: 'false' },
  ),
  setting(
    'MIDTRANS_SERVER_KEY',
    MIDTRANS,
    SECRET,
    'Server Key',
    'Server key used only by backend.',
    {
      exampleValue: 'SB-Mid-server-xxxxxxxx',
      whereToGet:
        'Midtrans Dashboard -> Settings -> Access Keys -> Server Key.',
    },
  ),
  setting(
    'MIDTRANS_CLIENT_KEY',
    MIDTRANS,
    STRING,
    'Client Key',
    'Client key used by optional Snap frontend integrations.',
    {
      exampleValue: 'SB-Mid-client-xxxxxxxx',
      whereToGet:
        'Midtrans Dashboard -> Settings -> Access Keys -> Client Key.',
    },
  ),
  setting(
    'MIDTRANS_MERCHANT_ID',
    MIDTRANS,
    STRING,
    'Merchant ID',
    'Midtrans merchant identifier.',
    { exampleValue: 'G123456789' },
  ),
  setting(
    'MIDTRANS_NOTIFICATION_SECRET',
    MIDTRANS,
    SECRET,
    'Notification Secret',
    'Optional notification secret for webhook hardening.',
    { exampleValue: 'long-random-string' },
  ),

  setting(
    'PAYPAL_ENVIRONMENT',
    PAYPAL,
    STRING,
    'Environment',
    'sandbox or live.',
    {
      defaultValue: 'sandbox',
      exampleValue: 'sandbox',
    },
  ),
  setting(
    'PAYPAL_CLIENT_ID',
    PAYPAL,
    STRING,
    'Client ID',
    'PayPal REST API client ID.',
    {
      exampleValue: 'AYxxxxxxxxxxxx',
      whereToGet:
        'PayPal Developer Dashboard -> Apps & Credentials -> Client ID.',
    },
  ),
  setting(
    'PAYPAL_CLIENT_SECRET',
    PAYPAL,
    SECRET,
    'Client Secret',
    'PayPal REST API client secret.',
    {
      exampleValue: 'Exxxxxxxxxxxx',
      whereToGet: 'PayPal Developer Dashboard -> Apps & Credentials -> Secret.',
    },
  ),
  setting('PAYPAL_WEBHOOK_ID', PAYPAL, SECRET, 'Webhook ID', 'Webhook ID.', {
    exampleValue: 'WH-xxxxxxxxxxxx',
  }),
  setting(
    'PAYPAL_SUPPORTED_CURRENCIES',
    PAYPAL,
    STRING,
    'Supported Currencies',
    'Comma-separated PayPal checkout currencies.',
    { defaultValue: 'USD,EUR,SGD', exampleValue: 'USD,EUR,SGD' },
  ),

  setting(
    'BILLING_TAX_ENABLED',
    BILLING,
    BOOLEAN,
    'Tax Enabled',
    'Enable tax.',
    {
      defaultValue: 'true',
      exampleValue: 'true',
    },
  ),
  setting(
    'BILLING_DEFAULT_TAX_RATE',
    BILLING,
    NUMBER,
    'Default Tax Rate',
    'Tax rate as decimal between 0 and 1.',
    { defaultValue: '0.11', exampleValue: '0.11' },
  ),
  setting('BILLING_TAX_LABEL', BILLING, STRING, 'Tax Label', 'Tax label.', {
    defaultValue: 'PPN',
    exampleValue: 'PPN',
  }),
  setting(
    'BILLING_DEFAULT_CURRENCY',
    CURRENCY,
    STRING,
    'Default Currency',
    'Default billing currency.',
    { defaultValue: 'IDR', exampleValue: 'IDR' },
  ),
  setting(
    'BILLING_SUPPORTED_CURRENCIES',
    CURRENCY,
    STRING,
    'Supported Currencies',
    'Supported display currencies.',
    { defaultValue: 'IDR,USD,EUR,SGD', exampleValue: 'IDR,USD,EUR,SGD' },
  ),
  setting(
    'BILLING_USE_LIVE_CURRENCY',
    CURRENCY,
    BOOLEAN,
    'Use Live FX',
    'Use live currency conversion for non-IDR pricing.',
    { defaultValue: 'true', exampleValue: 'true' },
  ),
  setting(
    'BILLING_EXCHANGE_RATE_PROVIDER',
    CURRENCY,
    STRING,
    'FX Provider',
    'Exchange rate provider.',
    { defaultValue: 'frankfurter', exampleValue: 'frankfurter' },
  ),
  setting(
    'BILLING_EXCHANGE_RATE_CACHE_TTL_HOURS',
    CURRENCY,
    NUMBER,
    'FX Cache TTL Hours',
    'Exchange-rate cache lifetime in hours.',
    { defaultValue: '24', exampleValue: '24' },
  ),
  setting(
    'BILLING_ALLOW_STALE_EXCHANGE_RATE',
    CURRENCY,
    BOOLEAN,
    'Allow Stale FX',
    'Allow stale cached exchange rates.',
    { defaultValue: 'true', exampleValue: 'true' },
  ),

  setting(
    'SCAN_WORKER_ENABLED',
    SCANNER,
    BOOLEAN,
    'Worker Enabled',
    'Enable scanner worker.',
    {
      defaultValue: 'true',
      exampleValue: 'true',
    },
  ),
  setting(
    'AUTO_SCAN_ON_SYNC_ENABLED',
    SCANNER,
    BOOLEAN,
    'Audit On GitHub Sync',
    'Queue an initial full-repository audit after a GitHub repository is connected.',
    {
      defaultValue: 'true',
      exampleValue: 'true',
    },
  ),
  setting(
    'SCAN_WORKER_POLL_INTERVAL_MS',
    SCANNER,
    NUMBER,
    'Poll Interval',
    'Worker polling interval in milliseconds.',
    { defaultValue: '5000', exampleValue: '5000' },
  ),
  setting(
    'SCAN_WORKER_MAX_CONCURRENCY',
    SCANNER,
    NUMBER,
    'Max Concurrency',
    'Worker scan concurrency.',
    { defaultValue: '1', exampleValue: '1' },
  ),
  setting(
    'SCAN_WORKER_TEMP_DIR',
    SCANNER,
    STRING,
    'Temp Directory',
    'Worker temp directory.',
    {
      defaultValue: './tmp/scans',
      exampleValue: './tmp/scans',
    },
  ),
  setting(
    'SCANNER_EXECUTION_MODE',
    SCANNER,
    STRING,
    'Execution Mode',
    'Scanner execution mode.',
    { defaultValue: 'local-cli', exampleValue: 'local-cli' },
  ),
  setting(
    'SCANNER_CODEQL_BIN',
    SCANNER,
    STRING,
    'CodeQL Binary',
    'CodeQL executable.',
    {
      defaultValue: 'codeql',
      exampleValue: 'codeql',
    },
  ),
  setting(
    'SCANNER_CODEQL_LANGUAGES',
    SCANNER,
    STRING,
    'CodeQL Languages',
    'Comma-separated CodeQL languages to analyze when matching source files are detected.',
    {
      defaultValue: 'javascript-typescript,python,go,java-kotlin,csharp,ruby',
      exampleValue: 'javascript-typescript,python,go',
    },
  ),
  setting(
    'SCANNER_CODEQL_QUERIES',
    SCANNER,
    STRING,
    'CodeQL Queries',
    'Optional comma-separated CodeQL query packs or suites. Leave empty to use each language security-and-quality suite.',
    {
      defaultValue: '',
      exampleValue:
        'codeql/javascript-queries:codeql-suites/javascript-security-and-quality.qls',
    },
  ),
  setting(
    'SCANNER_SEMGREP_BIN',
    SCANNER,
    STRING,
    'Semgrep Binary',
    'Semgrep executable.',
    {
      defaultValue: 'semgrep',
      exampleValue: 'semgrep',
    },
  ),
  setting(
    'SCANNER_SEMGREP_CONFIGS',
    SCANNER,
    STRING,
    'Semgrep Rulesets',
    'Comma-separated Semgrep Registry rulesets used for SAST and OWASP analysis.',
    {
      defaultValue:
        'p/default,p/security-audit,p/owasp-top-ten,p/cwe-top-25,p/secrets',
      exampleValue:
        'p/default,p/security-audit,p/owasp-top-ten,p/cwe-top-25,p/secrets',
    },
  ),
  setting(
    'SCANNER_SEMGREP_INCLUDE_IGNORED',
    SCANNER,
    BOOLEAN,
    'Semgrep Include Ignored Files',
    'Scan the full cloned repository tree with Semgrep instead of skipping files only because they match .gitignore.',
    {
      defaultValue: 'true',
      exampleValue: 'true',
    },
  ),
  setting(
    'SCANNER_SEMGREP_JOBS',
    SCANNER,
    NUMBER,
    'Semgrep Jobs',
    'Parallel Semgrep jobs for faster scans.',
    {
      defaultValue: '4',
      exampleValue: '4',
    },
  ),
  setting(
    'SCANNER_SEMGREP_MAX_TARGET_BYTES',
    SCANNER,
    NUMBER,
    'Semgrep Max Target Bytes',
    'Maximum single file size Semgrep will scan.',
    {
      defaultValue: '1000000',
      exampleValue: '1000000',
    },
  ),
  setting(
    'SCANNER_SEMGREP_PRO',
    SCANNER,
    BOOLEAN,
    'Semgrep Pro Engine',
    'Enable Semgrep Pro engine flags when the worker is authenticated with Semgrep.',
    {
      defaultValue: 'false',
      exampleValue: 'false',
    },
  ),
  setting(
    'SCANNER_SEMGREP_TIMEOUT_SECONDS',
    SCANNER,
    NUMBER,
    'Semgrep Rule Timeout',
    'Per-rule Semgrep timeout in seconds.',
    {
      defaultValue: '60',
      exampleValue: '60',
    },
  ),
  setting(
    'SCANNER_GITLEAKS_BIN',
    SCANNER,
    STRING,
    'Gitleaks Binary',
    'Gitleaks executable.',
    {
      defaultValue: 'gitleaks',
      exampleValue: 'gitleaks',
    },
  ),
  setting(
    'SCANNER_STORE_CODE_EVIDENCE',
    SCANNER,
    BOOLEAN,
    'Store Code Evidence',
    'Persist masked source snippets with findings. Keep disabled for zero-retention source processing.',
    {
      defaultValue: 'false',
      exampleValue: 'false',
    },
  ),
  setting(
    'SCANNER_TRIVY_BIN',
    SCANNER,
    STRING,
    'Trivy Binary',
    'Trivy executable.',
    {
      defaultValue: 'trivy',
      exampleValue: 'trivy',
    },
  ),
  setting(
    'SCANNER_TRIVY_SCANNERS',
    SCANNER,
    STRING,
    'Trivy Scanners',
    'Comma-separated Trivy filesystem scanners.',
    {
      defaultValue: 'vuln,misconfig,secret',
      exampleValue: 'vuln,misconfig,secret',
    },
  ),
  setting(
    'SCANNER_TIMEOUT_MS',
    SCANNER,
    NUMBER,
    'Scanner Timeout',
    'Scanner timeout in ms.',
    {
      defaultValue: '900000',
      exampleValue: '900000',
    },
  ),

  setting(
    'REPORT_STORAGE_DIR',
    REPORT,
    STRING,
    'Report Storage Dir',
    'Generated reports directory.',
    {
      defaultValue: './tmp/reports',
      exampleValue: './tmp/reports',
    },
  ),
  setting(
    'REPORT_ENABLE_PDF',
    REPORT,
    BOOLEAN,
    'PDF Enabled',
    'Enable report PDF generation.',
    {
      defaultValue: 'true',
      exampleValue: 'true',
    },
  ),
  setting(
    'INVOICE_STORAGE_DIR',
    INVOICE,
    STRING,
    'Invoice Storage Dir',
    'Generated invoices directory.',
    {
      defaultValue: './tmp/invoices',
      exampleValue: './tmp/invoices',
    },
  ),
  setting(
    'INVOICE_PDF_ENABLED',
    INVOICE,
    BOOLEAN,
    'Invoice PDF Enabled',
    'Enable invoice PDF generation.',
    {
      defaultValue: 'true',
      exampleValue: 'true',
    },
  ),
  setting(
    'PUPPETEER_EXECUTABLE_PATH',
    REPORT,
    STRING,
    'Browser Executable Path',
    'Optional Chromium/Chrome executable path.',
    {
      exampleValue:
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    },
  ),

  setting(
    'JWT_EXPIRES_IN',
    SECURITY,
    STRING,
    'JWT Expires In',
    'JWT expiry duration.',
    {
      defaultValue: '7d',
      exampleValue: '7d',
      restartRequired: true,
    },
  ),
  setting(
    'RATE_LIMIT_ENABLED',
    SECURITY,
    BOOLEAN,
    'Rate Limit Enabled',
    'Enable rate limiting.',
    {
      defaultValue: 'false',
      exampleValue: 'false',
    },
  ),
  setting(
    'RATE_LIMIT_WINDOW_MS',
    SECURITY,
    NUMBER,
    'Rate Limit Window',
    'Rate-limit window.',
    {
      defaultValue: '60000',
      exampleValue: '60000',
    },
  ),
  setting(
    'RATE_LIMIT_MAX',
    SECURITY,
    NUMBER,
    'Rate Limit Max',
    'Max requests per window.',
    {
      defaultValue: '120',
      exampleValue: '120',
    },
  ),
];

export const SETTING_KEYS = new Set(
  SETTING_DEFINITIONS.map((definition) => definition.key),
);

export const ENV_ONLY_SETTING_KEYS = new Set([
  'SETTINGS_ENCRYPTION_KEY',
  'APP_SETTINGS_ENCRYPTION_KEY',
  'DATABASE_URL',
  'MYSQL_ROOT_PASSWORD',
  'MYSQL_PASSWORD',
  'JWT_SECRET',
  'ADMIN_SEED_PASSWORD',
]);

export function getSettingDefinition(key: string) {
  return SETTING_DEFINITIONS.find((definition) => definition.key === key);
}
