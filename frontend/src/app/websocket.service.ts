import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { AnonymousSubject } from 'rxjs/internal/Subject';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

const WS_URL = 'ws://127.0.0.1:9091/services';

export interface SentMessage {
  topic: string;
  type: string;
}
export class ReceivedMessage implements SentMessage {
  topic: string;
  type: string;
  content: Content;
}
export interface Content {
  nextMessageText: { DATIS: string; ENGLISH: string; SPANISH: string };
  messageText: { DATIS: string; ENGLISH: string; SPANISH: string };
  atisFields: AtisFields;
  atisCode: string;
  type: string;
  fieldName: string;
  value: string;
  releaseTime: string;
  nextIcaoCode: string;
  fieldState: string;
}
export interface AtisFields {
  [key: string]: {
    state: string;
    name: string;
    value: string;
  };
}
@Injectable()
export class WebsocketService {
  private subject: AnonymousSubject<MessageEvent>;
  public messages: Subject<ReceivedMessage>;

  constructor() {
    this.messages = <Subject<ReceivedMessage>>this.connect(WS_URL).pipe(
      map((response: MessageEvent): ReceivedMessage => {
        console.log(JSON.parse(response.data));
        let data = JSON.parse(response.data);
        return data;
      })
    );
  }

  public connect(url): AnonymousSubject<MessageEvent> {
    if (!this.subject) {
      this.subject = this.create(url);
      console.log('Successfully connected: ' + url);
    }
    return this.subject;
  }

  private create(url): AnonymousSubject<MessageEvent> {
    let ws = new WebSocket(url);
    let observable = new Observable((obs: Observer<MessageEvent>) => {
      ws.onmessage = obs.next.bind(obs);
      ws.onerror = obs.error.bind(obs);
      ws.onclose = obs.complete.bind(obs);
      return ws.close.bind(ws);
    });
    let observer = {
      error: null,
      complete: null,
      next: (data: Object) => {
        console.log('Message sent to websocket: ', data);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(data));
        }
      },
    };
    return new AnonymousSubject<MessageEvent>(observer, observable);
  }
}
