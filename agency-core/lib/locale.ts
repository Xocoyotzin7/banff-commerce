// Agency-owned locale primitives. Keep this module free of server-only APIs so
// the client app can import the locale model from shared UI and content code.
export type Locale = "en" | "fr" | "es"

export const locales: readonly Locale[] = ["en", "fr", "es"] as const
