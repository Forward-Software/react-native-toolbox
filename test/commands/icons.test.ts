import {expect, test} from '@oclif/test'

describe('icons', () => {
  test
  .stdout()
  .stderr()
  .command(['icons'])
  .exit(2)
  .it('should fail to run icons when no app.json file exists')

  test
  .stdout()
  .command(['icons', '--appName', 'test'])
  .it('runs icons --appName test', ctx => {
    expect(ctx.stdout).to.contain("Generating icons for 'test' app...")
  })
})
