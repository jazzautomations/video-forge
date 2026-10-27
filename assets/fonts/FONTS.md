# Vendored fonts

All fonts here are licensed under the **SIL Open Font License 1.1** (see `OFL.txt`),
which explicitly permits bundling, embedding and redistribution with software. They
were subsetted (Basic Latin + Latin-1 Supplement + Latin Extended-A + common
typographic punctuation — full Portuguese/Spanish/English coverage) and converted to
`.woff2` locally with `fontTools`; the glyph outlines are unmodified.

**No Reserved Font Names are used.** These families carry no RFN in their OFL headers,
so the subsetted copies keep their original family names without violating clause 3.

| Family | Role | Weights | Copyright |
|---|---|---|---|
| Inter | text / display | 400 600 700 800 | © 2016 The Inter Project Authors (github.com/rsms/inter) |
| Space Grotesk | display | 400 500 700 | © 2020 Florian Karsten |
| JetBrains Mono | display + text (mono) | 400 500 700 | © 2020 The JetBrains Mono Project Authors |
| Noto Serif | text | 400 700 | © 2022 The Noto Project Authors (github.com/notofonts) |
| Noto Serif Display | display | 400 600 700 | © 2022 The Noto Project Authors (github.com/notofonts) |
| Bricolage Grotesque | display | 500 800 | © 2022 The Bricolage Grotesque Project Authors (github.com/ateliertriay/bricolage) |

Bricolage Grotesque is a variable font upstream; the vendored weights are static
instances at `opsz=96, wdth=100`.

The license text (`OFL.txt`) is copied into every generated project's
`public/fonts/` alongside the `.woff2` files, so the license always travels with the
fonts as clause 2 requires.
