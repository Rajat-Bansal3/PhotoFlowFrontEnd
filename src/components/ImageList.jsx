import React, { useEffect, useState } from "react";
import { fetchUserImages, deleteImage } from "../api";
import JSZip from "jszip";

const ImageList = () => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const loadImages = async () => {
      try {
        const response = await fetchUserImages().catch((e) => console.log(e));
        console.log(response.data);
        setImages(response.data.images);
      } catch (error) {
        alert("Error fetching images.");
      }
    };
    loadImages();
  }, []);

  const handleDelete = async (key) => {
    try {
      await deleteImage(key);
      setImages(images.filter((image) => image.url !== key));
    } catch (error) {
      alert("Error deleting image.");
    }
  };

  const handleDownloadALL = async () => {
    const zip = new JSZip();
    const folder = zip.folder("images");

    await Promise.all(
      images.map(async (image, index) => {
        var blob = new Blob([image.url], { type: "image/*" });
        console.log(blob.name);
        folder.file(`${index}${image.url.split("/").pop()}`, blob);
      })
    );

    zip.generateAsync({ type: "blob" }).then((content) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = "images.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const handleDownload = async (url) => {
    var element = document.createElement("a");
    var file = new Blob([url], { type: "image/*" });
    element.href = URL.createObjectURL(file);
    element.download = "image.jpg";
    element.click();
  };

  if (images.length <= 0) {
    return (
      <div className='text-center text-gray-500 mt-10'>No Images Found</div>
    );
  }

  return (
    <div className='container mx-auto py-8'>
      <h2 className='text-2xl font-bold text-center mb-6'>Your Images</h2>
      <div className='flex justify-center mb-6'>
        <button
          className='bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none'
          onClick={handleDownloadALL}
        >
          Download All
        </button>
      </div>
      <ul className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
        {images.map((image, i) => (
          <li
            key={image.url}
            className='bg-white rounded-lg shadow-md overflow-hidden'
          >
            <img
              src={image.url}
              alt='User Upload'
              className='w-full h-64 object-cover'
            />
            <div className='p-4 flex justify-center items-center space-x-4'>
              <button
                onClick={() => handleDelete(image.url)}
                className='bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 focus:outline-none'
              >
                Delete
              </button>
              <button
                onClick={() => handleDownload(image.url)}
                className='bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none'
              >
                Download
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ImageList;
