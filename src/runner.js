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

var fs = require('fs');
var path = require('path');
var shell = require('shelljs');
var jasmine = require('jasmine-node');

module.exports.runTests = function (platformLocation, options) {
    // TODO: validate platformLocation and platform itself
    shell.cd(platformLocation);

    // TODO: extend, not override
    // Reinit paths, so platform's 'node_modules' is accessible
    process.env.NODE_PATH = path.join(platformLocation, 'node_modules');
    require('module').Module._initPaths();

    // Embedded tests
    var folders = [path.resolve(__dirname, '../tests/spec')];

    // TODO: this is valid for Android only!!!
    var platformSpecsLocation = path.join(platformLocation, 'spec/create');
    if (fs.existsSync(platformSpecsLocation)) {
        folders.push(platformSpecsLocation);
    }

    // Set up ROOT global so tests can rely on it
    global.ROOT = platformLocation;

    console.log('Running specs from ' + folders.join(', '));
    jasmine.executeSpecsInFolder({
        specFolders: folders,
        showColors: true,
        isVerbose: !!(options && options.verbose)
    });
};
