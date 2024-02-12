import React, { useState, useEffect } from "react";
import { CameraIcon } from "@heroicons/react/24/solid";
import { useImageStorage } from "./hooks/useImageStorage";

interface Image {
  url: string;
  title?: string;
  description?: string;
}

const App = () => {
  const [images, setImages] = useState<Image[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { storeImage, fetchImages } = useImageStorage();

  useEffect(() => {
    fetchImages().then(setImages);
  }, []);

  useEffect(() => {
    if (!selectedFile) {
      setPreview(null);
      setIsModalOpen(false);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
    setIsModalOpen(true);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setSelectedFile(file);
  };

  const uploadImage = async () => {
    if (selectedFile) {
      await storeImage(selectedFile, title, description);
      const updatedImages = await fetchImages();
      setImages(updatedImages);
      setSelectedFile(null);
      setTitle("");
      setDescription("");
      setIsModalOpen(false);
    }
  };

  const cancelUpload = () => {
    setSelectedFile(null);
    setPreview(null);
    setIsModalOpen(false);
  };

  const handleTitleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleDescriptionBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  const renderEmptyState = () => (
    <div className="fixed inset-0 flex justify-center items-center p-4">
      <div className="text-center">
        <CameraIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">
          No Images Found
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          Upload images to see them here.
        </p>
      </div>
    </div>
  );

  const renderCards = () => {
    if (images.length === 0) {
      return renderEmptyState(); // Render the empty state if there are no images
    }

    return images.map((image, index) => (
      <div key={index} className="w-full">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <img
            src={image.url}
            alt={`Uploaded ${index}`}
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <h3 className="text-lg font-semibold">
              {image.title || "Untitled"}
            </h3>
            <p className="text-gray-600">
              {image.description || "No description"}
            </p>
          </div>
        </div>
      </div>
    ));
  };

  const Modal = ({
    isOpen,
    children,
  }: {
    isOpen: boolean;
    children: React.ReactNode;
  }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-lg p-5 max-w-3xl w-full mx-auto">
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top Navigation Bar */}
      <div className="p-4 shadow-md fixed top-0 left-0 right-0 bg-white z-10">
        <h1 className="text-center text-xl font-bold">Image App</h1>
      </div>

      {/* Main Content */}
      <div className="flex-grow p-5 overflow-y-auto mt-12 mb-8">
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {renderCards()}
        </div>
      </div>

      <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 flex justify-center">
        <label
          htmlFor="image-upload"
          className="cursor-pointer bg-blue-500 text-white font-bold py-2 px-8 rounded-full shadow-lg flex items-center justify-center"
        >
          <CameraIcon className="w-6 h-6 mr-2" />
          <span>Upload</span>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </label>
      </div>

      {/* Modal for Image Preview */}
      <Modal isOpen={isModalOpen}>
        {preview && (
          <>
            <img
              src={preview}
              alt="Preview"
              className="max-w-full max-h-[60vh] object-contain mx-auto block"
            />
            <div>
              <input
                type="text"
                placeholder="Title"
                defaultValue={title}
                onBlur={handleTitleBlur}
                className="text-lg font-semibold w-full rounded mb-1 p-2"
              />
              <textarea
                placeholder="Description"
                defaultValue={description}
                onBlur={handleDescriptionBlur}
                className="text-gray-600 w-full rounded mb-4 p-2"
              />
            </div>
          </>
        )}
        <div className="flex justify-between">
          <button
            onClick={uploadImage}
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
          >
            Upload Image
          </button>
          <button
            onClick={cancelUpload}
            className="bg-red-500 text-white font-bold py-2 px-4 rounded"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default App;
