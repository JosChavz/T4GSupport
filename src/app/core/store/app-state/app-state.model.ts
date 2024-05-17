import { Timestamp } from '@angular/fire/firestore';

export interface AppState {
  __id: string;
  _totalWaiting: number; // total number of people on the waitlist
  _createdAt?: Timestamp;
  _updatedAt?: Timestamp;
}
