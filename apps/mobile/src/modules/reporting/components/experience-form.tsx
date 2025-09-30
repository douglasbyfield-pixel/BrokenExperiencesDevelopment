import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { X, Type, Image, SendHorizonal } from "lucide-react";

interface ExperienceFormProps {
  contentType: "camera" | "upload" | "text";
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  onSubmit: (data: {
    description: string;
    photos: string[];
    categories: string[];
    location?: { lat: number; lng: number };
  }) => void;
  isLoading?: boolean;
  location?: { lat: number; lng: number };
}

export function ExperienceForm({
  contentType,
  photos,
  onPhotosChange,
  onSubmit,
  isLoading = false,
  location,
}: ExperienceFormProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const form = useForm({
    defaultValues: {
      description: "",
      categories: ["Security", "Transportation", "Public space"],
    },
    onSubmit: async ({ value }) => {
      onSubmit({
        description: value.description,
        photos,
        categories: value.categories,
        location,
      });
    },
  });

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  const handleSubmit = () => {
    setShowConfirmation(true);
  };

  const handleFinalSubmit = () => {
    form.handleSubmit();
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    form.setFieldValue("description", value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };


  // Show confirmation view after submit
  if (showConfirmation) {
    return (
      <div className="flex flex-col h-screen bg-white">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-gray-900">Review Your Report</h2>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 space-y-6">
          {/* Image */}
          {contentType !== 'text' && photos.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Image</h3>
              <div className="relative">
                {photos.map((photo, index) => (
                  <div key={photo} className="w-full h-48 rounded-lg overflow-hidden">
                    {photo.startsWith('blob:') ? (
                      <img 
                        src={photo} 
                        alt={`Selected ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Image className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
            <form.Field
              name="description"
              children={(field) => (
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{field.state.value}</p>
              )}
            />
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Categories</h3>
            <form.Field
              name="categories"
              children={(field) => (
                <div className="flex flex-wrap gap-2">
                  {field.state.value.map((category) => (
                    <span
                      key={category}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              )}
            />
          </div>

        </div>

        {/* Actions */}
        <div className="p-4 border-t border-border space-y-3">
          <button
            onClick={handleFinalSubmit}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              'Submit Report'
            )}
          </button>
          <button
            onClick={() => setShowConfirmation(false)}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Edit Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Main content area */}
      <div className="flex-1 relative">
        {/* Show selected content */}
        {contentType !== "text" && photos.length > 0 && (
          <div className="absolute inset-0">
            {photos.map((photo, index) => (
              <div key={photo} className="relative w-full h-full">
                {photo.startsWith("blob:") ? (
                  <img
                    src={photo}
                    alt={`Selected ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Image className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute top-4 right-4 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Empty state for text-only reports */}
        {contentType === "text" && (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <div className="text-center">
              <Type className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Describe your broken experience
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Caption input overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
        <div className="w-full flex justify-between items-center gap-2">
          <form.Field
            name="description"
            children={(field) => (
              <textarea
                id="description"
                value={field.state.value}
                onChange={(e) => {
                  field.handleChange(e.target.value);
                  handleDescriptionChange(e);
                }}
                placeholder="Describe your experience"
                className="w-full min-h-[40px] max-h-[120px] px-4 py-2 rounded-full border border-gray-300 bg-gray-100 text-gray-900 placeholder:text-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent my-2 overflow-hidden"
                style={{ height: '40px' }}
              />
            )}
          />
          <button
            onClick={handleSubmit}
            className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
          >
            <SendHorizonal className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
