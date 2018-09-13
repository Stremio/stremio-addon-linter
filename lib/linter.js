const semver = require('semver')

function lintManifest(manifest) {
	var errors = []

	if (!manifest || typeof(manifest) != 'object')
		return { valid: false, errors: [new Error('manifest must be an object')] } 

	assertString(manifest.id, 'manifest.id')
	assertString(manifest.name, 'manifest.name')
	assertSemver(manifest.version, 'manifest.version')

	// WARNING: if we want to go through resources in detail, we need to keep in mind it can be a string or {name, types, ?idPrefixes}
	assertArray(manifest.resources, 'manifest.resources')
	assertAllInSet(manifest.resources, ['catalog', 'meta', 'stream', 'subtitles'], 'manifest.resources')
	assertArray(manifest.types, 'manifest.types')
	assertAllInSet(manifest.types, ['movie', 'series', 'channel', 'tv', 'other'], 'manifest.types')
	
	if (manifest.hasOwnProperty('catalogs')) assertArray(manifest.catalogs, 'manifest.catalogs')
	if (manifest.hasOwnProperty('idPrefixes')) assertArray(manifest.idPrefixes, 'manifest.idPrefixes')
	
	if (Array.isArray(manifest.catalogs)) manifest.catalogs.forEach(function(catalog, i) {
		// .type, .id are mandatory
		if (typeof(catalog.id) !== 'string' || typeof(catalog.type) !== 'string')
			errors.push(new Error('manifest.catalogs['+i+']: id and type must be string properties'))

		// .extraSupported and .extraRequired are optional but have to be arrays
		if (catalog.hasOwnProperty('extraSupported')) assertArray(catalog.extraSupported, 'manifest.catalogs['+i+'].extraSupported')
		if (catalog.hasOwnProperty('extraRequired')) assertArray(catalog.extraRequired, 'manifest.catalogs['+i+'].extraRequired')
	})

	// Asserts
	function assertString(val, name) {
		if (typeof(val) !== 'string')
			errors.push(new Error(name+' must be a string'))
	}

	function assertSemver(val, name) {
		if (typeof(val) != 'string' || !semver.valid(val))
			errors.push(new Error(name+' must be a valid semver string'))
	}

	function assertArray(val, name) {
		if (!Array.isArray(val))
			errors.push(new Error(name+' must be an array'))
	}

	function assertAllInSet(val, set, name) {
		if (!Array.isArray(val)) return
		val.forEach(function(m) {
			if (!set.includes(m))
				errors.push(new Error(name+': invalid value '+m))
		})
	}

	return { valid: !errors.length, errors: errors }
}

function lintCollection(col) {
	var errors = []
	if (!Array.isArray(col)) errors.push(new Error('col is not an array'))
	else col.forEach(function(item, i) {
		// @TODO: transportUrl validation if it's a URL
		if (typeof(item.transportUrl) !== 'string')
			errors.push(new Error(i+': transportUrl must be a string'))

		if (typeof(item.transportName) !== 'string')
			errors.push(new Error(i+': transportName must be a string'))

		errors = errors.concat(lintManifest(item.manifest).errors)
	})
	return { valid: !errors.length, errors: errors }
}

module.exports = {
	lintManifest: lintManifest,
	lintCollection: lintCollection,
}
