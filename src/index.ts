import { Plugin } from "@opencode/plugin"

const MAX = 8
const OMITTED = "[earlier image omitted]"

type Part = any

const mediaType = (part: Part) =>
  part?.type === "media" ? (part.mediaType ?? part.media?.mediaType) : undefined

const isImage = (part: Part) => {
  const mime = mediaType(part)
  return typeof mime === "string" && mime.startsWith("image/")
}

const isImageFile = (part: Part) =>
  part?.type === "file" && typeof part.mime === "string" && part.mime.startsWith("image/")

function countImages(messages: Part[]) {
  let count = 0
  for (const m of messages) {
    for (const p of m.content ?? []) {
      if (isImage(p)) count++
      if (p?.type === "tool-result" && p.result?.type === "content") {
        count += p.result.value.filter(isImageFile).length
      }
    }
  }
  return count
}

function capImages(messages: Part[], max: number) {
  let excess = countImages(messages) - max
  if (excess <= 0) return

  for (const m of messages) {
    if (!Array.isArray(m.content)) continue
    for (let i = 0; i < m.content.length && excess > 0; i++) {
      const p = m.content[i]
      if (isImage(p)) {
        m.content[i] = { type: "text", text: OMITTED }
        excess--
      } else if (p?.type === "tool-result" && p.result?.type === "content") {
        p.result.value = p.result.value.map((entry: Part) => {
          if (excess > 0 && isImageFile(entry)) {
            excess--
            return { type: "text", text: OMITTED }
          }
          return entry
        })
      }
    }
    if (excess === 0) break
  }
}

export default Plugin.define({
  id: "mistral.image-cap",
  async setup(ctx) {
    const configured = Number(ctx.options.maxImages ?? MAX)
    const max = Number.isInteger(configured) && configured >= 0 ? configured : MAX

    // Mistral counts images across the whole request. Keep the newest images
    // and replace older ones with text; stored session history is unchanged.
    const cap = (event: { model: { providerID: string }; messages: Part[] }) => {
      if (event.model.providerID !== "mistral") return
      capImages(event.messages, max)
    }

    await ctx.session.hook("context", cap)
    await ctx.session.hook("compaction", cap)
    await ctx.session.hook("generate", cap)
  },
})
