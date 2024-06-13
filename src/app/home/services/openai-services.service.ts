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
    - weatherConditions: ${requirements.weatherConditions}
    - seasonalPreferences: ${requirements.seasonalPreferences}
    - desiredJob: ${requirements.desiredJob}
    - averageSalary: Approximately ${requirements.averageSalary}/month
    - costOfLiving: Approximately ${requirements.costOfLiving}/month
    `;

    console.log(prompt);

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
  }
}
