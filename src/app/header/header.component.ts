import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import * as fromApp from '../store/app.reducer';

import * as AuthActions from '../auth/store/auth.actions';
import * as RecipeActions from '../recipes/store/recipe.actions';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  isAuthanticated = false;
  collapsed= true;
  private userSub: Subscription;

  constructor(
   
    private authService: AuthService,
    private router: Router,
    private store: Store<fromApp.AppState>
  ) {}

  ngOnInit(): void {
    this.userSub = this.store
      .select('auth')
      .pipe(map((authState) => authState.user))
      .subscribe((user) => {
        this.isAuthanticated = !!user;
        console.log(this.isAuthanticated);
      });
  }

  onSaveData() {
    this.store.dispatch(RecipeActions.storeRecipes());
  }
  onFetchData() {
    this.store.dispatch(RecipeActions.fetchRecipes());
  }
  onLogout() {
    this.store.dispatch(AuthActions.logout());
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
  }
}
