const semver = require('semver')

function lintManifest(manifest) {
	let errors = []

	if (!manifest || typeof(manifest) != 'object')
		return { valid: false, errors: [new Error('manifest must be an object')] } 

	if (typeof(manifest.id) != 'string')
		errors.push(new Error('manifest.id must be a string'))
	
	if (typeof(manifest.name) != 'string')
		errors.push(new Error('manifest.name must be a string'))

	if (typeof(manifest.version) != 'string' || !semver.valid(manifest.version))
		errors.push(new Error('manifest.version must be a valid semver version'))

	if (!Array.isArray(manifest.resources))
		errors.push(new Error('manifest.resources must be an array'))

	if (!Array.isArray(manifest.types))
		errors.push(new Error('manifest.types must be an array'))

	if (manifest.hasOwnProperty('catalogs') && !Array.isArray(manifest.catalogs))
		errors.push(new Error('manifest.catalogs must be an array'))

	if (manifest.hasOwnProperty('idPrefixes') && !Array.isArray(manifest.idPrefixes))
		errors.push(new Error('manifest.idPrefixes must be an array'))

	if (Array.isArray(manifest.catalogs)) manifest.catalogs.forEach(function(catalog, i) {
		// .type, .id are mandatory
		if (typeof(catalog.id) !== 'string' || typeof(catalog.type) !== 'string')
			errors.push(new Error('manifest.catalogs['+i+']: id and type must be string properties'))

		// .extraSupported and .extraRequired are optional but have to be arrays
	})

	return { valid: !errors.length, errors: errors }
}

module.exports = {
	lintManifest: lintManifest
}
