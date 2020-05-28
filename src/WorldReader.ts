"use strict";

import { AbstractReader } from "./AbstractReader";
import * as worldCountriesGeoJSONFile from '../dist/src/world-countries.json';

export class WorldFileReader extends AbstractReader {
  public static readonly CONFIRMED_FILE_SCOPE = 'time_series_covid19_confirmed_global.csv';
  public static readonly DEATHS_FILE_SCOPE = 'time_series_covid19_deaths_global.csv';
  public static readonly RECOVERED_FILE_SCOPE = 'time_series_covid19_recovered_global.csv';

  public constructor() {
    super();
  }

  public init() : void {
    var confirmed : any = this.readCsv(AbstractReader.BASE_URL + WorldFileReader.CONFIRMED_FILE_SCOPE);
    var deaths : any = this.readCsv(AbstractReader.BASE_URL + WorldFileReader.DEATHS_FILE_SCOPE);
    var recovered : any = this.readCsv(AbstractReader.BASE_URL + WorldFileReader.RECOVERED_FILE_SCOPE);
    
    confirmed = this.replaceText(confirmed, 'Greenland,Denmark', 'Greenland,Greenland');
    deaths = this.replaceText(deaths, 'Greenland,Denmark', 'Greenland,Greenland');
    recovered = this.replaceText(recovered, 'Greenland,Denmark', 'Greenland,Greenland');

    confirmed = this.csvToObject(confirmed);
    deaths = this.csvToObject(deaths);
    recovered = this.csvToObject(recovered);
    
    confirmed = this.replaceColumnValues(confirmed);
    deaths = this.replaceColumnValues(deaths);
    recovered = this.replaceColumnValues(recovered);

    confirmed = this.subtractRecoveredFromConfirmed(confirmed, recovered);
    
    super.setConfirmedGeoJson(this.setPropertyValues(confirmed, this.loadGeoJsonFile()));
    super.setDeathsGeoJson(this.setPropertyValues(deaths, this.loadGeoJsonFile()));
    super.setRecoveredGeoJson(this.setPropertyValues(recovered, this.loadGeoJsonFile()));
  }

  public loadGeoJsonFile() : object {
    return JSON.parse(JSON.stringify(worldCountriesGeoJSONFile.default));
  }

  public replaceColumnValues(csv : any) : object {
    const dict = {
      "Burma": "Myanmar",
      "Czechia": "Czech Republic",
      "Korea, South": "South Korea",
      "Congo (Kinshasa)": "Democratic Republic of the Congo",
      "Congo (Brazzaville)": "Republic of the Congo",
      "Taiwan*": 'Taiwan',
      "occupied Palestinian territory": "Palestine",
      "Bahamas, The": "Bahamas",
      "Gambia, The": "Gambia",
    }
    return super.replaceColumnValues(csv, dict, 'Country/Region');
  }

  //appends csv data to geojson
  public setPropertyValues(csv : any, geoJson : object) : object {
    return super.setPropertyValues(csv, geoJson, 'Country/Region', 'name');
  }
}