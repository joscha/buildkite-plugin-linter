const path = require('path')
const fs = require('fs')
const git = require('isomorphic-git')
const compareVersions = require('compare-versions')

module.exports = async function (argv, tap) {
  const { id, path: pluginPath, readme, silent } = argv

  const pluginConfigKeyPattern = new RegExp(`${id}#(v.*):`, 'g')

  const readmePath = path.join(pluginPath, readme)
  const readmeContents = fs.readFileSync(readmePath, 'utf8')

  const tags = await git.listTags({ fs, dir: pluginPath })

  const sortedTags = tags.sort((t1, t2) => {
    try {
      return compareVersions(t1, t2)
    } catch (err) {
      // Ignore semver parsing errors
      return -1
    }
  })

  const latestVersion = sortedTags[sortedTags.length - 1]

  const invalidVersionNumbers = []

  while (true) {
    const match = pluginConfigKeyPattern.exec(readmeContents)
    if (!match) {
      break
    }
    const version = match[1]
    if (version < latestVersion) {
      invalidVersionNumbers.push(version)
    }
  }

  if (!invalidVersionNumbers.length) {
    if (!silent) {
      tap.pass(`Readme version numbers are up-to-date (${latestVersion})`)
    }
    return true
  } else {
    if (!silent) {
      tap.fail(`Readme version numbers out of date. Latest is ${latestVersion}`, {
        'invalid version numbers': invalidVersionNumbers,
        at: false,
        stack: false
      })
    }
    return false
  }
}
