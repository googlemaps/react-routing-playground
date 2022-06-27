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
 * index.js
 */
import ReactDOM from "react-dom";
import App from "./App";
import ReactModal from "react-modal";
import { seedAlgos } from "./dataModel/algoModel";

ReactModal.setAppElement("#root");

seedAlgos().then((algos) => {
  ReactDOM.render(<App algos={algos} />, document.getElementById("root"));
});
