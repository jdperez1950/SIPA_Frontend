import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EvaluationAxis } from '../../project-wizard.types';

@Component({
  selector: 'app-step-evaluation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './step-evaluation.component.html',
  styles: []
})
export class StepEvaluationComponent {
  @Input({ required: true }) axes: EvaluationAxis[] = [];
  @Output() toggleAxis = new EventEmitter<string>();
}
