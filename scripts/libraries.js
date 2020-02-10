const log = require("npmlog");
const path = require('path');
const { readJsonFile } = require("./lib/fs");
const { copyFolders, executeCommand } = require('./lib/fs');
const { rootPath, distPath } = require('./definitions');

function LoadPackageJsonFiles(libraries) {
  libraries.forEach(library =>  {
    library.pkg = readJsonFile(path.resolve(library.sourcePath, 'package.json'));
  })
}

function grabSelectedlibraries(filterByName = null) {
  let adapters = new Set();

  log.verbose('', `grab user selected libraries (${filterByName || 'all libraries'})`);
  if (filterByName) {
    const adapter = Array.from(repositoryLibraries).find(adapter => adapter.name === filterByName);

    if (adapter) {
      adapters.add(adapter);
    } else {
      log.error(`unknown library requested '${filterByName}'`);
    }
  } else {
    adapters = repositoryLibraries;
  }

  return adapters;
}

async function executeNGBuild(libraryName) {
  executeCommand('ng', ['build', libraryName]);
}

async function buildLibraries(libraries) {
  const librariesNames = Array.from(libraries).reduce((result, {name}) => {result.push(name); return result;}, []).join(', ');
  log.verbose('build libraries', librariesNames);
  for (var it = libraries.values(), library= null; library=it.next().value; ) {
    await buildLibrary(library);

  }
  return Promise.resolve();
}

async function buildLibrary(library) {
  const libraryName = library? library.name : null;
  log.info(`build library`, libraryName);
  switch (libraryName) {
    case "@kontorol-ng/kontorol-logger":
      await executeNGBuild('@kontorol-ng/kontorol-logger');
      break;
    case "@kontorol-ng/kontorol-common":
      await executeNGBuild('@kontorol-ng/kontorol-common');
      break;
    case "@kontorol-ng/kontorol-ui": {
      await executeNGBuild('@kontorol-ng/kontorol-ui');
      const source = path.resolve(rootPath, 'projects/kontorol-ng/kontorol-ui/src/styles');
      const target = path.resolve(distPath, 'kontorol-ng/kontorol-ui/styles');
      await copyFolders(source, target);
    }
      break;
    case "@kontorol-ng/kontorol-primeng-ui": {
      await executeNGBuild('@kontorol-ng/kontorol-primeng-ui');
      const source = path.resolve(rootPath, 'projects/kontorol-ng/kontorol-primeng-ui/src/styles');
      const target = path.resolve(distPath, 'kontorol-ng/kontorol-primeng-ui/styles');
      await copyFolders(source, target);
    }
      break;
    case "@kontorol-ng/mc-shared":
      await executeNGBuild('@kontorol-ng/mc-shared');
      break;
    case "@kontorol-ng/mc-theme":
      const cwd = path.resolve(rootPath, 'projects/kontorol-ng/mc-theme');
      executeCommand('node', ['./scripts/build.js'], {cwd});
      break;
    default:
      throw new Error(`missing build instructions for '${libraryName}' (did you forget to add instructions in 'scripts/libraries.js' file?)`);
      break;
  }
}


const kontorolLogger = {
  name: '@kontorol-ng/kontorol-logger',
  sourcePath: path.resolve(rootPath, 'projects/kontorol-ng/kontorol-logger'),
  distPath: path.resolve(distPath, 'kontorol-ng/kontorol-logger'),
  dependencies: new Set(),
  dependents: new Set()
};

const kontorolCommon = {
  name: '@kontorol-ng/kontorol-common',
  sourcePath: path.resolve(rootPath, 'projects/kontorol-ng/kontorol-common'),
  distPath: path.resolve(distPath, 'kontorol-ng/kontorol-common'),
  dependencies: new Set(),
  dependents: new Set()
};

const kontorolUI = {
  name: '@kontorol-ng/kontorol-ui',
  sourcePath: path.resolve(rootPath, 'projects/kontorol-ng/kontorol-ui'),
  distPath: path.resolve(distPath, 'kontorol-ng/kontorol-ui'),
  dependencies: new Set(),
  dependents: new Set()

};

const kontorolPrimeUI = {
  name: '@kontorol-ng/kontorol-primeng-ui',
  sourcePath: path.resolve(rootPath, 'projects/kontorol-ng/kontorol-primeng-ui'),
  distPath: path.resolve(distPath, 'kontorol-ng/kontorol-primeng-ui'),
  dependencies: new Set(),
  dependents: new Set()
}

const mcShared = {
  name: '@kontorol-ng/mc-shared',
  sourcePath: path.resolve(rootPath, 'projects/kontorol-ng/mc-shared'),
  distPath: path.resolve(distPath, 'kontorol-ng/mc-shared'),
  dependencies: new Set(),
  dependents: new Set()
}

const mcTheme = {
  name: '@kontorol-ng/mc-theme',
  sourcePath: path.resolve(rootPath, 'projects/kontorol-ng/mc-theme'),
  distPath: path.resolve(distPath, 'kontorol-ng/mc-theme'),
  dependencies: new Set(),
  dependents: new Set()
}

function updateDependencies(library, dependencies) {
  library.dependencies = dependencies;

  dependencies.forEach(dependency => {
    dependency.dependents.add(library);
  })
}

// TODO should extract peer depenedencies and build order automatically from package.json of libraries
updateDependencies(kontorolUI, [kontorolCommon]);
updateDependencies(kontorolPrimeUI, [kontorolCommon, kontorolUI]);
updateDependencies(mcShared, [kontorolCommon, kontorolUI, kontorolLogger]);

const repositoryLibraries = new Set([kontorolLogger, kontorolCommon, kontorolUI, kontorolPrimeUI, mcShared, mcTheme]);

LoadPackageJsonFiles(repositoryLibraries);

module.exports = { repositoryLibraries, grabSelectedlibraries, buildLibrary, buildLibraries };
