import {expect, test} from '@oclif/test'

describe('splash', () => {
  test
  .stdout()
  .stderr()
  .command(['splash'])
  .exit(2)
  .it('should fail to run splash when no app.json file exists')

  test
  .stdout()
  .command(['splash', '--appName', 'test'])
  .it('runs splash --appName test', ctx => {
    expect(ctx.stdout).to.contain("Generating splashscreens for 'test' app...")
  })
})
