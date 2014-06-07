/**
 * Created by Herby on 31. 5. 2014.
 */

var builder = require('../lib/config-builder'),
    assert = require('assert'),
    path = require('path');

function fixture(fixturePath) {
    return path.join(__dirname, fixturePath);
}

describe('#produceConfigObject merging', function () {
    it('should include local.amd.json if none other is present', function (done) {
        builder.produceConfigObject(fixture('single-local'), function (err, result) {
            assert.ifError(err);
            assert.deepEqual(result, {
                config: {foo: {foo: "bar"}}
            });
            done();
        });
    });

    it('should fail if foo.amd.json is present and there is no foo', function (done) {
        builder.produceConfigObject(fixture('local-and-missing'), function (err, result) {
            assert.ok(err);
            done();
        });
    });

    it('should fail if there is no applicable file', function (done) {
        builder.produceConfigObject(fixture('nothing'), function (err, result) {
            assert.ok(err);
            done();
        });
    });

    it('should include deep local.amd.json if none other is present', function (done) {
        builder.produceConfigObject(fixture('single-deep-local'), function (err, result) {
            assert.ifError(err);
            assert.deepEqual(result, {
                config: {fooDeep: {foo: "bar"}}
            });
            done();
        });
    });

    it('should include both local.amd.json if root and deep are present', function (done) {
        builder.produceConfigObject(fixture('two-locals'), function (err, result) {
            assert.ifError(err);
            assert.deepEqual(result, {
                config: {foo: {foo: "bar"}, fooDeep: {foo: "bar"}}
            });
            done();
        });
    });

    it('should include {root,deep}/local.amd.json first and {foo,bar}.amd.json afterwards given {foo,bar} dir is present', function (done) {
        builder.produceConfigObject(fixture('two-locals-two-others'), function (err, result) {
            assert.ifError(err);
            assert.deepEqual(result, {
                config: {a:2, b:2, c:2, d:2, e:1, f:1}
            });
            done();
        });
    });

});

describe('#produceConfigObject knows to deal with shims', function () {
    it('should output default array as {deps: anArray} in shim', function (done) {
        builder.produceConfigObject(fixture('single-local-shim'), function (err, result) {
            assert.ifError(err);
            assert.deepEqual(result, {
                shim: {foo: {deps: ["bar"]}}
            });
            done();
        });
    });

    it('should merge shims from {root,deep}/local.amd.json then from {foo,bar}.amd.json given {foo,bar} dir is present', function (done) {
        builder.produceConfigObject(fixture('two-locals-two-others-shim'), function (err, result) {
            assert.ifError(err);
            assert.deepEqual(result, {
                config: {a:2, b:2, c:2, d:2, e:1, f:1},
                shim: {
                    a: {deps: ["deeplocal", "other"], exports: "deep"},
                    b: {deps: ["rootlocal", "deep"], exports: "other"}
                }
            });
            done();
        });
    });

});
