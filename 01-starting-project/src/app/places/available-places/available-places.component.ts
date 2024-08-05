import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { Place } from '../place.model';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { HttpClient } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';

@Component({
  selector: 'app-available-places',
  standalone: true,
  templateUrl: './available-places.component.html',
  styleUrl: './available-places.component.css',
  imports: [PlacesComponent, PlacesContainerComponent],
})
export class AvailablePlacesComponent implements OnInit {
  places = signal<Place[] | undefined>(undefined);
  isFetching = signal(false)
  error = signal('')
  private httpClient = inject(HttpClient);
  private destroyRef = inject(DestroyRef)

  ngOnInit (){
    this.isFetching.set(true)
    const subscription = this.httpClient
    .get<{places: Place[]}>('http://localhost:3000/places')
    .pipe(
      map((response) => response.places),
      catchError((error)=> {
        this.error.set('error')
        console.log(this.error())
        return throwError(() => new Error('Looi'))
      }
    )
    )
    .subscribe({
      next: (res)=> {
        this.places.set(res)
        // this.error.set('Lỗi')
        // console.log(this.error())
      },
      complete: () => {
        this.isFetching.set(false)
      }
    })
    this.destroyRef.onDestroy(()=> {
      subscription.unsubscribe();
    })
  }
}
