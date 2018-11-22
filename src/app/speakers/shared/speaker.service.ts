import { Injectable } from '@angular/core';
import { Speaker } from './speaker';
import { firebaseConfig } from './../../../environments/firebase.config';
import { AngularFireDatabase, AngularFireList, AngularFireObject, QueryFn } from '@angular/fire/database';
import { Observable } from 'rxjs/Rx';
import { map } from 'rxjs/operators';
import * as firebase from 'firebase/app';
import 'firebase/storage';

@Injectable()
export class SpeakerService {
  private basePath: string = firebaseConfig.devfestYear + '/speakers';
  private speakers: AngularFireList<Speaker> = null;
  private speaker: AngularFireObject<Speaker> = null;
  private firebaseStorage: any;

  constructor(private db: AngularFireDatabase) {
    this.firebaseStorage = firebase.storage();
  }

  getSpeakerList(queryFn?: QueryFn): Observable<Speaker[]> {
    this.speakers = this.db.list(this.basePath, queryFn);
    return this.speakers.snapshotChanges().pipe(
      map(changes => {
        return changes.map(speaker => {
          const data = speaker.payload.val() as Speaker;
          data.key = speaker.payload.key;
          return data;
        });
      })
    );
  }

  getSpeakerCore(key: string): AngularFireObject<Speaker> {
    const path = `${this.basePath}/${key}`;
    this.speaker = this.db.object(path);
    return this.speaker;
  }

  getSpeaker$(key: string): Observable<Speaker> {
    return this.getSpeakerCore(key).valueChanges();
  }

  getSpeakerName(key: string): any {
    const path = `${this.basePath}/${key}/name`;
    let speakerName: string;
    this.db.object(path).snapshotChanges().subscribe(snapshot => {
      speakerName = snapshot.payload.val() as string;
    });
    return speakerName;
  }

  createSpeaker(speaker: Speaker, file?: File): void {
    const key = this.db.list(this.basePath).push(speaker).key;
    if (file !== undefined && file !== null) {
      this.firebaseStorage.ref(this.basePath + `/${key}`).put(file)
        .then(snapshot => {
          speaker.photoURL = snapshot.downloadURL;
          this.db.object(this.basePath + `/${key}`).set(speaker);
        });
    } else {
      this.db.object(this.basePath + `/${key}`).set(speaker);
    }
  }

  updateSpeaker(speaker: Speaker, file?: File): void {
    if (file !== undefined && file !== null) {
      this.firebaseStorage.ref(this.basePath + `/${speaker.key}`).put(file)
        .then(snapshot => {
          speaker.photoURL = snapshot.downloadURL;
          this.db.object(this.basePath + `/${speaker.key}`).update(speaker);
        });
    } else {
      this.db.object(this.basePath + `/${speaker.key}`).update(speaker);
    }
  }

  deleteSpeaker(key: string): void {
    this.speakers.remove(key)
      .then(onResolve => {
        this.firebaseStorage.ref(this.basePath + `/${key}`).delete();
      })
      .catch(error => this.handleError(error));
  }

  private handleError(error) {
    console.error(error);
  }

}
