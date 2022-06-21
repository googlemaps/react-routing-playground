/**
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 * Random.js
 *
 * Copied from https://github.com/bryc/code/blob/master/jshash/PRNGs.md#sfc32
 */

function sfc32(a, b, c, d) {
  return function () {
    a |= 0;
    b |= 0;
    c |= 0;
    d |= 0;
    let t = (((a + b) | 0) + d) | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}

function rand() {
  return sfc32(1395214498, 566822976, 953786, 64557225103);
}

function randRange(min, max) {
  const randFn = rand();
  return () => randFn() * (max - min) + min;
}

function randLatLng(bounds) {
  const sw = bounds.getSouthWest();
  const span = bounds.toSpan();
  const randFn = rand();
  return () => {
    const lat = sw.lat() + randFn() * span.lat();
    const lng = sw.lng() + randFn() * span.lng();
    return { lat, lng };
  };
}

function randLatLngInPolygon(pgon) {
  const bounds = pgon.getBounds();
  const randFn = randLatLng(bounds);
  return () => {
    let loc;
    do {
      loc = randFn();
    } while (!window.google.maps.geometry.poly.containsLocation(loc, pgon));
    return loc;
  };
}

export { rand, randRange, randLatLng, randLatLngInPolygon };
