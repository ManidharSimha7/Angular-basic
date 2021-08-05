import { Component, OnInit } from '@angular/core';

import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

import * as fromApp from '../store/app.reducer';
import * as  RecipeActions from './store/recipe.actions';

@Component({
  selector: 'app-recipes',
  templateUrl: './recipes.component.html',
  styleUrls: ['./recipes.component.css'],
  providers: [],
})
export class RecipesComponent implements OnInit {
  constructor(
    private store: Store<fromApp.AppState>,

    private actions$ : Actions
  ) {}

  ngOnInit(): void {

  }
}
