"use strict";

import { Map } from "./Map";
import { ITemporal } from "./ITemporal";

export class TimeDimension {
  public static readonly DATE_FORMAT : string = 'M/D/YY';
  public static readonly WAIT_ON_LOAD_TIMER : number = 2;
  private map : Map;
  private temporal : Array<ITemporal>;
  private layerGroup : any;
  private layers : {[key : number] : any};
  private hasTimeChanged : boolean;
  private currentTime : string;

  public constructor(temporal : ITemporal[]) {
    this.map = Map.getInstance();
    this.temporal = temporal;
    this.layerGroup = L.layerGroup().addTo(this.map.getMap());
    this.layers = {};
    this.hasTimeChanged = false;
  }

  public update(geoJson : object = null) {
    setInterval(() => {
      this.hasTimeChanged = this.currentTime !== this.getCurrentTime();
      this.currentTime = this.getCurrentTime();
      if (!this.hasTimeChanged) {
        return;
      }
      this.clearLayerGroup();
      
      for (let singleTemporal of this.temporal) {
        let layer = singleTemporal.update(geoJson).addTo(this.layerGroup);
        let layerId = L.stamp(layer) < Number.MAX_VALUE ? L.stamp(layer) : 0;
        this.layers[layerId] = layer;
      }
    }, 0);
  }

  public getLayers() : {[key : number] : any} {
    return this.layers;
  }

  public clearLayerGroup() : void {
    if(this.layers) {
      for (let i in this.layerGroup._layers) {
        if (this.layerGroup.hasLayer(i)) {
          this.layerGroup.removeLayer(i);
        }
      }
      this.layers = {};
    }
  }

  public getCurrentTime() : string {
    var currentTimeInMillisecond = this.map.getMap().timeDimension.getCurrentTime();
    var currentTime = this.millisecondToDate(currentTimeInMillisecond);
    return moment(currentTime).format(TimeDimension.DATE_FORMAT);
  }

  private millisecondToDate(millisecond : number) : string {
    return new Date(millisecond).toJSON().slice(0, 10);
  }
}