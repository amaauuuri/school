import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

import { firebaseConfig } from './firebase/firebase.config';

export const appConfig: ApplicationConfig = {

  providers: [

    provideRouter(routes),

    provideFirebaseApp(() =>
      initializeApp(firebaseConfig)
    ),

    provideFirestore(() =>
      getFirestore()
    )

  ]

};