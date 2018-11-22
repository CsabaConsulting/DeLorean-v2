import { Sponsor } from './sponsor';
import { AngularFireList, AngularFireDatabase, AngularFireObject, QueryFn } from '@angular/fire/database';
import { firebaseConfig } from './../../../environments/firebase.config';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { map } from 'rxjs/operators';
import * as firebase from 'firebase/app';
import 'firebase/storage';

@Injectable()
export class SponsorService {
  private basePath: string = firebaseConfig.devfestYear + '/sponsors';
  private sponsors: AngularFireList<Sponsor> = null;
  private sponsor: AngularFireObject<Sponsor> = null;
  private firebaseStorage: any;

  constructor(private db: AngularFireDatabase) {
    this.firebaseStorage = firebase.storage();
  }

  getSponsorList(queryFn?: QueryFn): Observable<Sponsor[]> {
    this.sponsors = this.db.list(this.basePath, queryFn);
    return this.sponsors.snapshotChanges().pipe(
        map(changes => {
          return changes.map(sponsor => {
            const data = sponsor.payload.val() as Sponsor;
            data.key = sponsor.payload.key;
            return data;
          });
        })
      );
  }

  getSponsor(key: string): AngularFireObject<Sponsor> {
    const path = `${this.basePath}/${key}`;
    this.sponsor = this.db.object(path);
    return this.sponsor;
  }

  createSponsor(sponsor: Sponsor, file?: File): void {
    const key = this.db.list(this.basePath).push(sponsor).key;
    if (file) {
      this.firebaseStorage.ref(this.basePath + `/${key}`).put(file)
        .then(snapshot => {
          sponsor.logoURL = snapshot.downloadURL;
          this.db.object(this.basePath + `/${key}`).set(sponsor);
        });
    }
  }

  updateSponsor(sponsor: Sponsor, file?: File): void {
    if (file !== undefined && file !== null) {
      this.firebaseStorage.ref(this.basePath + `/${sponsor.key}`).put(file)
        .then(snapshot => {
          sponsor.logoURL = snapshot.downloadURL;
          this.db.object(this.basePath + `/${sponsor.key}`).update(sponsor);
        });
    } else {
      this.db.object(this.basePath + `/${sponsor.key}`).update(sponsor);
    }
  }

  deleteSponsor(key: string): void {
    this.sponsors.remove(key)
      .then(onResolve => {
        this.firebaseStorage.ref(this.basePath + `/${key}`).delete();
      })
      .catch(error => this.handleError(error));
  }

  private handleError(error) {
    console.error(error);
  }

}
