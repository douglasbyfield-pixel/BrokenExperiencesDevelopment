import { useState, useEffect } from "react";
import { X, Type, Image, SendHorizonal, MapPin } from "lucide-react";

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
}

export function ExperienceForm({
  contentType,
  photos,
  onPhotosChange,
  onSubmit,
}: ExperienceFormProps) {
  const [description, setDescription] = useState("");
  const [selectedCategories] = useState<string[]>([
    "Security",
    "Transportation",
    "Public space",
  ]);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationName, setLocationName] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  // Automatically capture location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          setSelectedLocation({ lat: latitude, lng: longitude });
          setLocationName(
            `Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          );
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationName("Unable to get location");
        }
      );
    } else {
      setLocationName("Geolocation not supported");
    }
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          setSelectedLocation({ lat: latitude, lng: longitude });
          setLocationName(
            `Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          );
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationName("Unable to get location");
        }
      );
    } else {
      setLocationName("Geolocation not supported");
    }
  };

  const handleSubmit = () => {
    setShowConfirmation(true);
  };

  const handleFinalSubmit = () => {
    onSubmit({
      description,
      photos,
      categories: selectedCategories,
      location: selectedLocation || currentLocation || undefined,
    });
  };

  const handleMapLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    setLocationName(`Selected: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    setShowLocationSelector(false);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  // Show location selector with map
  if (showLocationSelector) {
    return (
      <div className="flex flex-col h-screen bg-white">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowLocationSelector(false)}
              className="text-blue-600 font-medium"
            >
              Cancel
            </button>
            <h2 className="text-lg font-semibold text-gray-900">Select Location</h2>
            <button
              onClick={() => setShowLocationSelector(false)}
              className="text-blue-600 font-medium"
            >
              Done
            </button>
          </div>
        </div>

        {/* Map placeholder */}
        <div className="flex-1 relative">
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Interactive Map</p>
              <p className="text-sm text-gray-500">Tap to select location</p>
            </div>
          </div>
          
          {/* Map interaction overlay */}
          <div 
            className="absolute inset-0 cursor-pointer"
            onClick={(e) => {
              // Simulate map click - in a real implementation, this would get coordinates from the map
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              
              // Convert click position to approximate coordinates
              // This is a simplified example - real implementation would use a proper map library
              const lat = 40.7128 + (y / rect.height - 0.5) * 0.1;
              const lng = -74.0060 + (x / rect.width - 0.5) * 0.1;
              
              handleMapLocationSelect(lat, lng);
            }}
          />
        </div>

        {/* Current location button */}
        <div className="p-4 border-t border-border">
          <button
            onClick={() => {
              getCurrentLocation();
              setShowLocationSelector(false);
            }}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            Use Current Location
          </button>
        </div>
      </div>
    );
  }

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
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{description}</p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map((category) => (
                <span
                  key={category}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700">Location</h3>
              <button
                onClick={() => setShowLocationSelector(true)}
                className="text-blue-600 text-sm font-medium hover:text-blue-700"
              >
                Change Location
              </button>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {selectedLocation ? 'Selected Location' : 'Current Location'}
                </span>
              </div>
              <p className="text-sm text-gray-600">{locationName}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-border space-y-3">
          <button
            onClick={handleFinalSubmit}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Submit Report
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
          <textarea
            id="description"
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Describe your experience"
            className="w-full min-h-[40px] max-h-[120px] px-4 py-2 rounded-full border border-gray-300 bg-gray-100 text-gray-900 placeholder:text-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent my-2 overflow-hidden"
            style={{ height: '40px' }}
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
