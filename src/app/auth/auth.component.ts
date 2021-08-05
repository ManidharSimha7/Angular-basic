import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { Store } from '@ngrx/store';
import {Subscription } from 'rxjs';

import * as fromApp from '../store/app.reducer';
import * as AuthActions from './store/auth.actions';
@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
})
export class AuthComponent implements OnInit, OnDestroy {
  isLoginMode = true;
  isLoading = false;
  error: string = null;

  storeSub: Subscription;

  constructor(
    private store: Store<fromApp.AppState>
  ) {}
  ngOnInit() {
    this.storeSub = this.store.select('auth').subscribe((authState) => {
      this.isLoading = authState.loading;
      this.error = authState.authError;
    });
  }

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;

    if (this.isLoginMode) {
      
      this.store.dispatch(AuthActions.loginStart({ email, password }));
    } else {
     
      this.store.dispatch(AuthActions.signupStart({ email, password }));
    }

    

    form.reset();
  }

  onHandleError() {
    this.store.dispatch( AuthActions.clearError());
  }

  ngOnDestroy() {
    if (this.storeSub) {
      this.storeSub.unsubscribe();
    }
  }
}