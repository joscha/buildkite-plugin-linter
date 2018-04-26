const assert = require('chai').assert
const linter = require('../lib/linters/plugin-yaml-linter')
const path = require('path')
const fixtures = path.join(__dirname, 'plugin-yaml-linter')

describe('plugin-yaml-linter', () => {
  describe('valid plugin', () => {
    it('should be valid', async () => {
      assert(await linter({
        name: 'valid-plugin',
        path: path.join(fixtures, 'valid-plugin'),
        silent: true
      }))
    })
  });

  [ 'missing-name',
    'missing-description',
    'missing-author',
    'missing-requirements',
    'missing-configuration',
    'missing-configuration-properties',
    'missing-configuration-required',
    'missing-configuration-additional-properties'
  ].forEach((invalidCase) => {
    describe(invalidCase, () => {
      it('should be invalid', async () => {
        assert.isFalse(await linter({
          name: invalidCase,
          path: path.join(fixtures, invalidCase),
          silent: true
        }))
      })
    })
  })
})