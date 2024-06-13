import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button'
import { OpenaiService } from '../../services/openai-services.service';
import { City, Requirements } from '../../interfaces/city.interface';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-city-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSliderModule,
    MatInputModule,
    MatButtonModule,
    MatExpansionModule,
    MatAccordion,
    MatProgressSpinnerModule,
    MatSelectModule
  ],
  templateUrl: './city-form.component.html',
  styleUrl: './city-form.component.scss'
})
export class CityFormComponent {

  @Output()
  public onSearch: EventEmitter<City[]> = new EventEmitter<City[]>();

  private fb: FormBuilder = inject(FormBuilder);
  private OpenaiService: OpenaiService = inject(OpenaiService);

  public cityForm: FormGroup = this.fb.group({
    qualityOfLife: [50],
    happiness: [50],
    publicServices: [50],
    safety: [50],
    weatherConditions: [''],
    seasonalPreferences: [''],
    desiredJob: [''],
    averageSalary: [0],
    costOfLiving: [0]
  });

  public cities: City[] = [];
  public loading = false;

  public async handleSubmit(): Promise<void> {
    this.loading = true;
    const formValues = this.cityForm.value;

    const requirements: Requirements = {
      qualityOfLife: formValues.qualityOfLife,
      happinessRate: formValues.happiness,
      publicServices: formValues.publicServices,
      safety: formValues.safety,
      weatherConditions: formValues.weatherConditions,
      seasonalPreferences: formValues.seasonalPreferences,
      desiredJob: formValues.desiredJob,
      averageSalary: formValues.averageSalary,
      costOfLiving: formValues.costOfLiving
    };

    try {
      this.cities = await this.OpenaiService.getGPT3Response(requirements);
      this.cities = this.calculateCoincidence(this.cities, requirements);
      this.cities.sort((a, b) => b.coincidence! - a.coincidence!);
      console.log(this.cities);
      this.onSearch.emit(this.cities);
    } catch (error) {
      console.error(error);
      this.cities = [];
    } finally {
      this.loading = false;
    }
  }

  private calculateCoincidence(cities: City[], requirements: Requirements): City[] {
    return cities.map(city => {
      let nbOfDifferences = 4;
      const qualityOfLifeDiff = 100 - Math.abs(city.qualityOfLife - requirements.qualityOfLife);
      const happinessRateDiff = 100 - Math.abs(city.happinessRate - requirements.happinessRate);
      const publicServicesDiff = 100 - Math.abs(city.publicServices - requirements.publicServices);
      const safetyDiff = 100 - Math.abs(city.safety - requirements.safety);
      let salaryByCostOfLivingDiff = 0;

      if (requirements.averageSalary > 0 && requirements.costOfLiving > 0) {
        const salaryByCostOfLiving = requirements.costOfLiving / requirements.averageSalary * 100;
        const citySalaryByCostOfLiving = city.costOfLiving / city.averageSalary * 100;
        salaryByCostOfLivingDiff = 100 - Math.abs(salaryByCostOfLiving - citySalaryByCostOfLiving);
        nbOfDifferences++;
      }

      const averageDiff = (qualityOfLifeDiff + happinessRateDiff + publicServicesDiff + safetyDiff + salaryByCostOfLivingDiff) / nbOfDifferences;

      return { ...city, coincidence: averageDiff };
    });
  }

}
