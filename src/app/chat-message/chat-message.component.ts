import { Component, Input, OnInit } from '@angular/core';
import { Message } from '../message/message.model';
import { User } from '../user/user.model';
import { UserService } from '../user/users.service';

@Component({
  selector: 'chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.css']
})
export class ChatMessageComponent implements OnInit {

  @Input() message: Message;
  currentUser: User;
  incoming: boolean = false;

  constructor(public usersService: UserService) { }

  ngOnInit(): void {
    this.usersService.currentUser.subscribe((user: User) =>{
      this.currentUser = user;
      if(this.message.author && user) {
        this.incoming = this.message.author.id !== user.id;
      }
    })
  }

}
