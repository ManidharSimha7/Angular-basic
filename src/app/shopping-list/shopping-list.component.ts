import { Component, OnInit, OnDestroy } from '@angular/core';

import { Ingredient } from '../shared/ingredient.model';

import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromApp from '../store/app.reducer';
import * as ShoppingListActions from './store/shopping-list.actions'
@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.css'],
})
export class ShoppingListComponent implements OnInit {
  ingredients: Observable<{ingredients: Ingredient[]}>;
  private igChangeSub: Subscription;
  constructor(
    private store: Store<fromApp.AppState>) {}

  ngOnInit(): void {
   this.ingredients= this.store.select('shoppingList');
    // this.ingredients = this.slService.getIngredients();
    // this.igChangeSub = this.slService.ingredientChange.subscribe(
    //   (ingredients: Ingredient[]) => {
    //     this.ingredients = ingredients;
     // }
   // );
  }

  onEditItem(index: number) {
    this.store.dispatch(ShoppingListActions.startEdit({index}));
  }

  ngOnDestroy(): void {
    // this.igChangeSub.unsubscribe();
  }
}
