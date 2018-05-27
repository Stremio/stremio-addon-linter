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
	t.equal(result.errors.length, 5) // id, name, version, resource, types
	t.end()
})

tape('invalid version', function(t) {
	let result = linter.lintManifest({
		id: 'org.myexampleaddon',
		version: 'test',
		name: 'simple example',
		resources: ['stream'],
		types: ['movie'],
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

tape('valid manifest', function(t) {
	let result = linter.lintManifest({
		id: 'org.myexampleaddon',
		version: '1.0.0',
		name: 'simple example',
		resources: ['stream'],
		types: ['movie'],
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

tape('collection - not an array', function(t) {
	let result = linter.lintCollection(false)

	t.equal(result.valid, false, 'invalid collection')
	t.equal(result.errors[0].message, 'col is not an array')
	t.end()
})

tape('collection - invalid members', function(t) {
	let result = linter.lintCollection([true, { }])

	t.equal(result.valid, false, 'invalid collection')
	t.equal(result.errors.length, 6, '6 errors') // 2x3
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
	var col = [{ transportUrl: 'https://test.com', transportType: 'http', manifest: manifest }]

	let result = linter.lintCollection(col)
	t.equal(result.valid, true, 'valid collection')
	t.equal(result.errors.length, 0, 'no errors')
	t.end()
})