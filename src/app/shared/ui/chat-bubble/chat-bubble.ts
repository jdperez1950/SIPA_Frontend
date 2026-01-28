import { Component, input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-chat-bubble',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './chat-bubble.html',
  styleUrl: './chat-bubble.scss',
})
export class ChatBubbleComponent {
  message = input.required<string>();
  author = input.required<string>();
  date = input.required<Date>();
  isSelf = input<boolean>(false);
}
