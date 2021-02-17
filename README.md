# Coronamap
Coronamap is an interactive thematic map with a date slider that enables users to play the animation to track the spread of coronavirus.<br/>
Have a look at the [Live demo](https://7ae.github.io/coronamap/dist/ "Coronamap Demo").

Coronamap is fully functional on the client-side and does not use any server. It scrapes publicly available data and stores them locally within the user's browser.

<p align="center"><a href="https://7ae.github.io/coronamap/dist/"><img src=".screenshot/desktop.png" alt="coronamap on computer" width=70%></a> <a href="https://7ae.github.io/coronamap/dist/"><img src=".screenshot/mobile.png" alt="coronamap on mobile" width=28%/></a></p>

## Preview

<p align="center"><a href="https://7ae.github.io/coronamap/dist/"><img src=".screenshot/animation.gif" alt="animated coronamap" style="border-radius:4px;" width=100%></a></p>
Disease data © <a href="https://github.com/CSSEGISandData/COVID-19/blob/master/README.md">Johns Hopkins CSSE</a>

### Date Slider

The range of date slider automatically expands to include today's date.

<img src=".screenshot/timecontrol.png" alt="time slider" style="border-radius:2px;"><br>

- <img src=".screenshot/timecontrol-backward.png" alt="" style="border-radius:2px;" width=26> : Backward button shows the previous day.
- <img src=".screenshot/timecontrol-reverse.png" alt="" style="border-radius:2px;" width=26> : Play Reverse button animates map backwards.
- <img src=".screenshot/timecontrol-play.png" alt="" style="border-radius:2px;" width=26> : Play button animates map forwards.
- <img src=".screenshot/timecontrol-forward.png" alt="" style="border-radius:2px;" width=26> : Forward button shows the next day.
- <img src=".screenshot/timecontrol-loop.png" alt="" style="border-radius:2px;" width=26> : Loop button loops animation from the start to end, or vice versa.
- <img src=".screenshot/timecontrol-dateslider.png" alt="" style="border-radius:2px;" width=150> : Click a point in date slider to see a specific day.
- <img src=".screenshot/timecontrol-fps.png" alt=""  style="border-radius:2px;" width=100> : Frame rate slider can speed up or slow down animation. (Normal speed: 1 fps)

### Colored Geographical Areas

<img src=".screenshot/choropleth-legend.png" alt="" style="border-radius:2px;">

Countries, regions, sovereignties are colored according to **number of infected cases**. As one can see the legend at bottom left, brighter/yellow areas have relatively fewer infected cases, whereas darker/red areas have releatively more infected cases.

### Circle Markers

<img src=".screenshot/circlemarker.png" alt="" width=12> <img src=".screenshot/circlemarker.png" alt="" width=20> <img src=".screenshot/circlemarker.png" alt="" width=28> <img src=".screenshot/circlemarker.png" alt="" width=36> <img src=".screenshot/circlemarker.png" alt="" width=44>

Circles are sized according to **number of deaths**. Bigger circles mean more deaths, whereas smaller circles mean fewer deaths. Hover your mouse over a circle marker to see tooltip with the associated territory's name and number of infected cases and deaths.

### Downloading Map Data

You can save table with per-country daily confirmed case and death counts as multiple file formats.

- <img src=".screenshot/save-as-csv.png" alt="Save as csv button" style="border-radius:2px;" width=26> : Save table as csv file (.csv)
- <img src=".screenshot/save-as-excel.png" alt="Save as Excel button" style="border-radius:2px;" width=26> : Save table as excel spreadsheet (.xlsx)
- <img src=".screenshot/save-as-pdf.png" alt="Save as PDF button" style="border-radius:2px;" width=26> : Save table as pdf (.pdf)

## Getting Started

### Prerequisites

* Node.js
```bash
$ sudo yum install nodejs
$ sudo yum install npm
```

* Install npm packages
```bash
npm install
```

### Development
* Watch for updates to code and compile automatically: `npm run develop`
* Build the optimized production: `npm run build`
* Run all unit tests: `npm run test`
