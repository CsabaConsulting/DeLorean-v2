import { Section } from './section';
import { Injectable } from '@angular/core';
import { firebaseConfig } from './../../../environments/firebase.config';
import { AngularFireDatabase, AngularFireList, QueryFn } from '@angular/fire/database';

@Injectable()
export class SectionService {
  sections: AngularFireList<Section> = null;

  constructor(private db: AngularFireDatabase) { }

  getSectionList(queryFn?: QueryFn, year?: string|number): AngularFireList<Section> {
    this.sections = this.listPath(queryFn, year);
    return this.sections;
  }

  createSection(section: Section): void {
    const list = this.listPath();
    list.push(section);
  }

  deleteSection(key: string): void {
    const list = this.listPath();
    list.remove(key);
  }

  private listPath(queryFn?: QueryFn, year?: string|number): AngularFireList<Section> {
    if (!year) {
        year = firebaseConfig.devfestYear;
    }
    return this.db.list(`${year}/sections`, queryFn);
  }

}
