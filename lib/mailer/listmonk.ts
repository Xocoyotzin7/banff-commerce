type TransactionalEmailInput = {
  to: string
  templateId: number
  data: Record<string, unknown>
}

function resolveListmonkConfig() {
  const url = process.env.LISTMONK_URL?.trim() ?? ""
  const username = process.env.LISTMONK_USERNAME?.trim() ?? ""
  const password = process.env.LISTMONK_PASSWORD?.trim() ?? ""

  return {
    url: url.replace(/\/+$/, ""),
    username,
    password,
  }
}

function buildAuthHeader(username: string, password: string): string {
  return `Basic ${Buffer.from(`${username}:${password}`, "utf8").toString("base64")}`
}

export async function sendTransactionalEmail(opts: TransactionalEmailInput): Promise<void> {
  try {
    const { url, username, password } = resolveListmonkConfig()

    if (!url || !username || !password) {
      console.warn("[listmonk] Missing configuration, skipping transactional email")
      return
    }

    const response = await fetch(`${url}/api/tx`, {
      method: "POST",
      headers: {
        Authorization: buildAuthHeader(username, password),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscriber_email: opts.to,
        template_id: opts.templateId,
        data: opts.data,
      }),
    })

    if (!response.ok) {
      const body = await response.text().catch(() => "")
      console.error("[listmonk] Transactional email failed", response.status, body)
    }
  } catch (error) {
    console.error("[listmonk] Transactional email error", error)
  }
}
