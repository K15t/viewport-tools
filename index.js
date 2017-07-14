#! /usr/bin/env node

// To be installed as global package to work as a command line tool
// for Scroll Viewport theme developers.

'use strict';

var args = require('args'),
    debug = require('debug')('spark'),
    downloadFromGit = require ('download-git-repo'),
    fs = require('fs'),
    inquirer = require('inquirer'),
    path = require('path'),
    q = require('q');



function main() {

    args.command('create', 'Create a new viewport template', createThemeProject, ['c']);
    args.example('viewport create', 'Create a new Scroll Viewport theme project:');
    args.parse(process.argv, {
        version: false
    });

    if (!args.sub[0]) {
        args.showHelp();
    }
}



function createThemeProject() {
    var project = {
        cwd: process.cwd(),
        theme: {
            key: undefined,
            template: undefined
        }
    };

    showWelcomeMessage(project)
        .then(readProjectInfo)
        .then(createProjectDir)
        .then(downloadTheme)
        .then(modifyPackageJson)
    ;
}



function showWelcomeMessage(project) {

    console.log('');
    console.log('sloo⊥ ɹǝdolǝʌǝᗡ ʇɹodʍǝıΛ \\ Viewport Developer Tools');
    console.log('');

    return q.resolve(project);
}



function readProjectInfo(project) {
    var deferred = q.defer();

    inquirer.prompt([
        {
            type: 'input',
            name: 'key',
            message: 'Theme Key, e.g. my-viewport-theme',
            'validate': function (value) {
                var pass = value.match(/^[a-z][a-z0-9_-]+$/i);
                if (pass) {
                    if (fs.existsSync(path.join(project.cwd, value))) {
                        return "Folder with name '" + value + "' already exists. Use different project key.";
                    } else {
                        return true;
                    }
                } else {
                    return "Please enter a valid SPA key (starts with a letter & contains only alpha-numeric characters, '-', and '_'.";
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
                    name: 'Twitter Bootstrap Theme',
                    value: 'github:K15t/spark-tools'
                },
                {
                    name: 'Foundation Theme',
                    value: 'github:K15t/spark-tools'
                },
                {
                    name: 'Simple Theme',
                    value: 'github:K15t/spark-tools'
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
        project.theme = answers;

        if (!answers.everythingOk) {
            deferred.reject(new Error('Aborted.'));
        } else {
            delete project.theme.everythingOk;
            deferred.resolve(project);
        }
    });

    return deferred.promise;
}



function createProjectDir(project) {
    if (fs.existsSync(path.join(project.cwd, project.theme.key))) {
        return q.reject(new Error("Folder with name '" + project.theme.key + "' already exists."));
    }

    try {
        fs.mkdirSync(path.join(project.cwd, project.theme.key));
        return q.resolve(project);

    } catch (e) {
        if (e.code === 'EEXIST') {
            debug("Folder with name '" + project.theme.key + "' already exists.");
            return q.resolve(project);

        } else {
            return q.reject(e);
        }
    }

}



function downloadTheme(project) {
    var deferred = q.defer();

    downloadFromGit(project.theme.template, project.theme.key, function (err) {
        err ? deferred.reject(e) : deferred.resolve(project);
    });

}



function modifyPackageJson(project) {
    var packageJsonContent = fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8');
    var packageJson = JSON.parse(packageJsonContent);
    packageJson.name = project.theme.name;
    packageJson.version = project.theme.version;
    fs.writeFileSync(path.join(process.cwd(), 'package.json'), JSON.stringify(packageJson));
}


main();
