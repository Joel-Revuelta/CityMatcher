import { Component, Input } from '@angular/core';
import { City } from '../../interfaces/city.interface';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-city-results',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './city-results.component.html',
  styleUrl: './city-results.component.scss'
})
export class CityResultsComponent {

  @Input()
  public cities: City[] = [];


}
