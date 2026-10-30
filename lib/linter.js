const semver = require('semver')

// the rules below follow how stremio-core deserializes a manifest (src/types/addon/manifest.rs):
// a manifest that core can't deserialize can't be installed, so those cases are errors

function has(obj, prop) {
	return Object.prototype.hasOwnProperty.call(obj, prop)
}

function isObject(val) {
	return !!val && typeof val === 'object' && !Array.isArray(val)
}

function lintManifest(manifest) {
	var errors = []
	var warnings = []

	if (!isObject(manifest))
		return { valid: false, errors: [new Error('manifest must be an object')] }

	assertString(manifest.id, 'manifest.id')
	assertString(manifest.name, 'manifest.name')
	assertSemver(manifest.version, 'manifest.version')

	// resources can be a string or {name, types, ?idPrefixes}
	assertArray(manifest.resources, 'manifest.resources')
	if (Array.isArray(manifest.resources)) {
		var resourceNames = []
		manifest.resources.forEach(function(r, i) {
			var name = 'manifest.resources['+i+']'
			if (typeof r === 'string') {
				resourceNames.push(r)
				return
			}
			if (!isObject(r) || typeof r.name !== 'string') {
				errors.push(new Error(name+' must be a string or an object with a string name'))
				return
			}
			resourceNames.push(r.name)
			// core does not fall back to manifest.types for the full notation
			if (has(r, 'types') && r.types !== null) assertStringArray(r.types, name+'.types')
			else warnings.push(new Error(name+' ('+r.name+') has no types, so Stremio will never request it; set types or use the short notation "'+r.name+'"'))
			if (has(r, 'idPrefixes') && r.idPrefixes !== null) assertStringArray(r.idPrefixes, name+'.idPrefixes')
		})
		warnIfNotAllInSet(resourceNames, ['catalog', 'meta', 'stream', 'subtitles', 'player', 'library'], 'manifest.resources')
	}

	assertStringArray(manifest.types, 'manifest.types')

	assertArray(manifest.catalogs, 'manifest.catalogs')

	// @TODO: this one is optional for now, but it will become even more convenient if we drop the resource shorthand: https://github.com/Stremio/stremio-addon-sdk/issues/27
	if (has(manifest, 'idPrefixes') && manifest.idPrefixes !== null) assertStringArray(manifest.idPrefixes, 'manifest.idPrefixes')

	if (has(manifest, 'behaviorHints')) {
		assertObject(manifest.behaviorHints, 'manifest.behaviorHints')
		// evaluate inners: adult, configurable, configurationRequired, p2p, epgProvider
		;['adult', 'configurable', 'configurationRequired', 'p2p', 'epgProvider'].forEach(function(propName) {
			if (isObject(manifest.behaviorHints) && has(manifest.behaviorHints, propName))
				assertBool(manifest.behaviorHints[propName], 'manifest.behaviorHints.'+propName)
		})
	}

	if (Array.isArray(manifest.catalogs)) manifest.catalogs.forEach(function(catalog, i) {
		if (!isObject(catalog)) {
			errors.push(new Error('manifest.catalogs['+i+'] must be an object'))
			return
		}

		// .type, .id are mandatory
		if (typeof(catalog.id) !== 'string' || typeof(catalog.type) !== 'string')
			errors.push(new Error('manifest.catalogs['+i+']: id and type must be string properties'))

		// extra: full notation: required to be an array
		if (has(catalog, 'extra')) {
			assertArray(catalog.extra, 'manifest.catalogs['+i+'].extra')
			if (Array.isArray(catalog.extra)) catalog.extra.forEach(function(extra, j) {
				var name = 'manifest.catalogs['+i+'].extra['+j+']'
				if (!isObject(extra)) {
					errors.push(new Error(name+' must be an object'))
					return
				}
				if (has(extra, 'isRequired')) assertBool(extra.isRequired, name+'.isRequired')
				assertString(extra.name, name+'.name')
				if (has(extra, 'options') && extra.options !== null) assertStringArray(extra.options, name+'.options')
				if (has(extra, 'optionsLimit') && !(Number.isInteger(extra.optionsLimit) && extra.optionsLimit >= 0))
					errors.push(new Error(name+'.optionsLimit must be a non-negative integer'))
			})
		}

		// extra: short notation: .extraSupported and .extraRequired are optional but have to be arrays
		if (has(catalog, 'extraSupported')) assertStringArray(catalog.extraSupported, 'manifest.catalogs['+i+'].extraSupported')
		if (has(catalog, 'extraRequired')) assertStringArray(catalog.extraRequired, 'manifest.catalogs['+i+'].extraRequired')
	})

	// Asserts
	function assertObject(val, name) {
		if (!isObject(val))
			errors.push(new Error(name+' must be an object'))
	}

	function assertBool(val, name) {
		if (typeof(val) !== 'boolean')
			errors.push(new Error(name+' must be a boolean'))
	}

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

	function assertStringArray(val, name) {
		if (!Array.isArray(val))
			errors.push(new Error(name+' must be an array'))
		else if (!val.every(function(item) { return typeof item === 'string' }))
			errors.push(new Error(name+' must only contain strings'))
	}

	function warnIfNotAllInSet(val, set, name) {
		if (!Array.isArray(val)) return
		val.forEach(function(m) {
			if (!set.includes(m))
				warnings.push(new Error(name+': unknown value '+m))
		})
	}

	return { valid: !errors.length, errors: errors, warnings: warnings }
}

function lintCollection(col) {
	var errors = []
	if (!Array.isArray(col)) errors.push(new Error('col is not an array'))
	else col.forEach(function(item, i) {
		if (!isObject(item)) {
			errors.push(new Error(i+': must be an object'))
			return
		}

		// @TODO: transportUrl validation if it's a URL
		if (typeof(item.transportUrl) !== 'string')
			errors.push(new Error(i+': transportUrl must be a string'))

		if (typeof(item.transportName) !== 'string')
			errors.push(new Error(i+': transportName must be a string'))

		errors = errors.concat(lintManifest(item.manifest).errors)
	})
	return { valid: !errors.length, errors: errors, warnings: [] }
}

module.exports = {
	lintManifest: lintManifest,
	lintCollection: lintCollection,
}
