import test from 'ava';
import type { ExecutionContext } from 'ava';
import NoVersionFieldRule from '../../src/rules/no-version-field-rule';
import type { LintContext } from '../../src/linter/linter.types';

// Sample YAML for tests
const yamlWithVersion = `
version: '3'
services:
  web:
    image: nginx
`;

const yamlWithoutVersion = `
services:
  web:
    image: nginx
`;

// @ts-ignore TS2349
test('NoVersionFieldRule: should return an error when "version" field is present', (t: ExecutionContext) => {
  const rule = new NoVersionFieldRule();
  const context: LintContext = {
    path: '/docker-compose.yml',
    content: {
      version: '3',
      services: {
        web: {
          image: 'nginx',
        },
      },
    },
    sourceCode: yamlWithVersion,
  };

  const errors = rule.check(context);
  t.is(errors.length, 1, 'There should be one error when the "version" field is present.');
  t.is(errors[0].message, 'The "version" field should not be present.');
  t.is(errors[0].rule, 'no-version-field');
  t.is(errors[0].severity, 'minor');
});

// @ts-ignore TS2349
test('NoVersionFieldRule: should not return errors when "version" field is not present', (t: ExecutionContext) => {
  const rule = new NoVersionFieldRule();
  const context: LintContext = {
    path: '/docker-compose.yml',
    content: {
      services: {
        web: {
          image: 'nginx',
        },
      },
    },
    sourceCode: yamlWithoutVersion,
  };

  const errors = rule.check(context);
  t.is(errors.length, 0, 'There should be no errors when the "version" field is absent.');
});

// @ts-ignore TS2349
test('NoVersionFieldRule: should fix by removing the "version" field', (t: ExecutionContext) => {
  const rule = new NoVersionFieldRule();
  const fixedYAML = rule.fix(yamlWithVersion);

  t.false(fixedYAML.includes('version:'), 'The "version" field should be removed.');
});

// @ts-ignore TS2349
test('NoVersionFieldRule: should not modify YAML without "version" field', (t: ExecutionContext) => {
  const rule = new NoVersionFieldRule();
  const fixedYAML = rule.fix(yamlWithoutVersion);

  t.is(fixedYAML.trim(), yamlWithoutVersion.trim(), 'YAML without "version" should remain unchanged.');
});
