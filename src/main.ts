import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideRouter, Routes } from '@angular/router';
import { AppComponent } from './app/app.component';
import { CardListComponent } from './app/components/card-list/card-list.component';
import { EditorComponent } from './app/components/editor/editor.component';

const routes: Routes = [
  { path: '', component: CardListComponent },
  { path: 'editor', component: EditorComponent },
  { path: '**', redirectTo: '' },
];

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(routes),
  ]
}).catch(err => console.error(err));
