
import {Command, flags} from '@heroku-cli/command'
import * as Heroku from '@heroku-cli/schema'

import * as HerokuCI from '../../lib/interface'
import {disambiguatePipeline} from '../../lib/utils/pipelines'

export default class Info extends Command {
  static description = 'show the status of a specific test run'

  static examples = [
    `$ heroku ci:info 1288 --app murmuring-headland-14719
`,
  ]

  static flags = {
    app: flags.app({required: false}),
    node: flags.string({description: 'the node number to show its setup and output', required: false}),
    pipeline: flags.pipeline({required: false})
  }

  static args = [{name: 'test-run', required: true}]

  async run() {
    const {args, flags} = this.parse(Info)
    let pipeline

    if ((!flags.pipeline) && (!flags.app)) {
      this.error('Required flag:  --pipeline PIPELINE or --app APP')
    }

    if (flags.pipeline) {
      pipeline = await disambiguatePipeline(flags.pipeline, this.heroku)
    } else {
      const {body: coupling} = await this.heroku.get<Heroku.PipelineCoupling>(`/apps/${flags.app}/pipeline-couplings`)
      if ((coupling) && (coupling.pipeline)) {
        pipeline = coupling.pipeline
      } else {
        this.error(`No pipeline found associated to application ${flags.app}`)
      }
    }

    const headers =  {Accept: 'application/vnd.heroku+json; version=3.ci'}

    const {body: testRun} = await this.heroku.get<HerokuCI.TestRun>(`/pipelines/${pipeline.id}/test-runs/${args['test-run']}`, {headers})
    const {body: testNodes} = await this.heroku.get(`/test-runs/${testRun.id}/test-nodes`, {headers})

    this.log(testRun)
    this.log(testNodes)
    // if (flags.node) {
    //   if (testNodes.length > 1) {
    //     testNode = testNodes[flags.node]

    //     if (!testNode) {
    //       cli.error(`There isn't a test node ${flags.node} for test run ${args['test-run']}`)
    //     }
    //   } else {
    //     testNode = testNodes[0]
    //   }

    //   await renderNodeOutput(testRun, testNode)

    //   if (testNodes.length === 1) {
    //     this.log(/* newline 💃 */)
    //     this.warn('This pipeline doesn\'t have parallel test runs, but you specified a node')
    //     this.warn('See https://devcenter.heroku.com/articles/heroku-ci-parallel-test-runs for more info')
    //   }
    //   process.exit(testNode.exit_code)
    // } else {
    //   if (testNodes.length > 1) {
    //     this.log(RenderTestRuns.printLine(testRun))
    //     this.log(/* newline 💃 */)
    //     testNodes.forEach((testNode) => {
    //       this.log(RenderTestRuns.printLineTestNode(testNode))
    //     })
    //   } else {
    //     testNode = testNodes[0]
    //     await renderNodeOutput(testRun, testNode);
    //     process.exit(testNode.exit_code)
    //   }
    // }

    // if node is specified, show output and setup stream url for that node
    // if no node is specified, show minimal information
  }
}
