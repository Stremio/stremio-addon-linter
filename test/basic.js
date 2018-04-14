const tape = require('tape')

const linter = require('../')

tape('invalid manifest - undefined', function(t) {
	let result = linter.lintManifest()
	t.equal(result.valid, false, 'invalid manifest')
	t.equal(result.errors[0].message, 'manifest should be an object')
	t.end()
})

tape('invalid manifest - not an object', function(t) {
	let result = linter.lintManifest('test')
	t.equal(result.valid, false, 'invalid manifest')
	t.equal(result.errors[0].message, 'manifest should be an object')
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
	t.equal(result.errors[0].message, 'manifest.version should be a valid semver version')
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
	t.equal(result.errors[0].message, 'manifest.catalogs should be an array')
	t.equal(result.errors[1].message, 'manifest.idPrefixes should be an array')
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
	t.equal(result.errors[0].message, 'manifest.idPrefixes should be an array')
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