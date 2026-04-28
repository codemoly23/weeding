const REQUIRED_ENV_VARS = ["DATABASE_URL", "AUTH_SECRET"] as const;

export function validateEnv(): void {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}\n` +
        `Copy .env.example to .env and fill in the required values.`
    );
  }
}
