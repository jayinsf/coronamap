"use strict";

export interface ITemporal {
 
  //return a layer, or empty layer L.layerGroup().addTo(Map.getInstance().getMap());
  update(geoJson : object) : any;
}