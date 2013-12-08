Harvest-ts
==========

Yet another platform for Harvest, now for web.

Running with Visual Studio
----------

Harvest-ts was created in Visual Studio 2013 and this version is recommended.

Simply open [Harvest-ts.sln](Harvest-ts.sln) in Visual Studio.


Running with CLI
----------

To run Harvest-ts you need [**node**](http://nodejs.org) and [**npm**](http://nodejs.org) installed. Once you got them:

* Install dependencies:

```
npm intall grunt-cli
npm install --dev
```

* Run the server:

```
grunt server
```

Harvest-ts is available at [localhost:9001](http://localhost:9001).

It's using **livereload** snippet so when any .ts, .js, .css or .html files inside the Harvest-ts directory are changed the change is visible immediately in the browser.


Compatibility
----------
The app has been tested and should work fine on:

* Chrome 31
* Chrome Canary 33
* Firefox 28.0a1
