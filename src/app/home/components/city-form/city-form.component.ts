import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button'
import { OpenaiService } from '../../services/openai-services.service';
import { City, Requirements } from '../../interfaces/city.interface';

@Component({
  selector: 'app-city-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSliderModule,
    MatInputModule,
    MatButtonModule
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
      desiredJob: formValues.desiredJob,
      averageSalary: formValues.averageSalary,
      costOfLiving: formValues.costOfLiving
    };

    try {
      this.cities = await this.OpenaiService.getGPT3Response(requirements);
      console.log(this.cities);
      this.onSearch.emit(this.cities);
    } catch (error) {
      console.error(error);
      this.cities = [];
    } finally {
      this.loading = false;
    }
  }

}
