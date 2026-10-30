const tape = require('tape')

const linter = require('../')

tape('invalid manifest - undefined', function(t) {
	let result = linter.lintManifest()
	t.equal(result.valid, false, 'invalid manifest')
	t.equal(result.errors[0].message, 'manifest must be an object')
	t.end()
})

tape('invalid manifest - not an object', function(t) {
	let result = linter.lintManifest('test')
	t.equal(result.valid, false, 'invalid manifest')
	t.equal(result.errors[0].message, 'manifest must be an object')
	t.end()
})

tape('invalid - multiple errors', function(t) {
	let result = linter.lintManifest({ })
	t.equal(result.valid, false, 'invalid manifest')
	t.equal(result.errors.length, 6) // id, name, version, resource, types, catalogs
	t.end()
})

tape('invalid version', function(t) {
	let result = linter.lintManifest({
		id: 'org.myexampleaddon',
		version: 'test',
		name: 'simple example',
		resources: ['stream'],
		types: ['movie'],
		catalogs: [],
	})

	t.equal(result.valid, false, 'invalid manifest')
	t.equal(result.errors[0].message, 'manifest.version must be a valid semver string')
	t.end()
})

tape('invalid catalogs, idPrefixes', function(t) {
	let result = linter.lintManifest({
		id: 'org.myexampleaddon',
		version: '1.0.0',
		name: 'simple example',
		resources: ['stream'],
		types: ['movie'],
		catalogs: '',
		idPrefixes: '',
	})

	t.equal(result.valid, false, 'invalid manifest')
	t.equal(result.errors.length, 2, 'errors is right length')
	t.equal(result.errors[0].message, 'manifest.catalogs must be an array')
	t.equal(result.errors[1].message, 'manifest.idPrefixes must be an array')
	t.end()
})

tape('idPrefixes: null is ignored', function(t) {
	let result = linter.lintManifest({
		id: 'org.myexampleaddon',
		version: '1.0.0',
		name: 'simple example',
		resources: ['stream'],
		types: ['movie'],
		catalogs: [],
		idPrefixes: null,
	})

	t.equal(result.valid, true, 'valid manifest')
	t.end()
})

tape('invalid catalogs only', function(t) {
	let result = linter.lintManifest({
		id: 'org.myexampleaddon',
		version: '1.0.0',
		name: 'simple example',
		resources: ['stream'],
		types: ['movie'],
		catalogs: [],
		idPrefixes: '',
	})

	t.equal(result.valid, false, 'invalid manifest')
	t.equal(result.errors.length, 1, 'errors is right length')
	t.equal(result.errors[0].message, 'manifest.idPrefixes must be an array')
	t.end()
})

tape('unknown resources', function(t) {
	let result = linter.lintManifest({
		id: 'org.myexampleaddon',
		version: '1.0.0',
		name: 'simple example',
		resources: ['foo', 'meta', { name: 'stream', types: ['movie'] }, 'player', { name: 'library', types: ['movie'] }],
		types: ['movie'],
		catalogs: [],
	})

	t.equal(result.valid, true, 'manifest is still valid')
	t.equal(result.warnings.length, 1, 'warnings is right length')
	t.equal(result.warnings[0].message, 'manifest.resources: unknown value foo')
	t.end()
})

tape('valid manifest', function(t) {
	let result = linter.lintManifest({
		id: 'org.myexampleaddon',
		version: '1.0.0',
		name: 'simple example',
		resources: ['stream'],
		types: ['movie'],
		catalogs: [],
	})

	t.equal(result.valid, true, 'valid manifest')
	t.deepEqual(result.errors, [], 'empty errors')
	t.end()
})


tape('valid manifest with catalogs and idPrefixes', function(t) {
	let result = linter.lintManifest({
		id: 'org.myexampleaddon',
		version: '1.0.0',
		name: 'simple example',
		resources: ['stream'],
		types: ['movie'],
		catalogs: [],
		idPrefixes: [],
	})

	t.equal(result.valid, true, 'valid manifest')
	t.deepEqual(result.errors, [], 'empty errors')
	t.end()
})

tape('catalog validation - invalid catalog', function(t) {
	let result = linter.lintManifest({
		id: 'org.myexampleaddon',
		version: '1.0.0',
		name: 'simple example',
		resources: ['stream'],
		types: ['movie'],
		catalogs: [{}],
		idPrefixes: [],
	})

	t.equal(result.valid, false, 'invalid manifest')
	t.equal(result.errors.length, 1, 'errors is right length')
	t.equal(result.errors[0].message, 'manifest.catalogs[0]: id and type must be string properties')
	t.end()
})

tape('catalog validation - valid catalog', function(t) {
	let result = linter.lintManifest({
		id: 'org.myexampleaddon',
		version: '1.0.0',
		name: 'simple example',
		resources: ['stream'],
		types: ['movie'],
		catalogs: [{ id: 'top', type: 'movie', extraSupported: [] }],
		idPrefixes: [],
	})

	t.equal(result.valid, true, 'valid manifest')
	t.deepEqual(result.errors, [], 'empty errors')
	t.end()
})

tape('catalog validation - validating multiple catalogs', function(t) {
	let result = linter.lintManifest({
		id: 'org.myexampleaddon',
		version: '1.0.0',
		name: 'simple example',
		resources: ['stream'],
		types: ['movie'],
		catalogs: [
			{ id: 'top', type: 'movie', extraSupported: [] },
			{ }
		],
		idPrefixes: [],
	})

	t.equal(result.valid, false, 'invalid manifest')
	t.equal(result.errors.length, 1, 'errors is right length')
	t.equal(result.errors[0].message, 'manifest.catalogs[1]: id and type must be string properties')
	t.end()
})


tape('catalog validation - extraSupported/extraRequired', function(t) {
	let result = linter.lintManifest({
		id: 'org.myexampleaddon',
		version: '1.0.0',
		name: 'simple example',
		resources: ['stream'],
		types: ['movie'],
		catalogs: [{ id: 'top', type: 'movie', extraSupported: true }],
		idPrefixes: [],
	})

	t.equal(result.valid, false, 'invalid manifest')
	t.equal(result.errors[0].message, 'manifest.catalogs[0].extraSupported must be an array')
	t.end()
})

tape('catalog validation - extra new format - OK', function(t) {
	let result = linter.lintManifest({
		id: 'org.myexampleaddon',
		version: '1.0.0',
		name: 'simple example',
		resources: ['stream'],
		types: ['movie'],
		catalogs: [{ id: 'top', type: 'movie', extra: [{ name: 'skip', isRequired: true }] }],
		idPrefixes: [],
	})

	t.equal(result.valid, true, 'valid manifest')
	t.end()
})

tape('catalog validation - extra new format - NOT OK', function(t) {
	let result = linter.lintManifest({
		id: 'org.myexampleaddon',
		version: '1.0.0',
		name: 'simple example',
		resources: ['stream'],
		types: ['movie'],
		catalogs: [{ id: 'top', type: 'movie', extra: [{ name: 0, isRequired: 0 }] }],
		idPrefixes: [],
	})

	t.equal(result.valid, false, 'invalid manifest')
	t.equal(result.errors[0].message, 'manifest.catalogs[0].extra[0].isRequired must be a boolean')
	t.equal(result.errors[1].message, 'manifest.catalogs[0].extra[0].name must be a string')
	t.end()
})

tape('catalog validation - behaviorHints', function(t) {
	let result = linter.lintManifest({
		id: 'org.myexampleaddon',
		version: '1.0.0',
		name: 'simple example',
		resources: ['stream'],
		types: ['movie'],
		idPrefixes: [],
		behaviorHints: [],
		catalogs: []
	})

	t.equal(result.valid, false, 'invalid manifest')
	t.equal(result.errors[0].message, 'manifest.behaviorHints must be an object')
	t.end()
})

tape('catalog validation - behaviorHints', function(t) {
	let result = linter.lintManifest({
		id: 'org.myexampleaddon',
		version: '1.0.0',
		name: 'simple example',
		resources: ['stream'],
		types: ['movie'],
		idPrefixes: [],
		behaviorHints: { p2p: {} },
		catalogs: []
	})

	t.equal(result.valid, false, 'invalid manifest')
	t.equal(result.errors[0].message, 'manifest.behaviorHints.p2p must be a boolean')
	t.end()
})

const validBase = {
	id: 'org.myexampleaddon',
	version: '1.0.0',
	name: 'simple example',
	resources: ['stream'],
	types: ['movie'],
	catalogs: [],
}

function lintWith(props) {
	return linter.lintManifest(Object.assign({}, validBase, props))
}

tape('null entries are reported instead of throwing', function(t) {
	let result = lintWith({ behaviorHints: null })
	t.equal(result.valid, false, 'behaviorHints: null is invalid')
	t.equal(result.errors[0].message, 'manifest.behaviorHints must be an object')

	result = lintWith({ catalogs: [null] })
	t.equal(result.errors[0].message, 'manifest.catalogs[0] must be an object')

	result = lintWith({ catalogs: [{ id: 'top', type: 'movie', extra: [null] }] })
	t.equal(result.errors[0].message, 'manifest.catalogs[0].extra[0] must be an object')
	t.end()
})

tape('manifest must not be an array', function(t) {
	let result = linter.lintManifest([])
	t.equal(result.valid, false, 'invalid manifest')
	t.equal(result.errors[0].message, 'manifest must be an object')
	t.end()
})

tape('resources: entries must be strings or objects with a name', function(t) {
	let result = lintWith({ resources: [{ types: ['movie'] }, 5] })
	t.equal(result.valid, false, 'invalid manifest')
	t.equal(result.errors[0].message, 'manifest.resources[0] must be a string or an object with a string name')
	t.equal(result.errors[1].message, 'manifest.resources[1] must be a string or an object with a string name')
	t.end()
})

tape('resources: full notation without types warns', function(t) {
	let result = lintWith({ resources: [{ name: 'stream' }] })
	t.equal(result.valid, true, 'still valid')
	t.equal(result.warnings.length, 1, 'one warning')
	t.equal(result.warnings[0].message, 'manifest.resources[0] (stream) has no types, so Stremio will never request it; set types or use the short notation "stream"')
	t.end()
})

tape('resources: types and idPrefixes must be string arrays', function(t) {
	let result = lintWith({ resources: [{ name: 'stream', types: 'movie', idPrefixes: ['tt', 1] }] })
	t.equal(result.valid, false, 'invalid manifest')
	t.equal(result.errors[0].message, 'manifest.resources[0].types must be an array')
	t.equal(result.errors[1].message, 'manifest.resources[0].idPrefixes must only contain strings')

	result = lintWith({ resources: [{ name: 'stream', types: ['movie'], idPrefixes: null }] })
	t.equal(result.valid, true, 'null idPrefixes on a resource is fine')
	t.end()
})

tape('types and idPrefixes must only contain strings', function(t) {
	let result = lintWith({ types: ['movie', 5], idPrefixes: ['tt', 1] })
	t.equal(result.valid, false, 'invalid manifest')
	t.equal(result.errors[0].message, 'manifest.types must only contain strings')
	t.equal(result.errors[1].message, 'manifest.idPrefixes must only contain strings')
	t.end()
})

tape('behaviorHints.epgProvider must be a boolean', function(t) {
	let result = lintWith({ behaviorHints: { epgProvider: 'yes' } })
	t.equal(result.valid, false, 'invalid manifest')
	t.equal(result.errors[0].message, 'manifest.behaviorHints.epgProvider must be a boolean')

	result = lintWith({ behaviorHints: { epgProvider: true } })
	t.equal(result.valid, true, 'boolean epgProvider is fine')
	t.end()
})

tape('catalog extra: options and optionsLimit', function(t) {
	let result = lintWith({ catalogs: [{ id: 'top', type: 'movie', extra: [{ name: 'genre', options: 'Action', optionsLimit: '2' }] }] })
	t.equal(result.valid, false, 'invalid manifest')
	t.equal(result.errors[0].message, 'manifest.catalogs[0].extra[0].options must be an array')
	t.equal(result.errors[1].message, 'manifest.catalogs[0].extra[0].optionsLimit must be a non-negative integer')

	result = lintWith({ catalogs: [{ id: 'top', type: 'movie', extra: [{ name: 'genre', options: null }, { name: 'skip', options: ['a'], optionsLimit: 2 }] }] })
	t.equal(result.valid, true, 'null options and a numeric optionsLimit are fine')
	t.end()
})

tape('collection - not an array', function(t) {
	let result = linter.lintCollection(false)

	t.equal(result.valid, false, 'invalid collection')
	t.equal(result.errors[0].message, 'col is not an array')
	t.end()
})

tape('collection - invalid members', function(t) {
	let result = linter.lintCollection([true, { }])

	t.equal(result.valid, false, 'invalid collection')
	t.equal(result.errors.length, 4, '4 errors') // 1 for the non-object, 3 for the empty object
	t.equal(result.errors[0].message, '0: must be an object')
	t.end()
})

tape('collection - null member does not throw', function(t) {
	let result = linter.lintCollection([null])

	t.equal(result.valid, false, 'invalid collection')
	t.equal(result.errors[0].message, '0: must be an object')
	t.end()
})

tape('collection - valid collection', function(t) {
	var manifest = {
		id: 'org.myexampleaddon',
		version: '1.0.0',
		name: 'simple example',
		resources: ['stream'],
		types: ['movie'],
		catalogs: [{ id: 'top', type: 'movie' }],
		idPrefixes: [],
	}
	var col = [{ transportUrl: 'https://test.com', transportName: 'http', manifest: manifest }]

	let result = linter.lintCollection(col)
	t.equal(result.valid, true, 'valid collection')
	t.deepEqual(result.errors, [], 'no errors')
	t.end()
})
