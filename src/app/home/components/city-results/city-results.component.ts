import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { City } from '../../interfaces/city.interface';

@Component({
  selector: 'app-city-results',
  standalone: true,
  imports: [],
  templateUrl: './city-results.component.html',
  styleUrl: './city-results.component.scss'
})
export class CityResultsComponent {

  @Input()
  public cities: City[] = [];


}
