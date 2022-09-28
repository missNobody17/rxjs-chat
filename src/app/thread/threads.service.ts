import { Injectable } from "@angular/core";
import { map, Observable, combineLatestWith } from "rxjs";
import { Message } from "../message/message.model";
import { MessagesService } from "../message/messages.service";
import { Thread } from "./thread.model";
import * as _ from 'lodash';
import { Subject } from "rxjs";
import { BehaviorSubject } from "rxjs";

@Injectable()
export class ThreadsService {
    threads: Observable<{[key: string]: Thread}>;
    orderedThreads: Observable<Thread[]>;
    currentThread: Subject<Thread> = new BehaviorSubject<Thread>(new Thread());
    currentThreadMessages: Observable<Message[]>;

    constructor(private messageService: MessagesService) {
        this.threads = messageService.messages.pipe(map((messages: Message[]) => {
            const threads: {[key: string]: Thread} = {};
            messages.map((message: Message) => {
                threads[message.thread.id] = threads[message.thread.id] || message.thread;
                const messageThread: Thread = threads[message.thread.id];
                if(!messageThread.lastMessage || messageThread.lastMessage.sentAt < message.sentAt) {
                    messageThread.lastMessage = message;
                }
            });
            return threads;
        }));

        this.orderedThreads = this.threads.pipe(map((threadGroup: {[key: string]: Thread}) => {
            const threads: Thread[] = _.values(threadGroup);
            return _.sortBy(threads, (t: Thread) => t.lastMessage.sentAt).reverse();
        }));

        this.currentThreadMessages = this.currentThread.pipe(
            combineLatestWith(messageService.messages),
            map(([currentThread, messages]: [Thread, Message[]]): Message[] => {
                if (currentThread && messages.length > 0) {
                    return messages
                    .filter((message: Message) => message.thread.id === currentThread.id)
                    .map((message: Message) => {
                        message.isRead = true;
                        return message;
                    });
                } else {
                        return [];
                    }
                })
                )

        this.currentThread.subscribe(this.messageService.markThreadAsRead);
    }

    setCurrentThread(newThread: Thread): void {
        this.currentThread.next(newThread);
    }

}