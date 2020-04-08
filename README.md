# usco-headless-renderer

[![GitHub version](https://badge.fury.io/gh/usco%2Fusco-headless-renderer.svg)](https://badge.fury.io/gh/usco%2Fusco-headless-renderer)
[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)
[![Build Status](https://travis-ci.org/usco/usco-headless-renderer.svg)](https://travis-ci.org/usco/usco-headless-renderer)
[![Dependency Status](https://david-dm.org/usco/usco-headless-renderer.svg)](https://david-dm.org/usco/usco-headless-renderer)
[![devDependency Status](https://david-dm.org/usco/usco-headless-renderer/dev-status.svg)](https://david-dm.org/usco/usco-headless-renderer#info=devDependencies)


> Headless webgl renderer thumbnail image renderer for 3d files : stl, obj, ctm

This is a command line thumbnail image renderer of 3d files, using webgl

## Table of Contents

- [usco-headless-renderer](#usco-headless-renderer)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [System dependencies](#system-dependencies)
  - [Usage](#usage)
  - [Contribute](#contribute)
  - [License](#license)


## Installation

as a command line tool (typical use case)

```
npm install -g --production usco/usco-headless-renderer
```

as a module

```
npm install usco/usco-headless-renderer
```

## System dependencies

You also need to install a few packages on your system (needed for headless webgl rendering): for Debian/Ubuntu these are :

- [x] sudo apt-get install pkg-config
- [x] sudo apt-get install xvfb
- [x] sudo apt-get install libx11-dev
- [x] sudo apt-get install libxi-dev
- [x] sudo apt-get install libgl1-mesa-dev

## Usage

```
  usco-headless-renderer input=<PATH-TO-FILE> output=<PATH-TO-OUTPUT.png> resolution=320x240 cameraPosition=[75,75,145] verbose=true
```

>IMPORTANT !!! do NOT use spaces when defining the resolution or cameraPosition parameters, or things
will break !


## Contribute

PRs accepted.

Small note: If editing the Readme, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.


## License

[The MIT License (MIT)](https://github.com/usco/usco-headless-renderer/blob/master/LICENSE)
(unless specified otherwise)
