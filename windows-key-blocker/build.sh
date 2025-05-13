#!/bin/bash

rm -rf dist
npx tsc
mkdir -p dist/lib
node-gyp clean configure buildц