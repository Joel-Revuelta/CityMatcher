import { Component } from '@angular/core';
import { CityFormComponent } from '../components/city-form/city-form.component';

@Component({
  standalone: true,
  imports: [CityFormComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent {

}
