import { environment } from '../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { Requirements } from '../interfaces/city.interface';

@Injectable({
  providedIn: 'root',
})
export class OpenaiService {
  private apiUrl = 'https://api.openai.com/v1/engines/gpt-3.5-turbo-0125/completions';

  private http: HttpClient = inject(HttpClient);

  getGPT3Response(requirements: Requirements) {
    const prompt = `You are an AI trained on a vast dataset of global city information. Your objective is to generate a consistent list of 6 cities that match the following specific user requirements. The data should remain consistent across different requests. Format the output as a JSON object, where each entry is a (city, country) pair as the key, and its details as the value. Exclude the "desired job" from the details. Ensure the cities meet the criteria as closely as possible without going far beyond the specified values:
- Quality of life: Approximately ${requirements['Quality of life']}/100
- Happiness rate: Approximately ${requirements['Happiness rate']}/100
- Public services: Approximately ${requirements['Public services']}/100
- Safety: Approximately ${requirements['Safety']}/100
- Desired job: ${requirements['Desired job']}
- Average salary: Around ${requirements['Average salary']}
- Cost of living: Around ${requirements['Cost of living']}

Please provide cities that meet these criteria as closely as possible without significantly exceeding them. Be as accurate as possible across requests. Do not make up the data. Example of expected output format:
{
  "City1, Country1": {"Quality of life": "70", "Happiness rate": "65", "Public services": "40", "Safety": "35", "Average salary": "1900", "Cost of living": "850"},
  "City2, Country2": {...}
}`;

    console.log(prompt);

    return this.http.post(this.apiUrl, {
      prompt: prompt,
      max_tokens: 1000,
    }, {
      headers: {
        'Authorization': `Bearer ${environment.openaiKey}`
      }
    }).pipe(
      map((response: any) => JSON.parse(response['choices'][0].text))
    );
  }
}
