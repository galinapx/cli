import {prompt} from 'inquirer'
import {isUUID} from 'validator'

import {APIClient} from '@heroku-cli/command'

import * as Heroku from '@heroku-cli/schema'

export async function disambiguatePipeline(pipelineIDOrName: any, apiClient: APIClient) {
  const headers = {Accept: 'application/vnd.heroku+json; version=3.pipelines'}

  if (isUUID(pipelineIDOrName)) {
    const {body: pipeline} = await apiClient.get<Heroku.Pipeline>(`/pipelines/${pipelineIDOrName}`, {headers})
    return pipeline
  } else {
    const {body: pipelines} = await apiClient.get<Heroku.Pipeline>(`/pipelines?eq[name]=${pipelineIDOrName}`, {headers})

    switch (pipelines.length) {
      case 0:
        this.error('Pipeline not found')
        break
      case 1:
        return pipelines[0]
      default:
        let choices = pipelines.map(function (x: any) { return {name: new Date(x.created_at), value: x} })
        let questions = [{
          type: 'list',
          name: 'pipeline',
            message: `Which ${pipelineIDOrName} pipeline?`,
            choices
        }]

        return prompt(questions)
    }
  }
}
