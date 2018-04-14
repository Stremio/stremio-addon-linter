const semver = require('semver')

function lintManifest(manifest) {
	let errors = []

	if (!manifest || typeof(manifest) != 'object')
		return { valid: false, errors: [new Error('manifest should be an object')] } 
	
	if (typeof(manifest.name) != 'string')
		errors.push(new Error('manifest.name should be a string'))

	return { valid: !errors.length, errors: errors }
}

module.exports = {
	lintManifest: lintManifest
}
