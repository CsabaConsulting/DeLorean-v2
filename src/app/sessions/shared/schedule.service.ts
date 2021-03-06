import { AngularFireList, AngularFireDatabase } from '@angular/fire/database';
import { firebaseConfig } from './../../../environments/firebase.config';
import { Injectable } from '@angular/core';

@Injectable()
export class ScheduleService {
  schedules: AngularFireList<any> = null;

  constructor(private db: AngularFireDatabase) { }

  getScheduleList(uid: string, year?: string|number) {
    if (!year) {
        year = firebaseConfig.devfestYear;
    }
    const path = `${year}/schedules/${uid}/`;
    return this.db.list(path).valueChanges();
  }

  getScheduleSession(uid, session, year?: string|number) {
    if (!year) {
        year = firebaseConfig.devfestYear;
    }
    const path = `${year}/schedules/${uid}/${session}/`;
    return this.db.object(path);
  }

}
