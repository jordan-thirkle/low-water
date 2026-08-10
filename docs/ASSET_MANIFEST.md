# Asset manifest

This manifest is part of the release gate. If an asset changes, update this file and keep its source licence file beside the asset where possible.

| Asset | Source | Licence / status | Use | Modification |
|---|---|---|---|---|
| `public/assets/generated/low-water-yard.png` | Project-specific image-generation pass in this workspace | Provider terms must be checked against the intended commercial release before shipping | Source-quality canal-yard playfield | None |
| `public/assets/generated/low-water-yard.jpg` | Delivery derivative of the project-specific yard image | Same provider clearance as source image | Browser-delivered canal-yard playfield | Optimized JPEG derivative for mobile/preview transfer |
| `public/assets/generated/low-water-player.png` | Project-specific image-generation pass in this workspace | Provider terms must be checked against the intended commercial release before shipping | Source-quality player sprite | Chroma-key background removed locally; RGBA |
| `public/assets/generated/low-water-player.webp` | Delivery derivative of the project-specific player image | Same provider clearance as source image | Browser-delivered player sprite | WebP quality 82 |
| `public/assets/generated/low-water-crow.png` | Project-specific image-generation pass in this workspace | Provider terms must be checked against the intended commercial release before shipping | Source-quality hazard sprite | Chroma-key background removed locally; RGBA |
| `public/assets/generated/low-water-crow.webp` | Delivery derivative of the project-specific crow image | Same provider clearance as source image | Browser-delivered hazard sprite | WebP quality 82 |
| `public/assets/generated/low-water-key.png` | Project-specific image-generation pass in this workspace | Provider terms must be checked against the intended commercial release before shipping | Source-quality found-object sprite | Chroma-key background removed locally; RGBA |
| `public/assets/generated/low-water-key.webp` | Delivery derivative of the project-specific key image | Same provider clearance as source image | Browser-delivered found-object sprite | WebP quality 82 |
| `public/assets/kenney/ui-pack/**` | [Kenney UI Pack](https://kenney.nl/assets/ui-pack) | CC0; attribution not required; optional credit recorded below | Included font and future UI asset source | Bundled from official download; source `License.txt` retained |
| `public/assets/kenney/tiny-town/**` | [Kenney Tiny Town](https://kenney.nl/assets/tiny-town) | CC0; attribution not required; optional credit recorded below | Curated 2D tile/prop source for future yard variants | Bundled from official download; source `License.txt` retained |
| `public/assets/kenney/roguelike-characters/**` | [Kenney Roguelike Characters](https://kenney.nl/assets/roguelike-characters) | CC0; attribution not required; optional credit recorded below | Curated character source for future kits | Bundled from official download; source `License.txt` retained |

## Recommended credit

`Art assets: Kenney — CC0 1.0. Attribution not required.`

Do not use the Kenney logo or imply endorsement. Keep the individual `License.txt` files in the bundle. Before launch, add an exact dependency SBOM and review every future sound, music track, font, model, texture, generated output, and npm package separately.
