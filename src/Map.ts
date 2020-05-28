"use strict";

import { TimeDimension } from "./TimeDimension";

export class Map {
  public static readonly BUTTON_CONTROL_POSITION : string = 'bottomright';
  public static readonly TIMEDIMENSION_POSITION : string = 'topright';
  public static readonly SCALE_CONTROL_POSITION : string = 'bottomright';
  public static readonly LINK_VIEW_SOURCE : string = 'https://github.com/jayinsf/coronamap';
  private static instance : Map = null;
  private map : any;
  private timeDimension : any;

  private constructor() { }

  public static getInstance() : Map {
    if (this.instance === null) {
      this.instance = new Map();
    }

    return this.instance;
  }

  public init() : void {
    this.map = L.map('map', {
      zoomControl: true,
      zoomDelta: 0.5,
      zoomSnap: 0,
      minZoom: 1.5,
      maxZoom: 6,
      worldCopyJump: true,
      timeDimension: true,
      timeDimensionOptions: {
        timeInterval: '2020-01-22/' + new Date(Date.now() - 864e5).toJSON().slice(0, 10),
        period: 'P1D',
        buffer: 1,
      },
    }).setView([30, 0], 2.0);
    
    //adds scale to map
    L.control.scale({position: Map.SCALE_CONTROL_POSITION, metric: false}).addTo(this.map);

    this.createTimeDimensionControl();

    //loads map tiles
    var osmLayer = L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: 'Disease data &copy; <a href="https://systems.jhu.edu/">Johns Hopkins CSSE</a> Map &copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors, <a href="https://leafletjs.com">Leaflet</a>',
      tileSize: 512,
      zoomOffset: -1
    }).addTo(this.map);
    this.map.attributionControl.setPrefix('<a href="' + Map.LINK_VIEW_SOURCE + '">View Source</a>');
    this.createFullscreenControl(Map.BUTTON_CONTROL_POSITION);
  }

  //attaches fullscreen control to zoom buttons
  private createFullscreenControl(controlPosition : string) : void {
    //moves zoom buttons
    this.map.zoomControl.setPosition(controlPosition);
    //attaches fullscreen control to zoom buttons
    L.control.fullscreen({
      position: controlPosition,
      forceSeparateButton: false
    }).addTo(this.map);
  }

  //attaches timedimension control to the map
  private createTimeDimensionControl() : void {
    L.Control.TimeDimensionCustom = L.Control.TimeDimension.extend({
      //@override
      _getDisplayDateFormat: function(date : any) {
        return moment(date).add(1, 'days').format('dddd, LL');
      }
    });
    var timeDimensionControl = new L.Control.TimeDimensionCustom({
      position: Map.TIMEDIMENSION_POSITION,
      minSpeed: 0.25,
      maxSpeed: 2,
      speedStep: 0.25,
      timeSliderDragUpdate: true,
      autoPlay: false,
      loopButton: true,
      playReverseButton: true,
      timeZones: ['Local'],
      playerOptions: {
        loop: true,
        startOver: true,
      }
    });
    this.map.addControl(timeDimensionControl);
  }

  public getMap() : any {
    return this.map;
  }

  public attachTimeDimension(td : TimeDimension) : void {
    this.timeDimension = td;
  }

  public dettachTimeDimension() : void {
    this.timeDimension = null;
  }

  public getTimeDimension() : TimeDimension {
    return this.timeDimension;
  }
}