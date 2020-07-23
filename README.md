# Coronamap
Coronamap is an interactive thematic map with a time slider that enables users to play the animation to track the spread of coronavirus.<br/>
Have a look at the [Live demo](https://coronamap.page "Coronamap Demo").

<p align="center"><img src="https://github.com/jayinsf/coronamap/blob/master/dist/src/desktop_showcase.png" width=63%>&nbsp;&nbsp;&nbsp;<img src="https://github.com/jayinsf/coronamap/blob/master/dist/src/mobile_showcase.png" width=25%/></p>

## Preview
Disease data © <a href="https://github.com/CSSEGISandData/COVID-19/blob/master/README.md">Johns Hopkins CSSE</a>

Coronamap automatically collects daily disease data and adds today's date to the time slider. You can download daily disease data as CSV, Excel and PDF.
<p align="center"><a href="https://coronamap.page"><img src="https://github.com/jayinsf/coronamap/blob/master/dist/src/animation.gif" width=600></a></p>


## Getting Started

### Prerequisites

* Node.js
```
$ sudo apt install nodejs
$ sudo apt install npm
```

* Install npm packages
```
npm install
```

### Development
* Watch for updates to code and compile automatically: `npm run develop`
* Build the optimized production: `npm run build`
* Run all unit tests: `npm run test`
