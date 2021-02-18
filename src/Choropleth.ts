"use strict";

import { Map } from "./Map";
import { ITemporal } from "./ITemporal";

export enum ChoroplethMode {
  Quantile = "q",
  Equidistant = "e",
  Kmeans = "k"
}

export class Choropleth implements ITemporal {
  public static readonly DEFAULT_SCALE: string[] = ['#fff', '#ffefac', '#fbc750', '#f6b340', '#f09e33', '#e98828', '#e1731e', '#d95b17', '#d14211', '#c81e0d'];
  public static readonly DEFAULT_BORDER_COLOR: string = '#666';
  public static readonly DEFAULT_FILL_OPACITY: number = 0.6;
  public static readonly HIGHLIGHT_FILL_OPACITY: number = 0.65;
  public static readonly DEFAULT_MODE: ChoroplethMode = ChoroplethMode.Quantile;
  public static readonly DEFAULT_WEIGHT: number = 1;
  public static readonly HIGHLIGHT_WEIGHT: number = 1.75;
  public static readonly LEGEND_CONTROL_POSITION: string = 'bottomleft';
  public static readonly LEGEND_ELEMENT_CLASS: string = 'choropleth-legend';
  public static readonly LEGEND_COLOR_WIDTHS: number[] = [1, 1, 1.5, 1.5, 1.5, 2, 2.5, 3, 5];
  private scale: string[];
  private borderColor: string;
  private fillOpacity: number;
  private mode: ChoroplethMode;

  public constructor(scale?: string[], borderColor?: string, fillOpacity?: number, mode?: ChoroplethMode) {
    this.scale = !scale || scale.length < 1 ? Choropleth.DEFAULT_SCALE : scale;
    this.borderColor = !borderColor ? Choropleth.DEFAULT_BORDER_COLOR : borderColor;
    this.fillOpacity = !fillOpacity ? Choropleth.DEFAULT_FILL_OPACITY : fillOpacity;
    this.mode = !mode ? Choropleth.DEFAULT_MODE : mode;
  }

  public update(geoJson: object): any {
    var choroplethLayer = L.choropleth(geoJson, {
      // Set properties to use
      valueProperty: Map.getInstance().getTimeDimension().getCurrentTime(),
      scale: this.scale,
      mode: this.mode,
      step: this.scale.length,
      style: {
        color: this.borderColor,
        weight: 1,
        fillOpacity: this.fillOpacity
      },
      onEachFeature: onEachFeature
    });

    this.createLegend(choroplethLayer);

    return choroplethLayer;
  }

  public createLegend(choroplethLayer: any): void {
    // Adapted from Tim Wisniewski's example: https://github.com/timwis/leaflet-choropleth/blob/gh-pages/examples/legend/demo.js retrieved in March 2020.
    var legend = L.control({ position: Choropleth.LEGEND_CONTROL_POSITION });
    legend.onAdd = function() {
      var div: Element;
      if ($('div.' + Choropleth.LEGEND_ELEMENT_CLASS).length > 0) {
        div = document.querySelectorAll('div.' + Choropleth.LEGEND_ELEMENT_CLASS)[0];
      } else {
        div = L.DomUtil.create('div', Choropleth.LEGEND_ELEMENT_CLASS);
      }

      var limits = Choropleth.pushAverageOfEveryElement(choroplethLayer.options.limits);
      limits[0] = 0;
      choroplethLayer.options.limits = limits;

      var colors = Choropleth.DEFAULT_SCALE;
      colors = colors.slice(1, colors.length);
      choroplethLayer.options.colors = colors;
      
      var labels = [];

      // Add min and max labels
      div.innerHTML = '<div class="min"><span>Cases:</span> ' + limits[0] + '</div><div class="max">' + limits[limits.length - 1] + '</div></div>';
      // Style
      limits.forEach(function (limit, index) {
        labels.push('<li style="background-color:' + colors[index]
          + ';width:' + Choropleth.LEGEND_COLOR_WIDTHS[index] + 'vw;"></li>');
      });
      div.innerHTML += '<ul>' + labels.join('') + '</ul>';
      
      return div;
    }
    legend.addTo(Map.getInstance().getMap());
  }

  public setScale(scale: string[]): void {
    this.scale = scale;
  }

  public getScale(): string[] {
    return this.scale;
  }
  
  public setBorderColor(borderColor: string): void {
    this.borderColor = borderColor;
  }

  public getBorderColor(): string {
    return this.borderColor;
  }
  
  public setFillOpacity(fillOpacity: number): void {
    this.fillOpacity = fillOpacity;
  }

  public getFillOpacity(): number {
    return this.fillOpacity;
  }
  
  public setMode(mode: ChoroplethMode): void {
    this.mode = mode;
  }

  public getMode(): ChoroplethMode {
    return this.mode;
  }

  private static pushAverageOfEveryElement(array: number[]): number[] {
    var newArray = [];
    for (let element in array) {
        var index = parseInt(element);
        newArray.push(array[index]);
        newArray.push((array[index] + array[index + 1]) / 2);
    }
    newArray.pop();
    return newArray;
  }
}

// Adapted from Leaflet's example: https://leafletjs.com/examples/choropleth retrieved in March 2020.
export function onEachFeature(_, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature
  });
}

function resetHighlight(e) {
  // Iterate each map layer and run resetStyle() function
  $.each(Map.getInstance().getTimeDimension().getLayers(), function(index, value) {
    try {
      var layer = e.target;
      layer.setStyle({
        weight: Choropleth.DEFAULT_WEIGHT,
        color: Choropleth.DEFAULT_BORDER_COLOR,
        fillOpacity: Choropleth.DEFAULT_FILL_OPACITY,
      });
      if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
      }
    } catch(e) { }
  });
}

function zoomToFeature(e) {
  Map.getInstance().getMap().fitBounds(e.target.getBounds());
}

function highlightFeature(e) {
  var layer = e.target;
  layer.setStyle({
    weight: Choropleth.HIGHLIGHT_WEIGHT,
    fillOpacity: Choropleth.HIGHLIGHT_FILL_OPACITY,
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }
}
