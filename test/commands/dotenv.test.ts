import {expect, test} from '@oclif/test'

describe('dotenv', () => {
  test
  .stdout()
  .stderr()
  .command(['dotenv'])
  .exit(2)
  .it('should fail to run dotenv when no environmentName is specified')

  test
  .stdout()
  .command(['dotenv', 'dev'])
  .it('runs dotenv dev', ctx => {
    expect(ctx.stdout).to.contain('Generating .env from ./.env.dev file...')
  })

  test
  .stdout()
  .command(['dotenv', 'prod'])
  .it('runs dotenv prod', ctx => {
    expect(ctx.stdout).to.contain('Generating .env from ./.env.prod file...')
  })
})
