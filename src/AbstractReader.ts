"use strict";

import { TimeDimension } from "./TimeDimension";
var geojsonMerge = require('@mapbox/geojson-merge');

export abstract class AbstractReader {
  public static readonly BASE_URL: string = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/";
  private confirmedGeoJson: object;
  private deathsGeoJson: object;
  private recoveredGeoJson: object;

  public constructor() { }

  public abstract init(): void;

  public abstract loadGeoJsonFile(): object;

  // Retrieve csv data from url
  public readCsv(scope: string): string {
    var response;
    $.ajax({
      url: scope,
      async: false,
      success: function (data) {
        response = data;
      },
      dataType: 'text'
    });
    return response;
  };

  public csvToObject(csv: string): object {
    return $.csv.toObjects(csv);
  }

  public replaceColumnKeys(csv: any, dict: object): string {
    var header = csv.split("\n")[0];
    for (let key of Object.keys(dict)) {
      header = header.replace(key, dict[key]);
    }
    return header + '\r\n' + csv.split("\n").slice(1).join("\n");
  }

  // Find different data between geojson and csv, and equalize different region names between geojson and csv data
  public replaceColumnValues(csv: any, dict: object, colName: string): object {
    var regex = new RegExp('^' + Object.keys(dict).map(_ => _.replace(/[+?^*${}()|[\]\\]/ig, '\\$&')).join('$|^') + '$', 'gi');
    
    $(csv).each(function(index, value) {
      value[colName] = value[colName].replace(regex, function(match) { return dict[match]; });
    });
    
    return csv;
  }

  // Return property values in csv, not in geojson, or empty object if there is no different values between geojson and csv
  public comparePropertyValues(csv: any, geoJson: object, colName: string, propertyKey: string): object {
    return $(csv.map(_ => _[colName])).not(geoJson).get().filter(function(v, i, _) { return _.indexOf(v) >= i; });
  }

  public setPropertyValues(csv: any, geoJson: any, colName: string, geoJsonKey: string): object {
    for (let value of geoJson.features) {
      var id = 0;
      for (let csvIdx in csv) {
        // If geojson properties name value matches to csv column value
        if (value.properties[geoJsonKey] == csv[csvIdx][colName]) {
          // Set properties in geojson with new values
          value.properties[id] = csv[csvIdx];
          id++;
        }
      }
    };
    this.pushTotalNumberOfCaseToProperties(geoJson);
    return geoJson;
  }

  public static getProperty(features: any, propertyNames: string[]): any[] {
    var values = [];
    for (let i in Object.values(features)) {
      if (features[i].properties['Country/Region']) {
        for (let pname of propertyNames) {
          if (!values[pname]) {
            values[pname] = [];
          }
          values[pname].push(features[i].properties[pname]);
        }
      }
    }
    return values;
  }

  public static mergeGeoJsons(geoJson: object, otherGeoJson: object): object {
    var mergedGeoJson = geojsonMerge.merge([
      geoJson,
      otherGeoJson
    ]);
    return mergedGeoJson;
  }

  public setConfirmedGeoJson(geoJson: object): void {
    this.confirmedGeoJson = geoJson;
  }

  public getConfirmedGeoJson(): object {
    return this.confirmedGeoJson;
  }

  public setDeathsGeoJson(geoJson: object): void {
    this.deathsGeoJson = geoJson;
  }

  public getDeathsGeoJson(): object {
    return this.deathsGeoJson;
  }

  public setRecoveredGeoJson(geoJson: object): void {
    this.recoveredGeoJson = geoJson;
  }

  public getRecoveredGeoJson(): object {
    return this.recoveredGeoJson;
  }

  public replaceText(text: string, from: string, to: string, repeat: boolean = false): string {
    return text.replace(repeat ? '\/' + from + '\/g' : from, to); 
  }

  public getNumberOfCase(features: any, time: string, latlong: [number, number]): number {
    for (let featIdx = 0, len = Object.keys(features).length; featIdx < len; featIdx++) {
      var prop = features[featIdx]['properties'];

      if (prop.Lat == latlong[0] && prop.Long == latlong[1]) {
        return prop[time];
      }
      
      for (let propIdx = 0, len = Object.keys(prop).length; propIdx < len; propIdx++) {
        if (prop[propIdx]) {
          if (prop[propIdx].Lat == latlong[0] && prop[propIdx].Long == latlong[1]) {
            return prop[propIdx][time];
          }
        }
      }
    }
    return;
  }

  public subtractRecoveredFromConfirmed(confirmedGeoJson: any, recoveredGeoJson: any): object {
    var clonedConfirmedGeoJson = confirmedGeoJson;
    // Iterate each country in confirmed geojson
    for (let confirmedCountry of Object.values(clonedConfirmedGeoJson)) {
      // Iterate each country in recovered geojson
      for (let recoveredCountry of Object.values(recoveredGeoJson)) {
        // For each key from each country
        for (let key of Object.keys(confirmedCountry)) {
          // Find the exact same country and state names in two geojsons
          if (confirmedCountry['Province/State'] === recoveredCountry['Province/State'] && confirmedCountry['Country/Region'] === recoveredCountry['Country/Region']) {
            // If key is date
            if (moment(key).isValid()) {
              // Subtract number of recovered cases from number of confirmed cases on the date
              confirmedCountry[key] -= recoveredCountry[key];
            }
          }
        }
      }
    }
    return clonedConfirmedGeoJson;
  }

  private pushTotalNumberOfCaseToProperties(geoJson: any): void {
    // Iterate geojson
    for (let featIdx = 0, len = Object.keys(geoJson.features).length; featIdx < len; featIdx++) {
      var totalCaseByDate = {};
      // Iterate properties
      for (let keyIdx = 0, len = Object.keys(geoJson.features[featIdx].properties).length; keyIdx < len; keyIdx++) {
        var key = Object.keys(geoJson.features[featIdx].properties)[keyIdx];
        // Cities and counties are object
        if(geoJson.features[featIdx].properties[key] && typeof geoJson.features[featIdx].properties[key] === 'object') {
          // Iterate keys in each object
          for (let objectKey of Object.keys(geoJson.features[featIdx].properties[key])) {
            // If key is date
            if (moment(objectKey).isValid()) {
              var date = moment(objectKey).format(TimeDimension.DATE_FORMAT);
              // Stack number of cases in this city or county
              if (!totalCaseByDate[date]) {
                totalCaseByDate[date] = parseInt(geoJson.features[featIdx].properties[key][objectKey]);
              } else if (totalCaseByDate[date] > 0) {
                totalCaseByDate[date] += parseInt(geoJson.features[featIdx].properties[key][objectKey]);
              }
            } else if (objectKey === 'Country/Region') {
              totalCaseByDate[objectKey] = geoJson.features[featIdx].properties[key][objectKey];
            }
          }
        }
      }
      // Add total number of cases in scope of properties
      for (let country in totalCaseByDate) {
        geoJson.features[featIdx].properties[country] = totalCaseByDate[country];
      }
    }
  }
}
