import { Routes } from '@angular/router';
import { WorkspaceLayoutComponent } from './layout/workspace-layout.component';
import { QuestionPageComponent } from './pages/question-page/question-page.component';

export const PROJECT_WORKSPACE_ROUTES: Routes = [
  {
    path: '',
    component: WorkspaceLayoutComponent,
    children: [
      {
        path: 'question/:id',
        component: QuestionPageComponent
      },
      {
        path: '',
        redirectTo: 'question/q1', // Default to first question logic to be improved
        pathMatch: 'full'
      }
    ]
  }
];
