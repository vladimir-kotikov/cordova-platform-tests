/**
    Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License.  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.
*/

/* jshint jasmine: true */
/* global ROOT */

var Q = require('q');
var os = require('os');
var path = require('path');
var shell = require('shelljs');

var ConfigParser = require('cordova-common').ConfigParser;

var TMP = path.join(os.tmpdir(), 'api-tests-temp');

describe('PlatformApi interface', function () {
    it('should be exposed via platform\'s package.json', function () {
        expect(function () { require(ROOT); }).not.toThrow();
    });

    it('should contain \'static\' methods', function () {
        var Api = require(ROOT);
        expect(Api.createPlatform).toBeDefined();
        expect(Api.createPlatform).toEqual(jasmine.any(Function));
        expect(Api.updatePlatform).toBeDefined();
        expect(Api.updatePlatform).toEqual(jasmine.any(Function));
    });

    describe('\'createPlatform\' static method', function () {

        beforeEach(function () {
            shell.rm('-rf', TMP);
        });

        // TODO: this is currently fails on Android, since the config
        // parameter is required. To check if it is expected.
        it('should be able to create platform', function (done) {
            var createPromise;
            var fail = jasmine.createSpy('fail').andCallFake(function (err) {
                console.error(err && err.stack);
            });

            expect(function () { createPromise = require(ROOT).createPlatform(TMP); }).not.toThrow();
            expect(Q.isPromise(createPromise)).toBe(true);

            createPromise
            .then(function (apiInstance) {
                expect(apiInstance).toBeDefined();
            })
            .catch(fail)
            .finally(function () {
                expect(fail).not.toHaveBeenCalled();
                done();
            });
        });

        it('should throw if platform already exists in specified path', function (done) {
            shell.mkdir(TMP);
            var createPromise;
            var fail = jasmine.createSpy('fail');
            var win = jasmine.createSpy('win');

            expect(function () { createPromise = require(ROOT).createPlatform(TMP); }).not.toThrow();

            createPromise.then(win).catch(fail)
            .finally(function () {
                expect(win).not.toHaveBeenCalled();
                expect(fail).toHaveBeenCalled();
                done();
            });
        });

        // TODO: this is currently fails on Android (and probably on other platforms),
        // because config is applied only in prepare.
        it('should respect configuration values', function (done) {
            var fail = jasmine.createSpy('fail').andCallFake(function (err) {
                console.error(err && err.stack);
            });
            var config = new ConfigParser(path.join(__dirname, 'fixtures/config.xml'));

            require(ROOT).createPlatform(TMP, config)
            .then(function (api) {
                var platformInfo = api.getPlatformInfo();
                expect(platformInfo).toBeDefined();
                expect(platformInfo.projectConfig.name()).toEqual(config.name());
                expect(platformInfo.projectConfig.packageName()).toEqual(config.packageName());
            })
            .catch(fail)
            .finally(function () {
                expect(fail).not.toHaveBeenCalled();
                done();
            });
        });
    });
});
