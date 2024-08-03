import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { getPresignedUrls, putUserImages } from "../api";

const CHUNK_SIZE = 1000; // Number of files per chunk
const MAX_CONCURRENT_UPLOADS = 10; // Number of concurrent uploads

const ImageUpload = () => {
  const [files, setFiles] = useState([]);
  const [imgUrls, setImgUrls] = useState([]);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [numb , setNumb] = useState(0)

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files)); // Convert FileList to Array
  };

  const handleUpload = async () => {
    setUploading(true);
    const numberOfUrls = files.length;
    setNumb(numberOfUrls)

    try {
      const response = await getPresignedUrls(numberOfUrls);
      const urls = response.data.urls;

      if (!Array.isArray(urls) || urls.length !== numberOfUrls) {
        throw new Error("Received incorrect number of URLs");
      }

      let uploadedCount = 0;
      const updateProgress = (count) => {
        setProgress(Math.round((count / numberOfUrls) * 100));
      };

      await uploadFilesInChunks(files, urls, (count) => {
        uploadedCount += count;
        updateProgress(uploadedCount);
      });
      alert("Files uploaded successfully!");
    } catch (err) {
      console.error("Error uploading files:", err);
      alert("Error uploading files");
    } finally {
      setUploading(false);
    }
  };

  const uploadChunk = async (chunkFiles, chunkUrls, updateProgress) => {
    const uploadQueue = [];

    for (let i = 0; i < chunkFiles.length; i++) {
      const file = chunkFiles[i];
      const { url, fields } = chunkUrls[i];
      const formData = new FormData();

      formData.append("key", fields.key);
      formData.append("Content-Type", file.type);
      Object.entries(fields).forEach(([key, value]) => {
        if (key !== "key" && key !== "Content-Type") {
          formData.append(key, value);
        }
      });
      formData.append("file", file);

      const uploadPromise = axios
        .post(url, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then(() => {
          setImgUrls((prev) => [
            ...prev,
            `${import.meta.env.VITE_CLOUDFRONTURL}/${fields.key}`,
          ]);
          updateProgress(1);
        })
        .catch((e) => {
          console.error("Error uploading file:", e);
          alert("try again after some time")
        });

      if (uploadQueue.length >= MAX_CONCURRENT_UPLOADS) {
        await Promise.race(uploadQueue);
      }

      uploadQueue.push(uploadPromise);
      uploadPromise.finally(() => {
        uploadQueue.splice(uploadQueue.indexOf(uploadPromise), 1);
      });
    }

    await Promise.all(uploadQueue);
  };

  const uploadFilesInChunks = async (files, urls, updateProgress) => {
    if (!Array.isArray(files) || !Array.isArray(urls)) {
      throw new Error("Files or URLs are not arrays");
    }

    for (let i = 0; i < files.length; i += CHUNK_SIZE) {
      const chunkFiles = files.slice(i, i + CHUNK_SIZE);
      const chunkUrls = urls.slice(i, i + CHUNK_SIZE);

      await uploadChunk(chunkFiles, chunkUrls, updateProgress);
    }
  };
  useEffect(() => {
    if (imgUrls.length === numb && numb > 0) {
      const putImages = async () => {
        try {
          const res = await putUserImages(imgUrls);
          console.log(res);
        } catch (err) {
          console.error("Error uploading image URLs to server:", err);
        }
      };
      putImages();
    }
  }, [imgUrls, numb]);

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-100'>
      <div className='bg-white p-6 rounded-lg shadow-md w-full max-w-md'>
        <h2 className='text-2xl font-bold mb-4 text-center'>Upload Images</h2>
        <input
          type='file'
          multiple
          onChange={handleFileChange}
          className='block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:border-indigo-500'
        />
        <button
          onClick={handleUpload}
          disabled={uploading}
          className={`mt-4 w-full py-2 px-4 ${
            uploading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
          } text-white font-bold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
        {progress > 0 && (
          <p className='mt-2 text-center'>Progress: {progress}%</p>
        )}
      </div>
      <Link
        to={"/images"}
        className='mt-4 text-indigo-600 hover:text-indigo-800'
      >
        See The Images You Uploaded
      </Link>
    </div>
  );
};

export default ImageUpload;
