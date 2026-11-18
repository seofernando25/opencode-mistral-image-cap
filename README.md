# opencode-mistral-image-cap

Keeps Mistral requests within the 8-image API limit. Older images become
`[earlier image omitted]`.

## Install

```sh
opencode plugin add github:seofernando25/opencode-mistral-image-cap
```

Optional: `maxImages` (default 8).

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

Only applies to `mistral`. Stored history is not modified.

## License

MIT
