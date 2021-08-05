import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from '@angular/router';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';

import { Recipe } from './recipe.model';
import * as frommApp from '../store/app.reducer';
import * as RecipeActions from './store/recipe.actions';
import { recipeReducer } from './store/recipe.reducer';

import { map, switchMap, take } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RecipesResolverService implements Resolve<{recipes :Recipe[]}> {
  constructor(
    private store: Store<frommApp.AppState>,
    private actions$: Actions
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // return this.dataStorageService.fetchRecipes();
    return this.store.select('recipes').pipe(
      take(1),
      map((recipeState) => {
        return recipeState.recipes;
      }),
      switchMap((recipes) => {
        if (recipes.length === 0) {
          this.store.dispatch(RecipeActions.fetchRecipes());
          return this.actions$.pipe(ofType(RecipeActions.setRecipes), take(1));
        } else {
          return of({recipes});
        }
      })
    );
  }
}
