"use strict";

import { Map } from "./Map";
import { AbstractReader } from "./AbstractReader";

export class View {
  private table : any;
  private confirmedWorldFeatures : any;
  private deathsWorldFeatures : any;
  private confirmedUSFeatures : any;
  private deathsUSFeatures : any;

  constructor(confirmedGeoJson : any, deathsGeoJson : any) {
    document.getElementById('table').style.visibility = 'visible';

    this.confirmedWorldFeatures = confirmedGeoJson.features.slice(0, -50);
    this.deathsWorldFeatures = deathsGeoJson.features.slice(0, -50);

    this.confirmedUSFeatures = confirmedGeoJson.features.slice(1).slice(-50);
    this.deathsUSFeatures = deathsGeoJson.features.slice(1).slice(-50);
  }
  
  public init() : void {
    this.table = $('#datatables').DataTable({
      autoWidth: false,
      columnDefs: [{
        targets: -1,
        className: 'all'
      }],
      paging: false,
      
      "columns": [	
        { "data": "country" },
        { "data": "confirmed" },
        { "data": "death" },
      ],

      //adds icons
      dom: 'Bfrtip',
      buttons: [
        { extend: 'csvHtml5', text: '<i class="far fa-file-alt"></i>', titleAttr: 'CSV' },
        { extend: 'excelHtml5', text: '<i class="far fa-file-excel"></i>', titleAttr: 'Excel' },
        { extend: 'pdfHtml5', text: '<i class="far fa-file-pdf"></i>', titleAttr: 'PDF' },
      ]
    });
  }
  
  public update() : object {
    this.table.clear().draw();
    //extracts all except states at the end of geojson
    this.createRows(this.confirmedWorldFeatures, this.deathsWorldFeatures);
    this.createRows(this.confirmedUSFeatures, this.deathsUSFeatures, true);
    return L.layerGroup().addTo(Map.getInstance().getMap());
  }

  public createRows(confirmedFeatures : object, deathsFeatures : object, isStates : boolean = false) : any {
    var currentTime = Map.getInstance().getTimeDimension().getCurrentTime();
    var confirmed = AbstractReader.getProperty(confirmedFeatures, ['Country/Region', currentTime]);
    var deaths = AbstractReader.getProperty(deathsFeatures, [currentTime]);

    if (isStates) {
      this.createOneRow([
        {
        'country': confirmed['Country/Region'][0],
        'confirmed': this.sumArrayItems(confirmed[currentTime]),
        'death': this.sumArrayItems(deaths[currentTime])
        }
      ]);
      return;
    }

    var dataset : object[] = [];
    for (let i in confirmed['Country/Region']) {
      //fix DataTables warning: table id=datatables - Requested unknown parameter 'confirmed' for row 0, column 1. For more information about this error, please see http://datatables.net/tn/4
      try {
        dataset.push({
          'country': confirmed['Country/Region'][i],
          'confirmed': confirmed[currentTime][i],
          'death': deaths[currentTime][i]
        });
      } catch (e) {
        //throw exception if daily disease data are not uploaded yet on Johns Hopkins CSSE repository
        console.log(e);
      }
    }
    this.createOneRow(dataset);
  }

  private createOneRow(dataset : object[]) : void { 
    this.table.rows.add(dataset).draw();
  }

  private sumArrayItems(arr : number[]) : number {
    var sum = 0;
    for (let i in arr) {
      sum += arr[i];
    }
    return sum;
  }
}