import { environment } from '../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { City, Requirements } from '../interfaces/city.interface';
import { OpenAI } from 'openai';
import { last } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OpenaiService {
  private openAI = new OpenAI({ apiKey: environment.openaiKey, dangerouslyAllowBrowser: true });
  private assistantId = 'asst_mgL6I4iUg26fzR8OXDNBWVDN'
  private thread = this.openAI.beta.threads.create();

  async getGPT3Response(requirements: Requirements): Promise<City[]> {
    const prompt = `
    - qualityOfLife: Approximately ${requirements.qualityOfLife}/100
    - happinessRate: Approximately ${requirements.happinessRate}/100
    - publicServices: Approximately ${requirements.publicServices}/100
    - safety: Approximately ${requirements.safety}/100
    - desiredJob: ${requirements.desiredJob}
    - averageSalary: Approximately ${requirements.averageSalary}
    - costOfLiving: Approximately ${requirements.costOfLiving}
    `;

    const message = this.openAI.beta.threads.messages.create(
      (await this.thread).id,
      {
        role: 'user',
        content: prompt,
      }
    );

    const run = this.openAI.beta.threads.runs.createAndPoll(
      (await this.thread).id,
      { assistant_id: this.assistantId }
    )
    if ((await run).status === 'completed') {
      const messsages = await this.openAI.beta.threads.messages.list((await this.thread).id);
      const lastMessage = messsages.data[0];
      return lastMessage.content[0].type === 'text' ? JSON.parse(lastMessage.content[0].text.value).cities : null ;
    }
    return [];
//     return JSON.parse(`
// [
//   {"name": "Varna", "country": "Bulgaria", "qualityOfLife": "35", "happinessRate": "37", "publicServices": "34", "safety": "39", "averageSalary": "1450", "costOfLiving": "540"},
//   {"name": "Skopje", "country": "North Macedonia", "qualityOfLife": "36", "happinessRate": "38", "publicServices": "36", "safety": "37", "averageSalary": "1380", "costOfLiving": "550"},
//   {"name": "Podgorica", "country": "Montenegro", "qualityOfLife": "34", "happinessRate": "36", "publicServices": "33", "safety": "38", "averageSalary": "1420", "costOfLiving": "530"},
//   {"name": "Novi Sad", "country": "Servia", "qualityOfLife": "36", "happinessRate": "37", "publicServices": "35", "safety": "36", "averageSalary": "1370", "costOfLiving": "540"},
//   {"name": "Tirana", "country": "Albania", "qualityOfLife": "35", "happinessRate": "37", "publicServices": "34", "safety": "37", "averageSalary": "1390", "costOfLiving": "550"},
//   {"name": "Bishkek", "country": "Kyrgyzstan", "qualityOfLife": "36", "happinessRate": "38", "publicServices": "35", "safety": "36", "averageSalary": "1400", "costOfLiving": "540"}
// ]
// `)
  }
}
