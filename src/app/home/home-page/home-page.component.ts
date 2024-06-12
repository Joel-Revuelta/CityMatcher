import { Component } from '@angular/core';
import { CityFormComponent } from '../components/city-form/city-form.component';
import { City } from '../interfaces/city.interface';
import { CityResultsComponent } from '../components/city-results/city-results.component';

@Component({
  standalone: true,
  imports: [
    CityFormComponent,
    CityResultsComponent
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent {

  public cities: any = [];

  public displayCities(cities: City[]): void {
    this.cities = cities;
  }

}
