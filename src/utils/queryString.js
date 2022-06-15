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

import qs from "query-string";

const setQueryStringWithoutPageReload = (qsValue) => {
  const newurl =
    window.location.protocol +
    "//" +
    window.location.host +
    window.location.pathname +
    qsValue;
  window.history.pushState({ path: newurl }, "", newurl);
};

export const getQueryStringValues = (queryString = window.location.search) => {
  return qs.parse(queryString);
};

export const getQueryStringValue = (
  key,
  queryString = window.location.search
) => {
  const values = getQueryStringValues(queryString);
  return values[key];
};

export const setQueryStringValues = (
  obj,
  queryString = window.location.search
) => {
  const values = getQueryStringValues(queryString);
  const newQsValue = qs.stringify({
    ...values,
    ...obj,
  });
  setQueryStringWithoutPageReload(`?${newQsValue}`);
};

export const setQueryStringValue = (
  key,
  value,
  queryString = window.location.search
) => {
  const obj = { [key]: value };
  setQueryStringValues(obj, queryString);
};
