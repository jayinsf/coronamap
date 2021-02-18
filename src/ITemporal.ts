"use strict";

export interface ITemporal {
 
  // Return a layer, or empty layer L.layerGroup().addTo(Map.getInstance().getMap());
  update(geoJson: object): any;
}
