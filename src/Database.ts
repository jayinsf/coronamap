"use strict";

export class Database {
  public static readonly DB_NAME: string = 'CoronamapStorage';
  public static readonly KEY_EXPIRY_TIME: string = 'Expiry Time';
  public static readonly KEY_CONFIRMED_GEOJSON: string = 'Confirmed Json';
  public static readonly KEY_DEATHS_GEOJSON: string = 'Deaths Json';
  // Stored data expires next day 3am UTC when the automated update is available by public data
  public static readonly DEFAULT_EXPIRY_TIME: number = new Date().setUTCHours(24 + 3, 0, 0, 0);
  // Use temporary storage if false
  private static hasLocalStorage: boolean = true;
  // Temporary storage expires after page refresh
  private static temporaryStorage: Object = {};

  public constructor() {
    localforage.config({
      driver: localforage.INDEXEDDB,
      name: Database.DB_NAME
    });
  }

  public setItem(key: string, value: any): void {
    if (Database.hasLocalStorage) {
      localforage.setItem(key, value);
    } else {
      Database.temporaryStorage[key] = value;
    }
  }

  public async getItem(key: string): Promise<any> {
    if (Database.hasLocalStorage) {
      return localforage.getItem(key).then((value) => {
        if (value) {
          return value;
        }
      }).catch((err) => {
        Database.hasLocalStorage = false;
      });
    } else {
      return Database.temporaryStorage[key];
    }
  }
  
  public clear(): void {
    if (Database.hasLocalStorage) {
      localforage.clear();
    } else {
      Database.temporaryStorage = new Object();
    }
  }

  public supports(): boolean {
    return localforage.supports(localforage.INDEXEDDB);
  }

  public async isExpired(): Promise<any> {
    var extime;
    if (Database.hasLocalStorage) {
      extime = await this.getItem(Database.KEY_EXPIRY_TIME);
    }
    if (extime) {
      return new Date().getTime() > extime;
    }
    // Expire if database does not contain expiry time
    return true;
  }

  public setExpiryTime(extime?: any): void {
    if (Database.hasLocalStorage) {
      this.isExpired().then(function(value) {
        if (value) {
          localforage.setItem(Database.KEY_EXPIRY_TIME, !extime ? Database.DEFAULT_EXPIRY_TIME : extime);
        }
      });
    }
  }

  public getStorage(): object {
    if (Database.hasLocalStorage) {
      return localforage._dbInfo;
    } else {
      return Database.temporaryStorage;
    }
  }
}
