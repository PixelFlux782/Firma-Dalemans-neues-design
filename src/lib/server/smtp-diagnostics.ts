import "server-only";

type SmtpErrorPhase = "connection" | "authentication" | "send";
type SmtpErrorType =
  | "authentication"
  | "connection"
  | "message"
  | "smtp_response"
  | "timeout"
  | "tls"
  | "unknown";

interface NodemailerErrorShape {
  code?: unknown;
  command?: unknown;
  responseCode?: unknown;
}

export interface SmtpFailureDiagnostic {
  smtpErrorCode: string;
  errorType: SmtpErrorType;
  smtpResponseCode?: number;
  errorPhase: SmtpErrorPhase;
}

const CONNECTION_CODES = new Set([
  "ECONNECTION",
  "ECONNREFUSED",
  "ECONNRESET",
  "EDNS",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "EPROTOCOL",
  "ESOCKET",
]);

function errorShape(error: unknown): NodemailerErrorShape {
  return error !== null && typeof error === "object"
    ? error as NodemailerErrorShape
    : {};
}

function safeErrorCode(value: unknown) {
  if (typeof value !== "string") return "UNKNOWN";
  const normalized = value.toUpperCase();
  return /^[A-Z][A-Z0-9_]{1,31}$/.test(normalized) ? normalized : "UNKNOWN";
}

function safeResponseCode(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value >= 100 && value <= 999
    ? value
    : undefined;
}

function errorPhase(code: string, commandValue: unknown): SmtpErrorPhase {
  const command = typeof commandValue === "string" ? commandValue.toUpperCase() : "";
  if (command.startsWith("AUTH") || code === "EAUTH") return "authentication";
  if (["CONN", "CONNECT", "EHLO", "HELO", "STARTTLS"].some((value) => command.startsWith(value))) {
    return "connection";
  }
  if (CONNECTION_CODES.has(code) || code === "ETIMEDOUT" || code === "ETLS") return "connection";
  return "send";
}

function errorType(code: string, responseCode: number | undefined): SmtpErrorType {
  if (code === "EAUTH") return "authentication";
  if (code === "ETIMEDOUT") return "timeout";
  if (code === "ETLS") return "tls";
  if (CONNECTION_CODES.has(code)) return "connection";
  if (code === "EENVELOPE" || code === "EMESSAGE") return "message";
  if (responseCode !== undefined) return "smtp_response";
  return "unknown";
}

export function smtpFailureDiagnostic(error: unknown): SmtpFailureDiagnostic {
  const shape = errorShape(error);
  const smtpErrorCode = safeErrorCode(shape.code);
  const smtpResponseCode = safeResponseCode(shape.responseCode);
  return {
    smtpErrorCode,
    errorType: errorType(smtpErrorCode, smtpResponseCode),
    ...(smtpResponseCode === undefined ? {} : { smtpResponseCode }),
    errorPhase: errorPhase(smtpErrorCode, shape.command),
  };
}

export function logSmtpFailure(
  route: "contact" | "inquiry",
  event: string,
  error: unknown,
) {
  // Intentionally log only normalized codes and classifications. Nodemailer's
  // message, response, command and rejected-recipient fields can contain
  // addresses, server details or credentials and must never reach the log.
  console.error(JSON.stringify({
    component: "form-delivery",
    route,
    event,
    ...smtpFailureDiagnostic(error),
  }));
}
