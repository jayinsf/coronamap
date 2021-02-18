"use strict";

import { Map } from "./Map";
import { ITemporal } from "./ITemporal";
import { AbstractReader } from "./AbstractReader";

export class CircleMarker implements ITemporal {
  public static readonly PANE_NAME: string = 'circle-marker-pane';
  public static readonly COLOR: string = '#a80808';
  public static readonly OPACITY: number = 0.27;
  public static readonly BORDER_WEIGHT: number = 0.4;
  public static readonly RADIUS_NOISE: number = 0.0015;
  public static readonly RADIUS_MAX: number = 20;
  public static readonly RADIUS_MIN: number = 2.5;
  private circles: object[];
  private fileReader: AbstractReader;
  private confirmedFeatures: object;

  public constructor(fileReader: AbstractReader, confirmedFeatures: object) {
    this.fileReader = fileReader;
    this.confirmedFeatures = confirmedFeatures;
  }

  public update(geoJson: any) {
    Map.getInstance().getMap().createPane(CircleMarker.PANE_NAME);

    // Clear all circles
    this.circles = [];

    // Create circles
    var features: object[];
    // Extract a portion of states from end of geojson
    features = geoJson.features.slice(1).slice(-50);
    this.createCircleMarkers(features, false);
    
    // Extract all except states at the end of geojson
    features = geoJson.features.slice(0, -50);
    this.createCircleMarkers(features, true);
    
    return L.layerGroup(this.circles).addTo(Map.getInstance().getMap());
  }

  public getCircles(): any[] {
    return this.circles;
  }

  public createTooltip(marker: any, contentText: string, options?: {}): any {
    var tooltip = L.tooltip(options).setContent(contentText);
    // Attach tooltip to circle marker
    marker.bindTooltip(tooltip).openPopup();
    return tooltip;
  }

  private createCircleMarkers(features: any, recursive: boolean = false): void {
    if (!features || features.length === 0) {
      return;
    }

    if (!recursive) {
      for (let stateIdx = 0, len = Object.keys(features).length; stateIdx < len; stateIdx++) {
        var state = features[stateIdx].properties;
        var currentTime = Map.getInstance().getTimeDimension().getCurrentTime();
        var numOfDeathsAtCurrentTime = state[currentTime];
        if (numOfDeathsAtCurrentTime && numOfDeathsAtCurrentTime > 0) {
          try {
            // Create circle marker
            var circleMarker = L.circleMarker([state['Lat'], state['Long']], {
                radius: this.setRadius(numOfDeathsAtCurrentTime * CircleMarker.RADIUS_NOISE),
                color: CircleMarker.COLOR,
                fillOpacity: CircleMarker.OPACITY,
                weight: CircleMarker.BORDER_WEIGHT,
                pane: CircleMarker.PANE_NAME,
              }
            );
            // Get geographic name
            var countryName = state['Country/Region'] ? state['Country/Region'] : '';
            var stateName = state['Province/State'] ? state['Province/State'] : state['name'];
            if (!stateName) {
              stateName = '';
            } else if (countryName) {
              // Add a comma between country name and state name if a geographical area has both
              stateName += ', ';
            }
            // Show number of confirmed cases
            var numOfConfirmedCases = this.fileReader.getNumberOfCase(this.confirmedFeatures, currentTime, [state['Lat'], state['Long']]);

            this.createTooltip(circleMarker,
              '<b>' + stateName + countryName + '</b><br/>' +
              'Confirmed: ' + numOfConfirmedCases + '<br/>' +
              'Deaths: ' + numOfDeathsAtCurrentTime
            , {
              opacity: 1
            });
            this.circles.push(circleMarker);
          } catch (e) { }
        }
      }
    } else {
      var countryFeatures = [];
      for (let countryIdx = 0, len = Object.keys(features).length; countryIdx < len; countryIdx++) {
        for (let stateIdx = 0, len = Object.keys(features[countryIdx].properties).length; stateIdx < len; stateIdx++) {
          var state = features[countryIdx].properties[stateIdx];
          if (state && typeof state === 'object') {
            var feature: any = {};
            feature.properties = state;
            countryFeatures.push(feature);
          }
        }
      }

      this.createCircleMarkers(countryFeatures, false);
    }
  }

  private setRadius(radius: number): number {
    if (radius > CircleMarker.RADIUS_MAX) {
      return CircleMarker.RADIUS_MAX;
    } else if (radius < CircleMarker.RADIUS_MIN) {
      return CircleMarker.RADIUS_MIN;
    }
    return radius;
  }
}
