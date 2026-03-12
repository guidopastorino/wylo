export function getEnv(name: string): string {
  const v = process.env[name];
  if (v === undefined || v === "") {
    throw new Error(`Missing required env: ${name}`);
  }
  return v;
}

export function getEnvOptional(name: string): string {
  return process.env[name] ?? "";
}
