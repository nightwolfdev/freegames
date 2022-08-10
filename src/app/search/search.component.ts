import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { Observable } from 'rxjs';

import { Game, GamesService } from '../shared/games.service';

interface FilterForm {
  genre?: FormControl<string | null>;
  platform?: FormControl<string | null>;
  title?: FormControl<string | null>;
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  form: FormGroup<FilterForm>;
  games$: Observable<Game[] | null>;
  genres$: Observable<string[] | null>;
  platforms$: Observable<string[] | null>;

  constructor(private gamesSvc: GamesService) { }

  ngOnInit(): void {
    this.form = new FormGroup<FilterForm>({
      genre: new FormControl(''),
      platform: new FormControl(''),
      title: new FormControl('')
    });

    this.games$ = this.gamesSvc.games$;
    this.genres$ = this.gamesSvc.genres$;
  }

  filterGames(): void {
    this.gamesSvc.changeFilter(this.form.value);
  }
}
