"use strict";

import { AbstractReader } from "./AbstractReader";
import * as usStatesGeoJSONFile from '../dist/src/us-states.json';

export class StatesFileReader extends AbstractReader {
  public static readonly CONFIRMED_FILE_SCOPE = 'time_series_covid19_confirmed_US.csv';
  public static readonly DEATHS_FILE_SCOPE = 'time_series_covid19_deaths_US.csv';
  public static readonly CENTER_OF_LAT_KEY = "Lat";
  public static readonly CENTER_OF_LONG_KEY = "Long";

  public constructor() {
    super();
  }

  public init() : void {
    var centerOfLatLong = this.readCsv("https://raw.githubusercontent.com/jayinsf/coronamap/master/dist/src/states.csv");
    
    var confirmed : any = this.readCsv(AbstractReader.BASE_URL + StatesFileReader.CONFIRMED_FILE_SCOPE);
    var deaths : any = this.readCsv(AbstractReader.BASE_URL + StatesFileReader.DEATHS_FILE_SCOPE);
    
    confirmed = this.replaceColumnKeys(confirmed);
    deaths = this.replaceColumnKeys(deaths);

    confirmed = this.csvToObject(confirmed);
    deaths = this.csvToObject(deaths);
    
    confirmed = this.replaceColumnValues(confirmed);
    deaths = this.replaceColumnValues(deaths);
    
    super.setConfirmedGeoJson(this.setPropertyValues(confirmed, this.loadGeoJsonFile()));
    super.setDeathsGeoJson(this.setPropertyValues(deaths, this.loadGeoJsonFile()));

    this.setConfirmedGeoJson(this.addCenterOfCordinates(this.csvToObject(centerOfLatLong), this.getConfirmedGeoJson()));
    this.setDeathsGeoJson(this.addCenterOfCordinates(this.csvToObject(centerOfLatLong), this.getDeathsGeoJson()));
  }
  
  //loads geojson file and returns copy of geojson object
  public loadGeoJsonFile() : object {
    return JSON.parse(JSON.stringify(usStatesGeoJSONFile.default));
  }

  public replaceColumnKeys(csv : any) : string {
    const dict = {
      "Province_State": "Province/State",
      "Country_Region": "Country/Region",
      "Long_": "Long",
    }
    return super.replaceColumnKeys(csv, dict);
  }

  public replaceColumnValues(csv : any) : object {
    const dict = {}
    return super.replaceColumnValues(csv, dict, 'Province/State');
  }

  public setPropertyValues(csv : any, geoJson : object) : object {
    return super.setPropertyValues(csv, geoJson, 'Province/State', 'name');
  }

  public addCenterOfCordinates(csv : any, geoJson : any) : object {
    for (let feature of geoJson.features) {
      for (let csvRow of csv) {
        if (feature.id == csvRow.state) {
          feature.properties[StatesFileReader.CENTER_OF_LAT_KEY] = csvRow.latitude;
          feature.properties[StatesFileReader.CENTER_OF_LONG_KEY] = csvRow.longitude;
        }
      }
    }
    return geoJson;
  }
}