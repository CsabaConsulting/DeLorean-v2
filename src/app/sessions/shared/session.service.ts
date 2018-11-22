import { Survey } from './survey';
import { Session } from './session';
import { firebaseConfig } from './../../../environments/firebase.config';
import { AngularFireDatabase, AngularFireList, AngularFireObject, QueryFn } from '@angular/fire/database';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { map } from 'rxjs/operators';

@Injectable()
export class SessionService {
  private basePath: string = firebaseConfig.devfestYear + '/sessions';
  sessions: AngularFireList<Session> = null;
  session: AngularFireObject<Session> = null;

  constructor(private db: AngularFireDatabase) { }

  getSessionList(queryFn?: QueryFn): Observable<Session[]> {
    this.sessions = this.db.list(this.basePath, queryFn);
    return this.sessions.snapshotChanges().pipe(
      map(changes => {
        return changes.map(session => {
          const data = session.payload.val() as Session;
          data.key = session.payload.key;
          return data;
        });
      })
    );
  }

  getSession(key: string): Observable<Session> {
    const path = `${this.basePath}/${key}`;
    this.session = this.db.object(path);
    return this.session.valueChanges();
  }

  createSession(session: Session): void {
    this.sessions.push(session);
  }

  updateSession(key: string, value: any): void {
    this.sessions.update(key, value);
  }

  deleteSession(key: string): void {
    this.sessions.remove(key);
  }

  saveSurvey(key: string, survey: Survey): void {
    const path = `${this.basePath}/${key}/surveys`;
    const surveys = this.db.list(path);
    surveys.push(survey);
  }

}
