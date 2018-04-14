const tape = require('tape')

const linter = require('../')

tape('invalid manifest - undefined', function(t) {
	let result = linter.lintManifest()
	t.equal(result.valid, false, 'invalid manifest')
	t.deepEqual(result.errors, [new Error('manifest should be an object')])
	t.end()
})

tape('invalid manifest - not an object', function(t) {
	let result = linter.lintManifest('test')
	t.equal(result.valid, false, 'invalid manifest')
	t.deepEqual(result.errors, [new Error('manifest should be an object')])
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

	t.equal(result.valid, false, 'valid manifest')
	t.deepEqual(result.errors, [new Error('invalid version')])
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