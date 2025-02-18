/**
 * Telegram Bot Server Constants
 */
export const TelegramServerConstant = {
  WEBHOOK_TIMEOUT_MS: 30000,
  HTTP_STATUS_OK: 200,
  HTTP_STATUS_ERROR: 500,
} as const;

export const TelegramEnvField: string[] = [
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_PUBLIC_URL',
  'TELEGRAM_BOT_PORT',
];
