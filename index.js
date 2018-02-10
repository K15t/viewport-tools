#! /usr/bin/env node

// To be installed as global package to work as a command line tool
// for Scroll Viewport theme developers.

'use strict';

var args = require('args'),
    debug = require('debug')('spark'),
    downloadFromGit = require('download-git-repo'),
    fs = require('fs'),
    fse = require('fs-extra'),
    homeConfig = require('home-config'),
    inquirer = require('inquirer'),
    path = require('path'),
    q = require('q');


function main() {

    args.command('init', 'Initialize local development and create ~/.viewportrc file.', initViewportDevelopment, ['i']);
    args.command('create', 'Create a new viewport project.', createThemeProject, ['c']);
    args.example('viewport create', 'Create a new Scroll Viewport theme project');
    args.parse(process.argv, {
        version: false
    });

    if (!args.sub[0]) {
        args.showHelp();
    }
}



// == create =============================================================

function createThemeProject() {
    var action = {
        welcomeMessage: 'Create a new viewport theme project.',
        viewportrc: homeConfig.load('.viewportrc')['DEV'],
        cwd: process.cwd(),
        theme: {
            key: undefined,
            template: undefined
        }
    };

    showWelcomeMessage(action)
        .then(readProjectInfo)
        .then(createProjectDir)
        .then(downloadTheme)
        .then(modifyPackageJson)
        .then(modifyGulpfileJs)
        .then(showGetStartedMessage)
    ;
}


function showWelcomeMessage(action) {

    console.log('');
    console.log('Viewport Developer Tools // sloo⊥ ɹǝdolǝʌǝᗡ ʇɹodʍǝıΛ');
    console.log('');
    console.log('  ' + action.welcomeMessage);
    console.log('');

    return q.resolve(action);
}


function readProjectInfo(action) {
    var deferred = q.defer();

    inquirer.prompt([
        {
            type: 'input',
            name: 'key',
            message: 'Theme Key, e.g. my-viewport-theme',
            'validate': function(value) {
                var pass = value.match(/^[a-z][a-z0-9_-]+$/i);
                if (pass) {
                    if (fs.existsSync(path.join(action.cwd, value))) {
                        return "Folder with name '" + value + "' already exists. Use different project key.";
                    } else {
                        return true;
                    }
                } else {
                    return "Please enter a valid theme key (starts with a letter & contains only alpha-numeric characters, '-', and '_'.";
                }
            }
        },
        {
            type: 'input',
            name: 'version',
            message: 'Theme Version, e.g. 1.0.0',
            'default': '1.0.0'
        },
        {
            type: 'list',
            name: 'template',
            message: 'Theme',
            choices: [
                {
                    name: 'Example Theme (with Gulp & Less)',
                    value: {
                        repo: 'github:K15t/gulp-viewport',
                        path: 'example',
                        replacements: {
                            'var THEME_NAME = \'your-theme-name\';': function(action) {
                                return `var THEME_NAME = '${action.theme.key}';`;
                            },
                            'var BROWSERSYNC_URL = \'http://localhost:1990/confluence\';': function(action) {
                                if (action.viewportrc){
                                    return `var BROWSERSYNC_URL = '${action.viewportrc.confluenceBaseUrl}';`;
                                } else {
                                    return `var BROWSERSYNC_URL = 'http://localhost:1990/confluence';`;
                                }
                            }
                        },
                        getStartedMessages: [
                            'Run \'npm i\' to install required dependencies.',
                            'Run \'gulp create && gulp watch\' and start developing.'
                        ]
                    }
                },
                {
                    name: 'ZURB Foundation Starter (+Gulp & Sass)',
                    value: {
                        repo: 'bitbucket:K15t/viewport-theme-foundation',
                        path: undefined,
                        getStartedMessages: [
                            'Run \'npm i\' to install required dependencies.',
                            'Run \'bower install\' to download required dependencies.',
                            'Run \'gulp create && gulp watch\' and start developing.'
                        ]
                    }
                }
            ]
        },
        {
            type: 'confirm',
            name: 'everythingOk',
            message: 'About to create theme project. Everything ok?',
            'default': true
        }
    ], function(answers) {
        action.theme = answers;

        if (!answers.everythingOk) {
            deferred.reject(new Error('Aborted.'));
        } else {
            delete action.theme.everythingOk;
            deferred.resolve(action);
        }
    });

    return deferred.promise;
}


function createProjectDir(action) {
    if (fs.existsSync(path.join(action.cwd, action.theme.key))) {
        return q.reject(new Error("Folder with name '" + action.theme.key + "' already exists."));
    }

    try {
        fs.mkdirSync(path.join(action.cwd, action.theme.key));
        return q.resolve(action);

    } catch (e) {
        if (e.code === 'EEXIST') {
            debug("Folder with name '" + action.theme.key + "' already exists.");
            return q.resolve(action);

        } else {
            return q.reject(e);
        }
    }

}


function downloadTheme(action) {
    var deferred = q.defer();

    downloadFromGit(action.theme.template.repo, action.theme.key, function(err) {
        if(err) {
            deferred.reject(err);
        } else {
            if (action.theme.template.path) {
                fs.renameSync(path.join(action.cwd, action.theme.key), path.join(action.cwd, "_toDelete"));
                fse.moveSync(path.join(action.cwd, "_toDelete/", action.theme.template.path),
                    path.join(action.cwd, action.theme.template.path));
                fse.removeSync(path.join(action.cwd, "_toDelete/"));
                fs.renameSync(path.join(action.cwd, action.theme.template.path), path.join(action.cwd, action.theme.key));
            }

            deferred.resolve(action);
        }
    });

    return deferred.promise;
}


function modifyPackageJson(action) {
    let packageJsonPath = path.join(action.cwd, action.theme.key, 'package.json');
    let packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
    let packageJson = JSON.parse(packageJsonContent);
    packageJson.name = action.theme.key;
    packageJson.version = action.theme.version;

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');

    return q.resolve(action);
}


function modifyGulpfileJs(action) {
    let gulpfileJsPath = path.join(action.cwd, action.theme.key, 'gulpfile.js');
    let gulpfileJsContent = fs.readFileSync(gulpfileJsPath, 'utf8');

    for (let key in action.theme.template.replacements) {
        if (action.theme.template.replacements.hasOwnProperty(key)) {
            gulpfileJsContent = gulpfileJsContent.replace(key, action.theme.template.replacements[key](action));
        }
    }

    fs.writeFileSync(gulpfileJsPath, gulpfileJsContent, 'utf8');

    return q.resolve(action);
}


function showGetStartedMessage(action) {
    let cnt = 1;
    console.log('');
    console.log('You\'re awesome. Project \'' + action.theme.key + '\' created. Now, let\'s start developing:');
    console.log('  ' + cnt++ + '. Change into directory: \'cd ' + action.theme.key + '\'.');

    for (let msg of action.theme.template.getStartedMessages) {
        console.log('  ' + cnt++ + '. ' + msg + '');
    }

    return q.resolve(action);
}



// == init =============================================================

function initViewportDevelopment() {
    let action = {
        welcomeMessage: 'Initialize local viewport theme development and create ~/.viewportrc file.\n' +
        '  Security Warning: Please use this for development and testing systems only.',
        viewportrc: {
            confluenceBaseUrl: 'http://localhost:1990/confluence',
            username: 'admin',
            password: 'admin'
        }
    };

    showWelcomeMessage(action)
        .then(readParams)
        .then(createViewportrc)
        .then(showWelcomeAfterInitMessage)
}


function readParams(action) {
    let deferred = q.defer();

    inquirer.prompt([
        {
            type: 'input',
            name: 'confluenceBaseUrl',
            message: 'Confluence Base URL, e.g. http://localhost:1990/confluence',
            'default': 'http://localhost:1990/confluence'
        },
        {
            type: 'input',
            name: 'username',
            message: 'Username',
            'default': 'admin'
        },
        {
            type: 'password',
            name: 'password',
            message: 'Password',
            'default': 'admin'
        },
        {
            type: 'confirm',
            name: 'everythingOk',
            message: 'About to create ~/.viewportrc. Everything ok?',
            'default': true
        }
    ], function(answers) {
        action.viewportrc = answers;

        if (!answers.everythingOk) {
            deferred.reject(new Error('Aborted.'));
        } else {
            delete action.viewportrc.everythingOk;
            deferred.resolve(action);
        }
    });

    return deferred.promise;
}


function createViewportrc(action) {
    let viewportRc = homeConfig.load('.viewportrc', {});

    // if [DEV] is already defined, we'll back it up.
    if (viewportRc.DEV) {
        viewportRc['DEV_' + new Date().toISOString().substring(0, 19)] = viewportRc.DEV;
    }

    // we need to replace semicolons, because they start comments in ini files
    // more info: https://github.com/npm/ini/issues/42
    action.viewportrc.confluenceBaseUrl = action.viewportrc.confluenceBaseUrl.replace(/\;/, '\;');
    action.viewportrc.username = action.viewportrc.username.replace(/\;/, '\;');
    action.viewportrc.password = action.viewportrc.password.replace(/\;/, '\;');

    viewportRc.DEV = action.viewportrc;
    viewportRc.save('.viewportrc');

    return q.resolve(action);
}

function showWelcomeAfterInitMessage() {
    console.log('');
    console.log('Great! Now execute \'viewport create\' to create new theme.');

    return q.resolve(action);
}


main();
