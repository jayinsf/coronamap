"use strict";

import { Map } from "./Map";
import { Database } from "./Database";
import { AbstractReader } from "./AbstractReader";
import { WorldFileReader } from "./WorldReader";
import { StatesFileReader } from "./StatesReader";
import { TimeDimension } from "./TimeDimension";
import { ITemporal } from "./ITemporal";
import { Choropleth } from "./Choropleth";
import { CircleMarker } from "./CircleMarker";
import { View } from "./View";
moment.suppressDeprecationWarnings = true;

//measures the time it takes to fully load page
const t0 = performance.now();

var map = Map.getInstance();
map.init();
var worldFr : AbstractReader = new WorldFileReader();
var usFr : AbstractReader = new StatesFileReader();
var db = new Database();
db.isExpired().then(function(value) {
  if (value) {
    worldFr.init();
    usFr.init();
    db.clear();
    db.setExpiryTime();
    db.setItem(Database.KEY_CONFIRMED_GEOJSON, AbstractReader.mergeGeoJsons(worldFr.getConfirmedGeoJson(), usFr.getConfirmedGeoJson()));
    db.setItem(Database.KEY_DEATHS_GEOJSON, AbstractReader.mergeGeoJsons(worldFr.getDeathsGeoJson(), usFr.getDeathsGeoJson()));
  }
}).then(() => {
  db.getItem(Database.KEY_CONFIRMED_GEOJSON).then(function(mergedConfirmedGeoJson) {
    var choropleth = new Choropleth();
    var timedimension = new TimeDimension(Array<ITemporal>(choropleth));
    map.attachTimeDimension(timedimension);
    timedimension.update(mergedConfirmedGeoJson);

    db.getItem(Database.KEY_DEATHS_GEOJSON).then(function(mergedDeathsGeoJson) {
      var circleMarker = new CircleMarker(worldFr, mergedConfirmedGeoJson.features);
      timedimension = new TimeDimension(Array<ITemporal>(circleMarker));
      map.attachTimeDimension(timedimension);
      timedimension.update(mergedDeathsGeoJson);

      var view = new View(mergedConfirmedGeoJson, mergedDeathsGeoJson);
      view.init();
      timedimension = new TimeDimension(Array<ITemporal>(view));
      map.attachTimeDimension(timedimension);
      timedimension.update();
      
      //removes spinner when the page is fully loaded
      document.getElementById('spinner').outerHTML = '';

      console.log(`Performance: ${performance.now() - t0} milliseconds.`);
    });
  });
});