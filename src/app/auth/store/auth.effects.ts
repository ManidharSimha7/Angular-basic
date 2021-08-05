import { Actions, createEffect, Effect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import * as AuthActions from './auth.actions';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { of } from 'rxjs';
import { Injectable } from '@angular/core';
import { User } from '../user.modal';
import { AuthService } from '../auth.service';

export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

const handleAuthentication = (
  expiresIn: number,
  email: string,
  userId: string,
  token: string
) => {
  const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
  const user = new User(email, userId, token, expirationDate);
  localStorage.setItem('userData', JSON.stringify(user));
  return AuthActions.authenticateSuccess({
    email: email,
    userId: userId,
    token: token,
    expirationDate: expirationDate,
    redirect: true,
  });
};

const handleError = (errorRes: HttpErrorResponse) => {
  let err = 'UNOWN ERROR';

  if (!errorRes.error || !errorRes.error.error) {
    return of(AuthActions.authenticateFail({errorMessage:err}));
  }
  switch (errorRes.error.error.message) {
    case 'EMAIL_EXISTS':
      err = 'This email exists already';
      break;
    case 'EMAIL_NOT_FOUND':
      err = 'This email not exists ';
      break;
  }

  return of(AuthActions.authenticateFail({errorMessage: err}));
};

@Injectable()
export class AuthEffects {
  authLogout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          this.authService.clearLogoutTimer();
          localStorage.removeItem('userData');
          this.router.navigate(['/auth']);
        })
      ),
    { dispatch: false }
  );

  autoLogin$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.autoLogin),
      map(() => {
        const userData: {
          email: string;
          id: string;
          _token: string;
          _tokenExpirationDate: Date;
        } = JSON.parse(localStorage.getItem('userData'));
        if (!userData) {
          return { type: 'dummy' };
        }

        const loadedUser: User = new User(
          userData.email,
          userData.id,
          userData._token,
          new Date(userData._tokenExpirationDate)
        );

        if (loadedUser.token) {
          const expirationDuration: number =
            new Date(userData._tokenExpirationDate).getTime() -
            new Date().getTime();

          this.authService.setLogoutTimer(expirationDuration);
          return AuthActions.authenticateSuccess({
            email: loadedUser.email,
            userId: loadedUser.id,
            token: loadedUser.token,
            expirationDate: new Date(userData._tokenExpirationDate),
            redirect: false,
          });
        }
        return { type: 'dummy' };
      })
    )
  );

  authSignup$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.signupStart),
      switchMap((action) => {
        return this.http
          .post<AuthResponseData>(
            'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' +
              environment.fireBaseApiKey,
            {
              email: action.email,
              password: action.password,
              returnSecureToken: true,
            }
          )
          .pipe(
            tap((resData) => {
              this.authService.setLogoutTimer(+resData.expiresIn * 1000);
            }),
            map((resData) => {
              return handleAuthentication(
                +resData.expiresIn,
                resData.email,
                resData.localId,
                resData.idToken
              );
            }),
            catchError((errRes) => handleError(errRes))
          );
      })
    )
  );

  authLogin = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginStart),
      switchMap((action) => {
        return this.http
          .post<AuthResponseData>(
            'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' +
              environment.fireBaseApiKey,
            {
              email: action.email,
              password: action.password,
              returnSecureToken: true,
            }
          )
          .pipe(
            tap((resData) => {
              this.authService.setLogoutTimer(+resData.expiresIn * 1000);
            }),
            map((resData) => {
              return handleAuthentication(
                +resData.expiresIn,
                resData.email,
                resData.localId,
                resData.idToken
              );
            }),
            catchError((errRes) => handleError(errRes))
          );
      })
    ),
    {useEffectsErrorHandler : false}
  );

  authRedirect$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.authenticateSuccess),
        tap((action) => action.redirect && this.router.navigate(['/']))
      ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}
}
