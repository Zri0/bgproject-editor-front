import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EditorComponent } from './components/editor/editor.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, EditorComponent],
  template: `<app-editor></app-editor>`,
  styles: []
})
export class AppComponent {
  title = 'card-editor';
}
