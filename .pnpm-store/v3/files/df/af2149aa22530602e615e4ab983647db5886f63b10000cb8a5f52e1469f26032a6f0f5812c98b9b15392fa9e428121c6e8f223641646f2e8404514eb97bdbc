import { Injectable } from '@angular/core';
import { LoggingAngularFirestore } from '../setup/firebase-setup';
import { isDevMode } from '@angular/core';
import { environment } from '../../../environments/environment';

interface LogData {
  __userId?: string;
  __sessionId?: string;
  __deviceId?: string;
  route: string;
  startTime: number;
  time: Array<{
    total: number;
    type: string;
  }>;
  interactions?: Array<{ 0: number; 1: string; 2: string; 3: string; }>;
}

@Injectable({
  providedIn: 'root',
})
export class LogService {
  /** Whether should log to the console in dev. */
  LOG_IN_DEV = true;

  constructor(
    private log: LoggingAngularFirestore,
  ) {
  }

  rawLog(data: LogData, logType: string = 'logs', logId?: string) {
    // If no logId supplied, then create one
    if (!logId) {
      logId = this.log.createId();
    }

    if (!isDevMode()) {
      // Note that we are intentionally overriding logs with same id.
      // This allows for making sure the same log doesn't get stored twice,
      // e.g. for storing things in localStorage and saving next time we load
      // the browser
      this.log.doc(`/${logType}/${logId}`).set(data);
    } else if (this.LOG_IN_DEV) {
      console.log('LOGGING', logId, data);
    }
  }

  rawLogOnBeaconEvent(data: LogData, logType: string = 'logs', logId?: string) {
    // If no logId supplied, then create one
    if (!logId) {
      logId = this.log.createId();
    }

    if (data !== null) {
      if (!isDevMode()) {
        navigator.sendBeacon(
          `https://firestore.googleapis.com/v1/projects/${environment.firebaseLogs.projectId}/databases/(default)/documents:commit`,
          this.reformatLogForBeacon(data, logType, logId),
        );
      } else if (this.LOG_IN_DEV) {
        console.log('BEACON LOGGING', logId, data);
      }
    }
  }

  reformatLogForBeacon(data: LogData, logType, logId) {
    // Converts JSON objects to Firestore's REST API Document format
    // from: https://stackoverflow.com/questions/62246410/how-to-convert-a-firestore-document-to-plain-json-and-vice-versa/62304377#62304377
    const jsonToDocument = (value) => {
      if (!value) {
        return { 'nullValue': null };
      } else if (!isNaN(value) && !(value && value.constructor === Array)) { // edit, checking if not an array since empty arrays pass the isNan test
        if (value.toString().indexOf('.') != -1) {
          return { 'doubleValue': value };
        } else {
          return { 'integerValue': value };
        }
      } else if (value === 'true' || value === 'false' || typeof value === 'boolean') {
        return { 'booleanValue': value };
      } else if (typeof value === 'string') { // edit: removed check for Date that was before String check (see below)
        return { 'stringValue': value };
      } else if (value && value.constructor === Array) {
        return { 'arrayValue': { values: value.map((v) => jsonToDocument(v)) } };
      } else if (typeof value === 'object') {
        const obj = {};
        for (const o in value) {
          if (Object.prototype.hasOwnProperty.call(value, o)) {
            obj[o] = jsonToDocument(value[o]);
          }
        }
        return { 'mapValue': { fields: obj } };
      }
    };

    if (data !== null) {
      const wrappedData = {
        writes: [
          {
            update: {
              name: `projects/${environment.firebaseLogs.projectId}/databases/(default)/documents/${logType}/${logId}`,
              fields: {
                ...jsonToDocument(data).mapValue.fields,
              },
            },
          },
        ],
      };

      // console.log('WRAPPED_DATA', wrappedData);

      const preparedData = new Blob([JSON.stringify(wrappedData, null, 2)], {
        type: 'application/json',
      });

      return preparedData;
    } else {
      return null;
    }
  }
}
