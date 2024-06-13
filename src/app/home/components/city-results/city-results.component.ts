import { Component, Input } from '@angular/core';
import { City } from '../../interfaces/city.interface';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-city-results',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule
  ],
  templateUrl: './city-results.component.html',
  styleUrl: './city-results.component.scss'
})
export class CityResultsComponent {

  @Input()
  public cities: City[] = [];

  openInMaps(name: string, country: string): void {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ', ' + country)}`;
    window.open(url, '_blank');
  }

}
