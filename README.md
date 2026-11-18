# opencode-mistral-image-cap

OpenCode plugin that keeps Mistral requests within the API's 8-image limit.

Mistral counts images across the whole request. OpenCode resends conversation
history, so a session fails once it contains a ninth image. This plugin keeps
the newest images and replaces older ones with `[earlier image omitted]`.

Works with every model under the `mistral` provider, including DeepSeek and GLM.

## Install

```sh
opencode plugin add github:seofernando25/opencode-mistral-image-cap
```

## Configure

The default cap is 8. To change it:

```jsonc
{
  "plugins": [
    {
      "package": "opencode-mistral-image-cap",
      "options": { "maxImages": 6 }
    }
  ]
}
```

## Behavior

- Applies only when the selected provider is `mistral`.
- Covers `context`, `compaction`, and `generate` requests.
- Edits the outgoing request only; stored history is unchanged.

Tested with OpenCode 2.3.2 and `mistral/zai-glm-5-3-flash` and
`mistral/deepseek-v4-1-flash-1017`.

## License

MIT
