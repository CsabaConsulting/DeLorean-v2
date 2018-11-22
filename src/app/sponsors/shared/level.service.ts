import { Level } from './level';
import { AngularFireList, AngularFireDatabase, QueryFn } from '@angular/fire/database';
import { firebaseConfig } from './../../../environments/firebase.config';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { map } from 'rxjs/operators';

@Injectable()
export class LevelService {
  private basePath: string = firebaseConfig.devfestYear + '/levels';
  levels: AngularFireList<Level> = null;

  constructor(private db: AngularFireDatabase) { }

  getLevelList(queryFn?: QueryFn): Observable<Level[]> {
    this.levels = this.db.list(this.basePath, queryFn);
    return this.levels.snapshotChanges().pipe(
      map(changes => {
        return changes.map(level => {
          const data = level.payload.val() as Level;
          data.key = level.payload.key;
          return data;
        });
      })
    );
  }

  createLevel(level: Level): void {
    this.db.list(this.basePath).push(level);
  }

  deleteLevel(key: string): void {
    this.db.list(this.basePath).remove(key);
  }

}
