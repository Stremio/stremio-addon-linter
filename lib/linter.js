const semver = require('semver')

function lintManifest(manifest) {
	let errors = []

	if (!manifest || typeof(manifest) != 'object')
		return { valid: false, errors: [new Error('manifest should be an object')] } 

	if (typeof(manifest.id) != 'string')
		errors.push(new Error('manifest.id should be a string'))
	
	if (typeof(manifest.name) != 'string')
		errors.push(new Error('manifest.name should be a string'))

	if (typeof(manifest.version) != 'string')
		errors.push(new Error('manifest.version should be a string'))

	if (! Array.isArray(manifest.resources))
		errors.push(new Error('manifest.resources should be an array'))

	if (! Array.isArray(manifest.types))
		errors.push(new Error('manifest.types should be an array'))

	return { valid: !errors.length, errors: errors }
}

module.exports = {
	lintManifest: lintManifest
}
