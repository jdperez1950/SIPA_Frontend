import { Routes } from '@angular/router';
import { WorkspaceLayoutComponent } from './layout/workspace-layout.component';
import { QuestionPageComponent } from './pages/question-page/question-page.component';

export const PROJECT_WORKSPACE_ROUTES: Routes = [
  {
    path: '',
    component: WorkspaceLayoutComponent,
    children: [
      {
        path: 'project/:projectId/question/:questionId',
        component: QuestionPageComponent
      },
      {
        path: 'project/:projectId/question',
        component: QuestionPageComponent
      },
      {
        path: 'question/:questionId',
        component: QuestionPageComponent
      },
      {
        path: '',
        redirectTo: '../projects',
        pathMatch: 'full'
      }
    ]
  }
];
