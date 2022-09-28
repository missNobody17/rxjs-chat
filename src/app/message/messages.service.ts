import { Observable } from "rxjs";
import { Subject } from "rxjs"
import { Thread } from "../thread/thread.model";
import { User } from "../user/user.model";
import { Message } from "./message.model";
import { filter, map, scan, share} from 'rxjs/operators';

const initialMessages: Message[] = [];

export class MessagesService {
    newMessages: Subject< Message > = new Subject<Message>();
    updates: Subject<any> = new Subject<any>();
    messages: Observable<Message[]>;
    create: Subject<Message> = new Subject<Message>();
    markThreadAsRead: Subject<any> = new Subject<any>();

    constructor() {
        this.messages = this.updates.pipe(
            scan((messages: Message[], operation: IMessagesOperation) => {
                return operation(messages)
            }, initialMessages),
            share());

        this.create.pipe(map(function(message: Message): IMessagesOperation {
            return (messages: Message[]) => {
                return messages.concat(message);
            }
        })).subscribe(this.updates);

        this.newMessages.subscribe(this.create);

        this.markThreadAsRead.pipe(map((thread:Thread) => {
            return (messages: Message[]) => {
                return messages.map((message: Message) => {
                    if(message.thread.id === thread.id) {
                        message.isRead = true;
                    }
                    return message;
                });
            };
        }))
        .subscribe(this.updates);
    }

    addMessage(message: Message) : void {
        this.newMessages.next(message);
    }

    messagesForThreadUser(thread: Thread, user: User): Observable<Message> {
        return this.newMessages.pipe(filter((message: Message) => {
            return (message.thread.id === thread.id) && (message.author.id !== user.id);
        }))
    }
}

interface IMessagesOperation extends Function {
    (message: Message[]): Message[];
}