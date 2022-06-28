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
 * JsonEditor.js
 *
 * A modal that allows the user to edit json content.
 */

import { useState } from "react";
import JSONInput from "react-json-editor-ajrm/index";
import locale from "react-json-editor-ajrm/locale/en";
import ReactModal from "react-modal";

function JsonEditor({ isOpen, initialJson, onSubmit, onCancel }) {
  const [jsonContent, setJsonContent] = useState(initialJson);
  const [enableSubmit, setEnableSubmit] = useState(true);

  function handleKeyDown() {
    setEnableSubmit(false);
  }

  function onJsonChange(content) {
    if (!content.error) {
      setJsonContent(content.jsObject);
      setEnableSubmit(true);
    }
  }

  return (
    <ReactModal isOpen={isOpen} contentLabel="Editor dialog">
      <div onKeyDown={handleKeyDown}>
        <JSONInput
          locale={locale}
          placeholder={initialJson}
          waitAfterKeyPress={2000}
          theme={"light_mitsuketa_tribute"}
          colors={{ default: "#888888" }}
          style={{ body: { fontSize: "16px" } }}
          onChange={onJsonChange}
        />
      </div>
      <button onClick={onCancel}>Cancel</button>
      <button disabled={!enableSubmit} onClick={() => onSubmit(jsonContent)}>
        OK
      </button>
    </ReactModal>
  );
}

export { JsonEditor as default };
