# stremio-addon-linter

Checks the validity of Stremio add-ons. Used by `stremio-addon-sdk`.

## Usage

#### `linter.lintManifest(manifest)`

Checks the validity of a manifest.

Returns `{ valid: true, errors: [] }` if the manifest is valid

Returns `{ valid: false, errors: [...] }` if errors were found

