import { Fragment, useState } from "react";
import "./App.css";
import { formatBytes } from "./utils/formatBytes";

export const App = () => {
  const [file, setFile] = useState();

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("filename", file);

    fetch("http://localhost:4000/upload_file", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .catch((err) => console.error(err));
  };

  return (
    <Fragment>
      <div className="flex flex-col w-full mx-auto my-auto">
        <h1 className="flex font-medium text-center">File upload</h1>
        <div className="flex w-auto h-auto min-h-fit mx-auto my-auto">
          <p className="flex font-normal text-center">
            {file && `${file.name} - ${file.type} - ${formatBytes(file.size)}`}
          </p>
        </div>
        <input
          onChange={(event) => handleFileChange(event)}
          className="flex w-auto cursor-pointer"
          type="file"
          name="file"
          placeholder="Click here to upload a file"
        />
        <button
          className="flex justify-center w-64 cursor-pointer"
          onClick={() => handleUploadClick()}>
          Upload
        </button>
      </div>
    </Fragment>
  );
};
