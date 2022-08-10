import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { host, key } from '../../environments/api';

export interface Game {
  developer: string;
  game_url: string;
  genre: string;
  id: number;
  platform: string;
  publisher: string;
  release_date: string;
  short_description: string;
  thumbnail: string;
  title: string;
}

interface FilterCriteria {
  genre?: string | null;
  platform?: string | null;
  title?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class GamesService {
  private readonly _filterCriteria = new BehaviorSubject<FilterCriteria | null>(null);
  private readonly _games = new BehaviorSubject<Game[] | null>(null);
  private readonly _genres = new BehaviorSubject<string[] | null>(null);

  readonly games$: Observable<Game[] | null> = this.getGamesByFilter();
  readonly genres$: Observable<string[] | null> = this._genres.asObservable();

  constructor(private http: HttpClient) {
    this.getGames().subscribe();
  }

  private getGames(): Observable<Game[]> {
    const headers = new HttpHeaders()
      .set('X-RapidAPI-Key', key)
      .set('X-RapidAPI-Host', host);

    return this.http.get<Game[]>(`https://${host}/api/games?sort-by=release-date`, { headers }).pipe(
      tap(games => {
        const genres: string[] = [];

        games.forEach(game => {
          const genre = game.genre ? game.genre.trim() : null;

          if (genre && !genres.includes(genre)) {
            genres.push(genre);
          }
        });

        this._games.next(games);
        this._genres.next(genres.sort());
      })
    )
  }

  private getGamesByFilter(): Observable<Game[] | null> {
    return combineLatest([
      this._games.asObservable(),
      this._filterCriteria.asObservable()
    ]).pipe(
      map(([games, filterCriteria]) => {
        if (games && filterCriteria) {
          return games
            .filter(game => filterCriteria.title ? game.title.toLowerCase().includes(filterCriteria.title.toLowerCase()) : game)
            .filter(game => filterCriteria.platform ? game.platform.toLowerCase().includes(filterCriteria.platform) : game)
            .filter(game => filterCriteria.genre ? filterCriteria.genre === game.genre : game);
        }

        return games;
      })
    );
  }

  changeFilter(filterCriteria: FilterCriteria): void {
    this._filterCriteria.next(filterCriteria);
  }
}
